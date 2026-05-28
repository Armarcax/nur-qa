const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const TEXT_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.py', '.html', '.css', '.json',
  '.md', '.yaml', '.yml', '.xml', '.php', '.c', '.cpp', '.h',
  '.java', '.rb', '.go', '.rs', '.sql', '.sh', '.txt', '.env'
]);

function isTextFile(filePath, buffer) {
  const ext = path.extname(filePath).toLowerCase();
  if (TEXT_EXTENSIONS.has(ext)) return true;

  if (buffer) {
    for (let i = 0; i < Math.min(buffer.length, 1024); i++) {
      if (buffer[i] === 0) return false;
    }
    return true;
  }
  return false;
}

// Priority Score: Higher is more important
const getPriority = (filename) => {
  if (filename.includes('app.') || filename.includes('index.') || filename.includes('main.')) return 10;
  if (filename.includes('controller') || filename.includes('route')) return 8;
  if (filename.includes('component')) return 7;
  if (filename.includes('util') || filename.includes('helper')) return 5;
  if (filename.includes('config')) return 3;
  return 1;
};

async function processUploadedFile(buffer) {
  const tempId = uuidv4();
  const tempDir = path.join(__dirname, '../temp', tempId);
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  const zipPath = path.join(tempDir, 'project.zip');

  try {
    fs.writeFileSync(zipPath, buffer);
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(tempDir, true);

    const codebase = [];
    readDirectoryRecursive(tempDir, tempDir, codebase);

    fs.rmSync(tempDir, { recursive: true, force: true });

    // For AI Context: Sort text files by priority
    const aiContextFiles = codebase.filter(f => !f.skipAI);
    aiContextFiles.sort((a, b) => {
      const prioA = getPriority(a.path);
      const prioB = getPriority(b.path);
      return prioB - prioA;
    });

    // Limit AI context to top 15 most relevant files to save tokens
    const selectedFiles = aiContextFiles.slice(0, 15);

    console.log(`AI Context: ${selectedFiles.length} files. Total files: ${codebase.length}`);

    return {
      allFiles: codebase,
      aiContext: selectedFiles
    };

  } catch (error) {
    if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    throw new Error(`Failed to process ZIP: ${error.message}`);
  }
}

function readDirectoryRecursive(rootDir, currentDir, codebase) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const filePath = path.join(currentDir, file);
    const stat = fs.statSync(filePath);
    const relativePath = path.relative(rootDir, filePath);

    if (stat.isDirectory()) {
      if (['node_modules', '.git', '.next', 'dist', 'build'].includes(file)) continue;
      readDirectoryRecursive(rootDir, filePath, codebase);
    } else {
      try {
        const buffer = fs.readFileSync(filePath);
        const isText = isTextFile(file, buffer);
        let content = null;
        let skipAI = true;

        if (isText) {
          content = buffer.toString('utf-8');
          // AI Context Rule: Max 150KB for AI context
          if (buffer.length < 150000) {
            skipAI = false;
          } else {
            console.log(`Skipping ${relativePath} from AI context: too large (${(buffer.length/1024).toFixed(1)}KB)`);
          }
        } else {
          console.log(`Skipping binary file ${relativePath} from AI context`);
        }

        codebase.push({
          path: relativePath,
          content: content,
          buffer: buffer,
          isText: isText,
          size: buffer.length,
          skipAI: skipAI
        });
      } catch (e) {
        console.warn(`Skip: ${filePath}`, e.message);
      }
    }
  }
}

module.exports = { processUploadedFile };
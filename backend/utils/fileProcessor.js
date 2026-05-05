const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const ALLOWED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json', '.py'];

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

    // SMART SORTING: Sort by priority, then take top 20 files
    codebase.sort((a, b) => {
      const prioA = getPriority(a.path);
      const prioB = getPriority(b.path);
      return prioB - prioA; // Descending order
    });

    // Limit to top 20 files to save tokens
    const selectedFiles = codebase.slice(0, 10);
    
    console.log(`Selected ${selectedFiles.length} most relevant files out of ${codebase.length}`);
    return selectedFiles;

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
    if (stat.isDirectory()) {
      if (['node_modules', '.git', '.next', 'dist', 'build'].includes(file)) continue;
      readDirectoryRecursive(rootDir, filePath, codebase);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (ALLOWED_EXTENSIONS.includes(ext)) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          if (content.length < 15000) { // Skip huge files
            codebase.push({
              path: path.relative(rootDir, filePath),
              content: content
            });
          }
        } catch (e) { console.warn(`Skip: ${filePath}`); }
      }
    }
  }
}

module.exports = { processUploadedFile };
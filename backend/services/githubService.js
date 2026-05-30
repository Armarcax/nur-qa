const axios = require('axios');
const AdmZip = require('adm-zip');
const path = require('path');

const TEXT_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.py', '.rb', '.java',
  '.kt', '.go', '.rs', '.c', '.cpp', '.h', '.hpp', '.cs', '.swift',
  '.dart', '.lua', '.php', '.sh', '.ps1', '.html', '.htm', '.css',
  '.scss', '.sass', '.less', '.vue', '.svelte', '.astro', '.json',
  '.xml', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.md',
  '.txt', '.markdown', '.sql', '.graphql', '.prisma', '.dockerfile',
  '.gitignore', '.eslintrc', '.prettierrc', '.env', '.env.example'
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

async function analyzeGithubRepo(owner, repo, branch = 'main') {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/zipball/${branch}`;
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== 'dummy') {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    console.log(`GitHub: Downloading ${owner}/${repo}...`);
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: headers,
      timeout: 30000
    });
    const zipBuffer = Buffer.from(response.data);
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();
    const codebase = [];

    zipEntries.forEach(entry => {
      if (entry.isDirectory) return;
      const buffer = entry.getData();
      const isText = isTextFile(entry.entryName, buffer);
      let content = null;
      let skipAI = true;

      if (isText && buffer.length < 150000) {
        content = buffer.toString('utf8');
        skipAI = false;
      }

      codebase.push({
        path: entry.entryName,
        content: content,
        skipAI: skipAI
      });
    });

    const filesForAI = codebase.filter(f => !f.skipAI).slice(0, 20);
    return { filesForAI, zipBuffer };
  } catch (error) {
    console.error('GitHub Helper Error:', error.message);
    throw new Error(`GitHub error: ${error.message}`);
  }
}

module.exports = { analyzeGithubRepo };

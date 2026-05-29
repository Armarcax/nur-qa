require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const AdmZip = require('adm-zip');
const { processUploadedFile, processDirectFiles } = require('./utils/fileProcessor');
const { generateTestsAndBugs } = require('./services/aiManager');
const { getRepoZip } = require('./services/githubService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Configure Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// Helper: Create fixed ZIP
function createFixedZip(allFiles, fixedFiles) {
  const newZip = new AdmZip();
  allFiles.forEach(file => {
    newZip.addFile(file.path, file.buffer);
  });
  if (fixedFiles && fixedFiles.length > 0) {
    fixedFiles.forEach(fixedFile => {
      newZip.addFile(fixedFile.path, Buffer.from(fixedFile.content));
    });
  }
  return newZip.toBuffer();
}

// Helper: Calculate Stats
function calculateStats(results) {
  return {
    errors: results.issues.filter(i => i.type === 'error').length,
    warnings: results.issues.filter(i => i.type === 'warning').length,
    performance: results.issues.filter(i => i.type === 'performance').length,
    score: Math.max(0, 100 - (results.issues.length * 5)),
    coverage: Math.min(100, Math.max(40, 100 - (results.issues.filter(i => i.type === 'warning').length * 2)))
  };
}

// --- Route 1: ZIP Upload ---
app.post('/api/analyze', upload.single('project'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const { allFiles, aiContext } = await processUploadedFile(req.file.buffer);
    if (aiContext.length === 0) return res.status(400).json({ error: "No valid code files found" });

    const results = await generateTestsAndBugs(aiContext);

    if (results.fixedFiles && results.fixedFiles.length > 0) {
      const zipBuffer = createFixedZip(allFiles, results.fixedFiles);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename=fixed_project.zip');
      res.setHeader('X-QA-Report', JSON.stringify({ issues: results.issues, stats: calculateStats(results) }));
      return res.send(zipBuffer);
    }

    res.json({ success: true, report: { issues: results.issues, stats: calculateStats(results) } });
  } catch (error) {
    console.error("ZIP Analysis Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- Route 2: Direct Multi-File Upload ---
app.post('/api/analyze-direct', upload.array('files', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: "No files uploaded" });
    const { allFiles, aiContext } = await processDirectFiles(req.files);
    if (aiContext.length === 0) return res.status(400).json({ error: "No valid code files identified" });

    const results = await generateTestsAndBugs(aiContext);

    if (results.fixedFiles && results.fixedFiles.length > 0) {
      const zipBuffer = createFixedZip(allFiles, results.fixedFiles);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename=fixed_files.zip');
      res.setHeader('X-QA-Report', JSON.stringify({ issues: results.issues, stats: calculateStats(results) }));
      return res.send(zipBuffer);
    }

    res.json({ success: true, report: { issues: results.issues, stats: calculateStats(results) } });
  } catch (error) {
    console.error("Direct Upload Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- Route 3: GitHub Repo ---
app.post('/api/analyze-github', async (req, res) => {
  try {
    const { owner, repo, branch } = req.body;
    if (!owner || !repo) return res.status(400).json({ error: "Owner and Repo are required" });
    const zipBuffer = await getRepoZip(owner, repo, branch || 'main');
    const { allFiles, aiContext } = await processUploadedFile(zipBuffer);
    if (aiContext.length === 0) return res.status(400).json({ error: "No code files found" });

    const results = await generateTestsAndBugs(aiContext);

    if (results.fixedFiles && results.fixedFiles.length > 0) {
      const finalZip = createFixedZip(allFiles, results.fixedFiles);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=${repo}_fixed.zip`);
      res.setHeader('X-QA-Report', JSON.stringify({ issues: results.issues, stats: calculateStats(results) }));
      return res.send(finalZip);
    }

    res.json({ success: true, report: { issues: results.issues, stats: calculateStats(results) } });
  } catch (error) {
    console.error("GitHub Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => console.log(`NUR QA Backend running on http://localhost:${PORT}`));

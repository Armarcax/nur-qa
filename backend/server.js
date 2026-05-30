const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { processZipFile, processDirectFiles } = require('./utils/fileProcessor');
const { analyzeCodebase } = require('./services/aiManager');
const { analyzeGithubRepo } = require('./services/githubService');

const app = express();
const PORT = process.env.PORT || 5000;

// Session Management for Downloads
// Map<sessionId, { zipBuffer: Buffer, timestamp: number }>
const SESSION_MAP = new Map();
const SESSION_LIMIT = 50;
const SESSION_TTL = 10 * 60 * 1000; // 10 minutes

// Cleanup old sessions every minute
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of SESSION_MAP.entries()) {
    if (now - session.timestamp > SESSION_TTL) {
      SESSION_MAP.delete(id);
    }
  }
}, 60000);

app.use(cors({
  origin: '*',
  exposedHeaders: ['Content-Disposition']
}));
app.use(express.json());

const upload = multer({ dest: 'temp/' });

// Helper to store session
const createDownloadSession = (zipBuffer) => {
  if (SESSION_MAP.size >= SESSION_LIMIT) {
    const oldestKey = SESSION_MAP.keys().next().value;
    SESSION_MAP.delete(oldestKey);
  }
  const sessionId = uuidv4();
  SESSION_MAP.set(sessionId, { zipBuffer, timestamp: Date.now() });
  return sessionId;
};

// 1. Analyze ZIP Project
app.post('/api/analyze', upload.single('project'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No project file uploaded.' });

    const { filesForAI, zipBuffer } = await processZipFile(req.file.path);
    const analysisReport = await analyzeCodebase(filesForAI);

    const finalZip = await processZipFile(req.file.path, analysisReport.fixedFiles);
    const sessionId = createDownloadSession(finalZip.zipBuffer);

    res.json({
      success: true,
      report: {
        issues: analysisReport.issues,
        changelog: analysisReport.changelog,
        stats: analysisReport.stats
      },
      downloadReady: true,
      sessionId
    });
  } catch (error) {
    console.error('ZIP Analysis Error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (req.file?.path) fs.unlinkSync(req.file.path);
  }
});

// 2. Analyze Direct Files (Multi-upload)
app.post('/api/analyze-direct', upload.array('files', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded.' });

    const { filesForAI, zipBuffer } = await processDirectFiles(req.files);
    const analysisReport = await analyzeCodebase(filesForAI);

    const finalZip = await processDirectFiles(req.files, analysisReport.fixedFiles);
    const sessionId = createDownloadSession(finalZip.zipBuffer);

    res.json({
      success: true,
      report: {
        issues: analysisReport.issues,
        changelog: analysisReport.changelog,
        stats: analysisReport.stats
      },
      downloadReady: true,
      sessionId
    });
  } catch (error) {
    console.error('Direct Analysis Error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    req.files?.forEach(f => fs.unlinkSync(f.path));
  }
});

// 3. Analyze GitHub Repository
app.post('/api/analyze-github', async (req, res) => {
  const { owner, repo } = req.body;
  if (!owner || !repo) return res.status(400).json({ error: 'Owner and Repo are required.' });

  try {
    const { filesForAI, zipBuffer } = await analyzeGithubRepo(owner, repo);
    const analysisReport = await analyzeCodebase(filesForAI);

    // For GitHub, we regenerate the ZIP with fixes if possible, or just send the original with report
    // In this MVP, we use the original zipBuffer as base
    const sessionId = createDownloadSession(zipBuffer);

    res.json({
      success: true,
      report: {
        issues: analysisReport.issues,
        changelog: analysisReport.changelog,
        stats: analysisReport.stats
      },
      downloadReady: true,
      sessionId
    });
  } catch (error) {
    console.error('GitHub Analysis Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Download Session-based Fix
app.get('/api/download-fix/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = SESSION_MAP.get(sessionId);

  if (!session) {
    return res.status(404).send('Download session expired or not found.');
  }

  res.set({
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="fixed_project_${Date.now()}.zip"`,
    'Content-Length': session.zipBuffer.length
  });

  res.send(session.zipBuffer);
  SESSION_MAP.delete(sessionId); // One-time download
});

app.listen(PORT, () => {
  console.log(`NUR QA Backend v2.1 running on port ${PORT}`);
});

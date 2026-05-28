require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const AdmZip = require('adm-zip');
const { v4: uuidv4 } = require('uuid');
const { processUploadedFile } = require('./utils/fileProcessor');
const { generateTestsAndBugs } = require('./services/aiManager');
const { getRepoZip } = require('./services/githubService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Session storage for ZIP files
const sessions = new Map();

// Session cleanup (10 min TTL)
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.timestamp > 10 * 60 * 1000) {
      sessions.delete(id);
    }
  }
}, 60000);

// Configure Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  }
});

// Helper to create fixed ZIP
function createFixedZip(allFiles, fixedFiles) {
  const newZip = new AdmZip();

  // Add all original files (using buffers to preserve binaries)
  allFiles.forEach(file => {
    newZip.addFile(file.path, file.buffer);
  });

  // Overwrite with fixed files
  if (fixedFiles && fixedFiles.length > 0) {
    fixedFiles.forEach(fixedFile => {
      newZip.addFile(fixedFile.path, Buffer.from(fixedFile.content));
    });
  }

  return newZip.toBuffer();
}

// --- Route 1: Upload ZIP ---
app.post('/api/analyze', upload.single('project'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    console.log(`Received file: ${req.file.originalname}`);
    const { allFiles, aiContext } = await processUploadedFile(req.file.buffer);

    if (aiContext.length === 0) return res.status(400).json({ error: "No valid code files found in ZIP for AI analysis" });

    const results = await generateTestsAndBugs(aiContext);

    // Calculate Stats
    const stats = {
      errors: results.issues.filter(i => i.type === 'error').length,
      warnings: results.issues.filter(i => i.type === 'warning').length,
      performance: results.issues.filter(i => i.type === 'performance').length,
      score: Math.max(0, 100 - (results.issues.length * 5)),
      coverage: Math.min(100, Math.max(40, 100 - (results.issues.filter(i => i.type === 'warning').length * 2)))
    };

    const zipBuffer = createFixedZip(allFiles, results.fixedFiles);
    const sessionId = uuidv4();

    sessions.set(sessionId, {
      zipBuffer,
      timestamp: Date.now()
    });

    res.json({
      success: true,
      sessionId: sessionId,
      report: {
        issues: results.issues,
        changelog: results.changelog || [],
        stats: stats
      }
    });

  } catch (error) {
    console.error("Server Error: ", error);
    res.status(500).json({ error: error.message });
  }
});

// --- Route 2: Analyze GitHub Repo ---
app.post('/api/analyze-github', async (req, res) => {
  try {
    const { owner, repo, branch } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({ error: "Owner and Repo are required" });
    }

    console.log(`Received GitHub request for ${owner}/${repo}`);

    const zipBuffer = await getRepoZip(owner, repo, branch || 'main');
    const { allFiles, aiContext } = await processUploadedFile(zipBuffer);

    if (aiContext.length === 0) {
      return res.status(400).json({ error: "No valid code files found in Repo for AI analysis" });
    }

    const results = await generateTestsAndBugs(aiContext);

    const stats = {
      errors: results.issues.filter(i => i.type === 'error').length,
      warnings: results.issues.filter(i => i.type === 'warning').length,
      performance: results.issues.filter(i => i.type === 'performance').length,
      score: Math.max(0, 100 - (results.issues.length * 5)),
      coverage: Math.min(100, Math.max(40, 100 - (results.issues.filter(i => i.type === 'warning').length * 2)))
    };

    const finalZipBuffer = createFixedZip(allFiles, results.fixedFiles);
    const sessionId = uuidv4();

    sessions.set(sessionId, {
      zipBuffer: finalZipBuffer,
      timestamp: Date.now()
    });

    res.json({
      success: true,
      sessionId: sessionId,
      report: {
        issues: results.issues,
        changelog: results.changelog || [],
        stats: stats
      }
    });

  } catch (error) {
    console.error("GitHub Analysis Error: ", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// --- Route 3: Download Fixed ZIP ---
app.get('/api/download-fix', (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(404).json({ error: "Session not found or expired" });
  }

  const session = sessions.get(sessionId);

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=fixed_project.zip');
  res.send(session.zipBuffer);

  // Remove session after download
  sessions.delete(sessionId);
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`NUR QA Backend running on http://localhost:${PORT}`);
});
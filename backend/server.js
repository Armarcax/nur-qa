require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const AdmZip = require('adm-zip');
const { processUploadedFile } = require('./utils/fileProcessor');
const { generateTestsAndBugs } = require('./services/aiManager');
const { getRepoZip } = require('./services/githubService'); // Նոր import

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// --- Existing Route: Upload ZIP ---
app.post('/api/analyze', upload.single('project'), async (req, res) => {
  // ... (քո existing code-ը նույնն է) ...
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    console.log(`Received file: ${req.file.originalname}`);
    const codebase = await processUploadedFile(req.file.buffer);
    if (codebase.length === 0) return res.status(400).json({ error: "No valid code files found in ZIP" });
    
    const results = await generateTestsAndBugs(codebase);
    
    if (results.fixedFiles && results.fixedFiles.length > 0) {
      const newZip = new AdmZip();
      codebase.forEach(file => newZip.addFile(file.path, Buffer.from(file.content)));
      results.fixedFiles.forEach(fixedFile => newZip.addFile(fixedFile.path, Buffer.from(fixedFile.content)));
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="NUR_QA_Fixed_Project.zip"');
      return res.send(newZip.toBuffer());
    } else {
      res.json(results);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- NEW Route: Analyze GitHub Repo ---
app.post('/api/analyze-github', async (req, res) => {
  try {
    const { owner, repo, branch } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({ error: "Owner and Repo are required" });
    }

    console.log(`Received GitHub request for ${owner}/${repo}`);

    // 1. Get ZIP from GitHub
    const zipBuffer = await getRepoZip(owner, repo, branch || 'main');

    // 2. Process ZIP (same as file upload)
    console.log("Processing GitHub ZIP...");
    const codebase = await processUploadedFile(zipBuffer);
    
    if (codebase.length === 0) {
      return res.status(400).json({ error: "No valid code files found in Repo" });
    }

    console.log(`Found ${codebase.length} files. Sending to AI...`);

    // 3. AI Analysis
    const results = await generateTestsAndBugs(codebase);

    console.log("Analysis complete.");

    // 4. Return Fixed ZIP or JSON
    if (results.fixedFiles && results.fixedFiles.length > 0) {
      const newZip = new AdmZip();
      
      codebase.forEach(file => {
        newZip.addFile(file.path, Buffer.from(file.content));
      });

      results.fixedFiles.forEach(fixedFile => {
        newZip.addFile(fixedFile.path, Buffer.from(fixedFile.content));
      });

      const zipBuffer = newZip.toBuffer();
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${repo}-fixed.zip"`);
      res.send(zipBuffer);
    } else {
      res.json(results);
    }

  } catch (error) {
    console.error("GitHub Analysis Error: ", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`NUR QA Backend running on http://localhost:${PORT}`);
});
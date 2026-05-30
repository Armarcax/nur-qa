const Groq = require('groq-sdk');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
let Ollama;
try { Ollama = require('ollama').Ollama; } catch (e) { }

const groqClient = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const openRouterClient = process.env.OPENROUTER_API_KEY ? new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
}) : null;
const geminiClient = process.env.GOOGLE_GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY) : null;
const ollamaClient = (Ollama && process.env.NODE_ENV !== 'test') ? new Ollama({ host: 'http://localhost:11434' }) : null;

const SYSTEM_PROMPT = `
You are NUR QA, an expert Senior Software Engineer.
Analyze the provided codebase and return a STRICT JSON object.

The JSON must have this structure:
{
  "issues": [
    {
      "type": "error" | "warning" | "performance",
      "file": "path/to/file",
      "line": number,
      "message": "issue description",
      "suggestion": "how to fix",
      "fix": "code snippet"
    }
  ],
  "fixedFiles": [
    {
      "file": "path/to/file",
      "content": "FULL_FIXED_CONTENT"
    }
  ],
  "changelog": [
    {
      "file": "path/to/file",
      "bugType": "error" | "warning",
      "fixApplied": "description",
      "status": "fixed"
    }
  ],
  "stats": {
    "errors": number,
    "warnings": number,
    "performance": number,
    "score": number,
    "coverage": number
  }
}
Return RAW JSON only. No markdown blocks.
`;

async function analyzeWithGroq(codeContext) {
  if (!groqClient) return null;
  const completion = await groqClient.chat.completions.create({
    messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: codeContext }],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" }
  });
  return JSON.parse(completion.choices[0].message.content);
}

async function analyzeWithOpenRouter(codeContext) {
  if (!openRouterClient) return null;
  const completion = await openRouterClient.chat.completions.create({
    messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: codeContext }],
    model: "qwen/qwen-2.5-72b-instruct",
    response_format: { type: "json_object" }
  });
  return JSON.parse(completion.choices[0].message.content);
}

async function analyzeWithGemini(codeContext) {
  if (!geminiClient) return null;
  const model = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(`${SYSTEM_PROMPT}\n\n${codeContext}`);
  const text = result.response.text();
  const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonStr);
}

async function analyzeWithOllama(codeContext) {
  if (!ollamaClient) return null;
  const response = await ollamaClient.chat({
    model: 'qwen2.5-coder:3b',
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: codeContext }],
    format: 'json',
  });
  return JSON.parse(response.message.content);
}

async function analyzeCodebase(aiContext) {
  let codeContext = "";
  for (const file of aiContext) {
    if (!file.content) continue;
    codeContext += `\n--- FILE: ${file.path} ---\n${file.content}\n`;
  }

  if (process.env.NODE_ENV === 'test' || !codeContext.trim()) {
    return {
      issues: [],
      fixedFiles: [],
      changelog: [],
      stats: { errors: 0, warnings: 0, performance: 0, score: 100, coverage: 100 }
    };
  }

  const providers = [analyzeWithGroq, analyzeWithOpenRouter, analyzeWithGemini, analyzeWithOllama];
  for (const provider of providers) {
    try {
      const result = await provider(codeContext);
      if (result && (result.issues || result.fixedFiles)) return result;
    } catch (e) {
      console.warn(`AI Provider failed: ${e.message}`);
    }
  }

  return {
    issues: [],
    fixedFiles: [],
    changelog: [],
    stats: { errors: 0, warnings: 0, performance: 0, score: 0, coverage: 0 }
  };
}

module.exports = { analyzeCodebase };

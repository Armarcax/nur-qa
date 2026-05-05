const Groq = require('groq-sdk');
const OpenAI = require('openai'); // For OpenRouter
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Ollama } = require('ollama'); // Local AI

// Initialize Clients
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
const openRouterClient = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});
const geminiClient = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const ollamaClient = new Ollama({ host: 'http://localhost:11434' });

const SYSTEM_PROMPT = `
You are NUR QA, an expert Senior Software Engineer.
Analyze the provided codebase and return a STRICT JSON object.

The JSON must have this structure:
{
  "issues": [
    {
      "type": "error" | "warning" | "performance",
      "file": "relative/path/to/file",
      "line": number,
      "message": "Clear description of the issue",
      "suggestion": "How to fix it",
      "fix": "Code snippet showing the specific fix"
    }
  ],
  "fixedFiles": [
    {
      "path": "relative/path/to/file",
      "content": "THE FULL CONTENT OF THE FILE WITH ALL FIXES APPLIED"
    }
  ]
}

IMPORTANT RULES:
1. For every file that has an error or warning, you MUST include it in the "fixedFiles" array with the FULL corrected content.
2. If a file is perfect, do not include it in "fixedFiles".
3. Focus on: Runtime errors, Security vulnerabilities, Performance issues.
4. DO NOT use markdown code blocks (like \`\`\`json). Return RAW JSON only.
5. If no issues are found, return { "issues": [], "fixedFiles": [] }.
`;

async function analyzeWithGroq(codeContext) {
  try {
    const completion = await groqClient.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Analyze and fix this code:\n\n${codeContext}` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 8192,
      response_format: { type: "json_object" }
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (e) {
    console.warn("Groq failed:", e.message);
    throw e;
  }
}

async function analyzeWithOpenRouter(codeContext) {
  try {
    const completion = await openRouterClient.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Analyze and fix this code:\n\n${codeContext}` }
      ],
      model: "qwen/qwen-2.5-72b-instruct",
      temperature: 0.2,
      max_tokens: 8192,
      response_format: { type: "json_object" }
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (e) {
    console.warn("OpenRouter failed:", e.message);
    throw e;
  }
}

async function analyzeWithGemini(codeContext) {
  try {
    const model = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nAnalyze and fix this code:\n\n${codeContext}`);
    const text = result.response.text();
    
    let jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      jsonStr = jsonStr.substring(start, end + 1);
    }

    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Gemini failed:", e.message);
    throw e;
  }
}

// --- NEW: Local Ollama Function ---
async function analyzeWithOllama(codeContext) {
  try {
    console.log("💻 Trying Local Ollama (Qwen 2.5 Coder 3B)...");
    const response = await ollamaClient.chat({
      model: 'qwen2.5-coder:3b',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze and fix this code:\n\n${codeContext}` }
      ],
      format: 'json', // Ollama supports JSON format natively
    });
    
    return JSON.parse(response.message.content);
  } catch (e) {
    console.warn("Ollama failed:", e.message);
    throw e;
  }
}

/**
 * Main Function: Tries Groq -> OpenRouter -> Gemini -> Ollama
 */
async function generateTestsAndBugs(codebase) {
  let codeContext = "";
  let totalChars = 0;
  const CHAR_LIMIT = 25000; // Reduced for local AI stability

  for (const file of codebase) {
    if (file.content.length > 5000) continue; // Skip huge files
    const fileStr = `\n--- FILE: ${file.path} ---\n${file.content}\n`;
    if (totalChars + fileStr.length > CHAR_LIMIT) break;
    codeContext += fileStr;
    totalChars += fileStr.length;
  }

  if (!codeContext.trim()) throw new Error("No code to analyze.");

  // Waterfall Logic
  try {
    console.log("🚀 Trying Groq...");
    return await analyzeWithGroq(codeContext);
  } catch (groqError) {
    try {
      console.log("🔄 Trying OpenRouter...");
      return await analyzeWithOpenRouter(codeContext);
    } catch (orError) {
      try {
        console.log("🌐 Trying Gemini...");
        return await analyzeWithGemini(codeContext);
      } catch (geminiError) {
        try {
          console.log("🏠 Trying Local Ollama...");
          return await analyzeWithOllama(codeContext);
        } catch (ollamaError) {
          throw new Error("All AI providers failed.");
        }
      }
    }
  }
}

module.exports = { generateTestsAndBugs };
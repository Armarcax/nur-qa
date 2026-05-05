const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Sends codebase to Groq AI for analysis and fixing
 */
async function generateTestsAndBugs(codebase) {
  // Construct a concise representation of the codebase
  let codeContext = "";
  let totalChars = 0;
  
  // Սահմանափակում ենք չափսը, որպեսզի չգերազանցենք Token Limit-ը (12k TPM)
  const CHAR_LIMIT = 35000; 
  const MAX_FILES = 15; 

  // Ֆիլտրում ենք ֆայլերը՝ նախապատվությունը տալով կոդի ֆայլերին
  const sortedCodebase = codebase.sort((a, b) => {
    const extA = a.path.split('.').pop();
    const extB = b.path.split('.').pop();
    const priority = ['js', 'ts', 'jsx', 'tsx', 'py', 'go', 'rs'];
    return priority.indexOf(extA) - priority.indexOf(extB);
  });

  let filesAdded = 0;

  for (const file of sortedCodebase) {
    if (filesAdded >= MAX_FILES) break;
    
    // Բաց թողնում ենք շատ մեծ ֆայլերը (>10KB)
    if (file.content.length > 10000) continue;

    const fileStr = `\n--- FILE: ${file.path} ---\n${file.content}\n`;
    
    if (totalChars + fileStr.length > CHAR_LIMIT) {
      console.log(`Token limit reached. Stopped adding files at ${file.path}`);
      break;
    }
    
    codeContext += fileStr;
    totalChars += fileStr.length;
    filesAdded++;
  }

  if (!codeContext.trim()) {
    throw new Error("No valid code files found in the project or project is too large.");
  }

  const systemPrompt = `
    You are NUR QA, an expert Senior Software Engineer.
    Analyze the provided codebase and return a JSON object.
    
    IMPORTANT: For every file that has an error or warning, you MUST provide the FULL corrected content of that file in the 'fixedFiles' array.
    
    The JSON structure must be:
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

    Focus on:
    1. Runtime errors.
    2. Security vulnerabilities.
    3. Performance issues.
    
    If no issues are found, return { "issues": [], "fixedFiles": [] }.
  `;

  const userPrompt = `
    Analyze and fix the following codebase:
    
    ${codeContext}
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
       messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 8192, // Մեծացնում ենք max_tokens, որպեսզի ամբողջական ֆայլերը տեղավորվեն
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("Empty response from AI");
    }

    // Parse JSON
    const result = JSON.parse(content);
    
    // Validate structure
    if (!result.issues) result.issues = [];
    if (!result.fixedFiles) result.fixedFiles = [];

    return result;

  } catch (error) {
    console.error("Groq API Error: ", error);
    throw new Error(`AI Analysis failed: ${error.message}`);
  }
}

module.exports = {
  generateTestsAndBugs
};
# NUR QA - Intelligent Testing Engine 🚀

NUR QA is an advanced AI-powered quality assurance tool that analyzes your codebase, detects bugs, suggests fixes, and automatically generates corrected project files. It utilizes a hybrid AI architecture to ensure reliability and speed.

## ✨ Features

- **🤖 Hybrid AI Architecture**: Seamlessly switches between Groq (Llama 3), OpenRouter (Qwen 2.5), Google Gemini, and Local Ollama models.
- **🛠️ Auto-Fix & ZIP Download**: Automatically corrects detected issues and provides a downloadable ZIP file with fixed code.
- **📂 Smart File Selection**: Intelligently selects the most relevant files for analysis to optimize token usage.
- **🌍 Multi-Language Support**: Interface available in English, Armenian, and Russian.
- **🎨 Modern UI**: Dark/Light mode with real-time scanning animations.
- **🔒 Secure**: Local processing options via Ollama ensure your code never leaves your machine if desired.

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- API Keys (Optional but recommended for best performance):
  - [Groq API Key](https://console.groq.com)
  - [OpenRouter API Key](https://openrouter.ai)
  - [Google Gemini API Key](https://aistudio.google.com)
- [Ollama](https://ollama.com) (For local AI fallback)

## 🛠️ Installation & Setup

### 1. Backend Setup

```bash
cd backend
npm install
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import {
  UploadCloud,
  Github,
  CheckCircle2,
  AlertTriangle,
  Bug,
  Code2,
  Zap,
  Settings,
  Globe,
  Moon,
  Sun,
  ChevronRight,
  Terminal,
  Cpu,
  ShieldCheck,
  Loader2,
  RefreshCw,
  X,
  FileCode,
  Send,
  Download,
  FileText,
  FileJson,
  Layers
} from 'lucide-react';

import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const THEMES = { DARK: 'dark', LIGHT: 'light' };
const LANGUAGES = { EN: 'en', HY: 'hy', RU: 'ru' };

const TRANSLATIONS = {
  en: {
    appName: "NUR QA", tagline: "Intelligent Testing Engine", uploadProject: "Upload Project (ZIP)", uploadFiles: "Upload Files (Multi)", connectGithub: "Analyze GitHub Repo", analyzing: "Analyzing...", dashboard: "Dashboard", results: "Test Results", startScan: "Start Analysis", passed: "Passed", failed: "Failed", welcomeMessage: "Ready to optimize your code?", processing: "Processing with AI...", errorTitle: "Analysis Failed", retry: "Try Again", chatPlaceholder: "Ask NUR anything..."
  },
  hy: {
    appName: "NUR QA", tagline: "Խելացի թեստավորման համակարգ", uploadProject: "Վերբեռնել նախագիծը (ZIP)", uploadFiles: "Վերբեռնել ֆայլեր (Multi)", connectGithub: "Վերլուծել GitHub", analyzing: "Վերլուծություն...", dashboard: "Կառավարման վահանակ", results: "Արդյունքներ", startScan: "Սկսել վերլուծությունը", passed: "Հաջողված", failed: "Ձախողված", welcomeMessage: "Պատրա՞ստ եք օպտիմալացնել կոդը:", processing: "Մշակվում է AI-ով...", errorTitle: "Վերլուծությունը ձախողվեց", retry: "Կրկին փորձել", chatPlaceholder: "Հարցրու NUR-ին..."
  },
  ru: {
    appName: "NUR QA", tagline: "Интеллектуальный движок тестирования", uploadProject: "Загрузить проект (ZIP)", uploadFiles: "Загрузить файлы (Multi)", connectGithub: "Анализировать GitHub", analyzing: "Анализ...", dashboard: "Панель управления", results: "Результаты", startScan: "Начать анализ", passed: "Успешно", failed: "Ошибка", welcomeMessage: "Готовы оптимизировать ваш код?", processing: "Обработка через AI...", errorTitle: "Анализ не удался", retry: "Попробовать снова", chatPlaceholder: "Спросите NUR..."
  }
};

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, icon: Icon }) => {
  const variants = {
    primary: "bg-gradient-to-r from-red-600 to-red-800 text-white hover:scale-[1.02] shadow-lg shadow-red-900/20 active:scale-95",
    secondary: "bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10",
    outline: "border border-red-500/50 text-red-400 hover:bg-red-500/10"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {Icon && <Icon size={18} />} {children}
    </button>
  );
};

const Card = ({ children, className = "", delay = 0 }) => (
  <div className={`bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl animate-fade-in-up ${className}`} style={{ animationDelay: `${delay}s` }}>
    {children}
  </div>
);

const Badge = ({ type, text }) => {
  const colors = { error: "bg-red-500/20 text-red-400", warning: "bg-yellow-500/20 text-yellow-400", success: "bg-green-500/20 text-green-400" };
  return <span className={`px-2 py-1 rounded-md text-xs font-mono border border-white/10 ${colors[type] || "text-purple-400"}`}>{text}</span>;
};

export default function NurQAApp() {
  const [theme, setTheme] = useState(THEMES.DARK);
  const [lang, setLang] = useState(LANGUAGES.EN);
  const [view, setView] = useState('landing');
  const [projectName, setProjectName] = useState("");
  const [scanProgress, setScanProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState("");
  const [results, setResults] = useState([]);
  const [changelog, setChangelog] = useState([]);
  const [stats, setStats] = useState({ errors: 0, warnings: 0, performance: 0, score: 0, coverage: 0 });
  const [activeTab, setActiveTab] = useState('issues');
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadSessionId, setDownloadSessionId] = useState(null);

  const [githubUrl, setGithubUrl] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  const t = TRANSLATIONS[lang];
  const isDark = theme === THEMES.DARK;

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);
    const input = chatInput;
    setChatInput("");
    setIsTyping(true);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'ai', content: `I've analyzed your project architecture. Regarding "${input}", I recommend ensuring that your data fetching logic includes proper error boundaries and loading states.` }]);
      setIsTyping(false);
    }, 1500);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`NUR QA Analysis Report: ${projectName}`, 14, 15);
    doc.autoTable({
      head: [['File', 'Line', 'Type', 'Issue', 'Suggestion']],
      body: results.map(r => [r.file, r.line, r.type?.toUpperCase(), r.message, r.suggestion]),
      startY: 20,
      styles: { fontSize: 8 }
    });
    doc.save(`NUR_QA_Report_${projectName.replace(/\s+/g, '_')}.pdf`);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(results.map(r => ({
      File: r.file,
      Line: r.line,
      Type: r.type,
      Issue: r.message,
      Suggestion: r.suggestion,
      Fix: r.fix
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Issues");
    XLSX.writeFile(wb, `NUR_QA_Report_${projectName.replace(/\s+/g, '_')}.xlsx`);
  };

  const exportToWord = () => {
    const content = `
      <html>
        <head><meta charset="utf-8"></head>
        <body>
          <h1>NUR QA Analysis Report: ${projectName}</h1>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th>File</th><th>Line</th><th>Type</th><th>Issue</th><th>Suggestion</th>
              </tr>
            </thead>
            <tbody>
              ${results.map(r => `
                <tr>
                  <td>${r.file}</td><td>${r.line}</td><td>${r.type}</td><td>${r.message}</td><td>${r.suggestion}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    saveAs(blob, `NUR_QA_Report_${projectName.replace(/\s+/g, '_')}.doc`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProjectName(file.name);
    processAnalysis(`${BACKEND_URL}/api/analyze`, file, 'project');
  };

  const handleFilesUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setProjectName(`${files.length} files`);
    processAnalysis(`${BACKEND_URL}/api/analyze-direct`, files, 'files');
  };

  const processAnalysis = async (endpoint, payload, fieldName) => {
    setView('scanning');
    setScanProgress(10);
    setCurrentLog("Establishing connection to analysis engine...");
    setDownloadSessionId(null);

    const formData = new FormData();
    if (Array.isArray(payload)) {
      payload.forEach(f => formData.append(fieldName, f));
    } else {
      formData.append(fieldName, payload);
    }

    try {
      const response = await fetch(endpoint, { method: 'POST', body: formData });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Server responded with an error");
      }

      const data = await response.json();
      setScanProgress(100);

      setResults(data.report?.issues || []);
      setChangelog(data.report?.changelog || []);
      setStats(data.report?.stats || { errors: 0, warnings: 0, performance: 0, score: 0, coverage: 0 });
      setDownloadSessionId(data.sessionId);

      // Auto-trigger download
      if (data.sessionId) {
        window.location.href = `${BACKEND_URL}/api/download-fix/${data.sessionId}`;
      }

      setTimeout(() => setView('dashboard'), 500);

    } catch (error) {
      console.error("Analysis Error:", error);
      setErrorMessage(error.message || "An unexpected error occurred.");
      setView('error');
    }
  };

  const handleGithubSubmit = async (e) => {
    e.preventDefault();
    if (!githubUrl) return;
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return setErrorMessage("Please enter a valid GitHub repository URL.");

    const [_, owner, repoRaw] = match;
    const repo = repoRaw.replace('.git', '');
    setProjectName(repo);
    setView('scanning');
    setScanProgress(20);
    setCurrentLog(`Connecting to ${owner}/${repo}...`);

    try {
      const response = await fetch(`${BACKEND_URL}/api/analyze-github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo }),
      });

      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();

      setScanProgress(100);
      setResults(data.report?.issues || []);
      setChangelog(data.report?.changelog || []);
      setStats(data.report?.stats || { errors: 0, warnings: 0, performance: 0, score: 0, coverage: 0 });
      setDownloadSessionId(data.sessionId);

      if (data.sessionId) {
        window.location.href = `${BACKEND_URL}/api/download-fix/${data.sessionId}`;
      }

      setTimeout(() => setView('dashboard'), 500);
    } catch (e) {
      setErrorMessage(e.message);
      setView('error');
    }
  };

  const renderHeader = () => (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-lg shadow-red-900/50 group-hover:scale-110 transition-transform">
          <ShieldCheck className="text-white" size={20} />
        </div>
        <div className="hidden sm:block">
          <h1 className="font-bold text-xl tracking-tight text-white">{t.appName}</h1>
          <p className="text-[10px] uppercase tracking-widest text-red-400 font-semibold">{t.tagline}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => setLang(l => l === 'en' ? 'hy' : l === 'hy' ? 'ru' : 'en')} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 font-medium uppercase hover:bg-white/10 transition-colors">
          <Globe size={14} className="inline mr-2" /> {lang}
        </button>
        <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );

  const renderLanding = () => (
    <main className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-4xl w-full text-center z-10">
        <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 tracking-tight leading-tight">
          {t.welcomeMessage}
        </h2>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          NUR QA uses advanced AI logic to analyze your code, detect vulnerabilities, and generate instant fixes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <label className="group relative cursor-pointer h-44 border border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 bg-white/5 hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-500">
            <input type="file" accept=".zip" className="hidden" onChange={handleFileUpload} />
            <div className="p-4 rounded-full bg-red-500/10 text-red-400 group-hover:scale-110 group-hover:rotate-6 transition-transform">
              <UploadCloud size={32} />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-200">{t.uploadProject}</p>
              <p className="text-[10px] text-gray-500 uppercase mt-1">ZIP Archive</p>
            </div>
          </label>
          <label className="group relative cursor-pointer h-44 border border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 bg-white/5 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all duration-500">
            <input type="file" multiple className="hidden" onChange={handleFilesUpload} />
            <div className="p-4 rounded-full bg-orange-500/10 text-orange-400 group-hover:scale-110 group-hover:-rotate-6 transition-transform">
              <Layers size={32} />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-200">{t.uploadFiles}</p>
              <p className="text-[10px] text-gray-500 uppercase mt-1">Individual Files</p>
            </div>
          </label>
          <div className="h-44 border border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 bg-white/5 p-6 hover:border-blue-500/50 transition-all duration-500">
            <form onSubmit={handleGithubSubmit} className="w-full space-y-3">
              <div className="relative">
                <Github size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="GitHub URL..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:border-red-500 outline-none transition-all"
                />
              </div>
              <Button variant="primary" className="w-full py-2.5 text-xs" icon={Send}>{t.connectGithub}</Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );

  const renderScanning = () => (
    <main className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center relative">
      <Card className="max-w-2xl w-full text-center py-12">
        <Loader2 className="animate-spin text-red-500 mx-auto mb-6" size={48} />
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-sm text-red-400 font-bold uppercase tracking-widest">{t.processing}</span>
          <span className="font-mono text-gray-400">{scanProgress}%</span>
        </div>
        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden mb-6">
          <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-500" style={{ width: `${scanProgress}%` }} />
        </div>
        <p className="font-mono text-sm text-green-400 animate-pulse bg-green-500/5 py-2 rounded-lg border border-green-500/20">{currentLog}</p>
      </Card>
    </main>
  );

  const renderDashboard = () => (
    <main className="min-h-screen pt-24 px-6 pb-12 flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card delay={0.1} className="border-green-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">{t.passed}</span>
            <CheckCircle2 className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-white">{stats.score > 85 ? 'Passed' : 'Review'}</div>
        </Card>
        <Card delay={0.2} className="border-red-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">{t.failed}</span>
            <Bug className="text-red-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-white">{stats.errors}</div>
        </Card>
        <Card delay={0.3} className="border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">Quality Score</span>
            <Zap className="text-blue-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-white">{stats.score}<span className="text-lg text-gray-500">/100</span></div>
        </Card>
        <Card delay={0.4} className="border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">Test Coverage</span>
            <Code2 className="text-purple-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-white">{stats.coverage}%</div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-xs text-gray-500 font-bold uppercase mr-2 tracking-widest">Exports:</span>
        <Button variant="secondary" onClick={exportToPDF} icon={FileText} className="py-2 px-4 text-xs">PDF</Button>
        <Button variant="secondary" onClick={exportToExcel} icon={FileJson} className="py-2 px-4 text-xs">Excel</Button>
        <Button variant="secondary" onClick={exportToWord} icon={FileCode} className="py-2 px-4 text-xs">Word</Button>
        {downloadSessionId && (
          <Button variant="outline" onClick={() => window.location.href = `${BACKEND_URL}/api/download-fix/${downloadSessionId}`} icon={Download} className="py-2 px-4 text-xs">Download Fixed ZIP</Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab('issues')}
              className={`pb-3 px-2 text-sm font-bold transition-all ${activeTab === 'issues' ? 'border-b-2 border-red-500 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Detected Issues ({results.length})
            </button>
            <button
              onClick={() => setActiveTab('changelog')}
              className={`pb-3 px-2 text-sm font-bold transition-all ${activeTab === 'changelog' ? 'border-b-2 border-red-500 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              📜 Fix History
            </button>
          </div>

          {activeTab === 'issues' && (
            <div className="space-y-4">
              {results.length === 0 ? (
                <div className="py-20 text-center bg-white/5 rounded-3xl border border-white/5">
                  <CheckCircle2 className="text-green-500 mx-auto mb-4" size={48} />
                  <p className="text-gray-400 font-medium">No vulnerabilities or bugs detected.</p>
                </div>
              ) : results.map((r, i) => (
                <div key={i} className="bg-black/40 border border-white/10 rounded-2xl p-6 hover:border-red-500/30 transition-all duration-300 group">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Badge type={r.type} text={r.type?.toUpperCase()} />
                      <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                        <FileCode size={12} /> {r.file}:{r.line}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-white font-bold text-lg mb-2 leading-snug">{r.message}</h4>
                  <p className="text-gray-400 text-sm mb-5 leading-relaxed">{r.suggestion}</p>
                  {r.fix && (
                    <div className="relative">
                      <div className="absolute right-4 top-4 text-[10px] text-gray-500 font-mono uppercase">AI Fix Applied</div>
                      <pre className="bg-black/60 p-5 rounded-xl border border-white/5 text-green-400 text-xs overflow-x-auto custom-scrollbar font-mono leading-relaxed">
                        <code>{r.fix}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'changelog' && (
            <div className="overflow-x-auto bg-black/40 border border-white/10 rounded-3xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-5">File Path</th>
                    <th className="px-6 py-5">Bug Type</th>
                    <th className="px-6 py-5">Fix Applied</th>
                    <th className="px-6 py-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {changelog.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500 font-medium italic">No modifications recorded.</td></tr>
                  ) : changelog.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-mono text-red-400 text-xs">{entry.file}</td>
                      <td className="px-6 py-4"><Badge type={entry.bugType} text={entry.bugType?.toUpperCase()} /></td>
                      <td className="px-6 py-4 text-gray-300 text-xs leading-relaxed">{entry.fixApplied}</td>
                      <td className="px-6 py-4 text-green-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> {entry.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 h-full">
          <Card className="h-full flex flex-col border-red-500/10 sticky top-24">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center">
                <Cpu className="text-red-500" size={16} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">NUR Assistant</h3>
                <p className="text-[10px] text-green-500 font-bold uppercase tracking-tighter">AI Analysis Online</p>
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto mb-6 custom-scrollbar max-h-[450px]">
              {chatMessages.length === 0 && (
                <p className="text-gray-500 text-xs italic text-center py-10">Ask me anything...</p>
              )}
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 rounded-2xl text-xs max-w-[90%] leading-relaxed ${m.role === 'user' ? 'bg-red-600 text-white rounded-tr-none shadow-lg shadow-red-900/20' : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/5'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[10px] text-gray-500 animate-pulse font-bold ml-2">Thinking...</div>}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="relative mt-auto">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask NUR..."
                className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-xs text-white focus:border-red-500/50 outline-none transition-all placeholder:text-gray-600 shadow-inner"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-red-600 rounded-xl text-white hover:bg-red-500 active:scale-90 transition-all shadow-lg">
                <Send size={14} />
              </button>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );

  const renderError = () => (
    <main className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center relative">
      <Card className="max-w-md w-full text-center border-red-500/50 bg-red-900/10 py-10 shadow-red-900/20">
        <AlertTriangle size={64} className="text-red-500 mx-auto mb-6 animate-bounce" />
        <h2 className="text-3xl font-black text-white mb-2">{t.errorTitle}</h2>
        <p className="text-gray-400 mb-10 px-4 leading-relaxed">{errorMessage}</p>
        <Button onClick={() => setView('landing')} variant="primary" icon={RefreshCw} className="mx-auto px-10">{t.retry}</Button>
      </Card>
    </main>
  );

  return (
    <div className={`min-h-screen font-sans selection:bg-red-500/30 selection:text-white ${isDark ? 'bg-[#050505] text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-500`}>
      <Head>
        <title>NUR QA - Advanced AI Code Analysis</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0505] via-[#050505] to-black" />
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-red-900/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-red-800/10 rounded-full blur-[100px]" />
      </div>
      {renderHeader()}
      <div className="relative z-10">
        {view === 'landing' && renderLanding()}
        {view === 'scanning' && renderScanning()}
        {view === 'dashboard' && renderDashboard()}
        {view === 'error' && renderError()}
      </div>
      <style jsx global>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(239, 68, 68, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(239, 68, 68, 0.4); }
      `}</style>
    </div>
  );
}

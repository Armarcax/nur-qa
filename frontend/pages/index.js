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

// Export Libraries
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// --- Configuration & Constants ---

const THEMES = { DARK: 'dark', LIGHT: 'light' };
const LANGUAGES = { EN: 'en', HY: 'hy', RU: 'ru' };

const TRANSLATIONS = {
  en: {
    appName: "NUR QA",
    tagline: "Intelligent Testing Engine",
    uploadProject: "Upload Project (ZIP)",
    uploadFiles: "Upload Files (Multi)",
    connectGithub: "Analyze GitHub Repo",
    analyzing: "Analyzing Architecture...",
    generatingTests: "Generating AI Tests...",
    detectingBugs: "Detecting Vulnerabilities...",
    dashboard: "Dashboard",
    results: "Test Results",
    aiFixes: "AI Fix Suggestions",
    startScan: "Start Analysis",
    scanning: "Scanning...",
    passed: "Passed",
    failed: "Failed",
    warnings: "Warnings",
    critical: "Critical",
    severity: "Severity",
    fixCode: "Apply Fix",
    consoleOutput: "Console Output",
    frameworkDetected: "Framework Detected",
    testCoverage: "Test Coverage",
    performanceScore: "Performance Score",
    welcomeMessage: "Ready to optimize your code?",
    dropzoneText: "Drag & drop your project here or select a file",
    processing: "Processing with Groq AI...",
    complete: "Analysis Complete",
    language: "Language",
    theme: "Theme",
    errorTitle: "Analysis Failed",
    retry: "Try Again",
    chatPlaceholder: "Ask NUR anything about your code...",
    downloadFixed: "Download Fixed Project"
  },
  hy: {
    appName: "NUR QA",
    tagline: "Խելացի թեստավորման համակարգ",
    uploadProject: "Վերբեռնել նախագիծը (ZIP)",
    uploadFiles: "Վերբեռնել ֆայլեր (Multi)",
    connectGithub: "Վերլուծել GitHub Ռեպոզիտորիա",
    analyzing: "Վերլուծություն...",
    generatingTests: "Գեներացվում են թեստեր...",
    detectingBugs: "Հայտնաբերվում են սխալներ...",
    dashboard: "Կառավարման վահանակ",
    results: "Արդյունքներ",
    aiFixes: "AI ուղղումներ",
    startScan: "Սկսել վերլուծությունը",
    scanning: "Սկանավորում...",
    passed: "Հաջողված",
    failed: "Ձախողված",
    warnings: "Զգուշացումներ",
    critical: "Կրիտիկական",
    severity: "Լրջություն",
    fixCode: "Կիրառել ուղղումը",
    consoleOutput: "Կոնսոլի արդյունքներ",
    frameworkDetected: "Հայտնաբերված ֆրեյմվորք",
    testCoverage: "Թեստերի ծածկույթ",
    performanceScore: "Արդյունավետություն",
    welcomeMessage: "Պատրա՞ստ եք օպտիմալացնել կոդը:",
    dropzoneText: "Քաշեք և գցեք նախագիծը այստեղ",
    processing: "Մշակվում է Groq AI-ով...",
    complete: "Վերլուծությունն ավարտված է",
    language: "Լեզու",
    theme: "Թեմա",
    errorTitle: "Վերլուծությունը ձախողվեց",
    retry: "Կրկին փորձել",
    chatPlaceholder: "Հարցրու NUR-ին քո կոդի մասին...",
    downloadFixed: "Ներբեռնել ուղղված նախագիծը"
  },
  ru: {
    appName: "NUR QA",
    tagline: "Интеллектуальный движок тестирования",
    uploadProject: "Загрузить проект (ZIP)",
    uploadFiles: "Загрузить файлы (Multi)",
    connectGithub: "Анализировать GitHub Репозиторий",
    analyzing: "Анализ архитектуры...",
    generatingTests: "Генерация тестов ИИ...",
    detectingBugs: "Поиск уязвимостей...",
    dashboard: "Панель управления",
    results: "Результаты тестов",
    aiFixes: "Рекомендации ИИ",
    startScan: "Начать анализ",
    scanning: "Сканирование...",
    passed: "Успешно",
    failed: "Ошибка",
    warnings: "Предупреждения",
    critical: "Критично",
    severity: "Важность",
    fixCode: "Применить исправление",
    consoleOutput: "Вывод консоли",
    frameworkDetected: "Обнаружен фреймворк",
    testCoverage: "Покрытие тестами",
    performanceScore: "Производительность",
    welcomeMessage: "Готовы оптимизировать ваш код?",
    dropzoneText: "Перетащите проект сюда или выберите файл",
    processing: "Обработка через Groq AI...",
    complete: "Анализ завершен",
    language: "Язык",
    theme: "Тема",
    errorTitle: "Анализ не удался",
    retry: "Попробовать снова",
    chatPlaceholder: "Спросите NUR о вашем коде...",
    downloadFixed: "Скачать исправленный проект"
  }
};

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, icon: Icon }) => {
  const baseStyle = "relative px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group ";

  const variants = {
    primary: "bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/20 hover:shadow-red-600/40 hover:scale-[1.02] ",
    secondary: "bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 backdrop-blur-md ",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5 ",
    outline: "border border-red-500/50 text-red-400 hover:bg-red-500/10 "
  };

  return (
     <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
   >
      {Icon && <Icon size={18} className="transition-transform group-hover:scale-110" />}
       <span className="relative z-10">{children}</span>
      {variant === 'primary' && (
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
      )}
     </button>
  );
};

const Card = ({ children, className = "", delay = 0 }) => (
   <div
    className={`bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl ${className}`}
    style={{ animation: `fadeInUp 0.5s ease-out ${delay}s forwards`, opacity: 0, transform: 'translateY(20px)' }}
   >
    {children}
   </div>
);

const Badge = ({ type, text }) => {
  const colors = {
    error: "bg-red-500/20 text-red-400 border-red-500/30 ",
    warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 ",
    success: "bg-green-500/20 text-green-400 border-green-500/30 ",
    performance: "bg-blue-500/20 text-blue-400 border-blue-500/30 ",
    info: "bg-purple-500/20 text-purple-400 border-purple-500/30 "
  };

  return (
     <span className={`px-2 py-1 rounded-md text-xs font-mono border ${colors[type] || colors.info}`} >
      {text}
     </span>
  );
};

// --- Main Application ---

export default function NurQAApp() {
  // State
  const [theme, setTheme] = useState(THEMES.DARK);
  const [lang, setLang] = useState(LANGUAGES.EN);
  const [view, setView] = useState('landing'); // landing, scanning, dashboard, error
  const [projectName, setProjectName] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState("");
  const [results, setResults] = useState([]);
  const [changelog, setChangelog] = useState([]);
  const [stats, setStats] = useState({ errors: 0, warnings: 0, performance: 0, score: 0, coverage: 0 });
  const [sessionId, setSessionId] = useState(null);
  const [activeTab, setActiveTab] = useState('issues');
  const [errorMessage, setErrorMessage] = useState("");
  const [isZipDownloaded, setIsZipDownloaded] = useState(false);
  const [exportReady, setExportReady] = useState(false);

  // GitHub State
  const [githubUrl, setGithubUrl] = useState("");
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const t = TRANSLATIONS[lang];
  const isDark = theme === THEMES.DARK;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (view === 'dashboard' && chatMessages.length === 0 && projectName) {
      setChatMessages([
        {
          role: 'ai',
          content: `I've analyzed your project "${projectName}". I found ${results.length} issues. ${isZipDownloaded ? "The fixed project has been downloaded." : "I can generate a fixed version for you."}`
        }
      ]);
      setExportReady(results.length > 0);
    }
  }, [view, projectName, results, isZipDownloaded]);

  const toggleTheme = () => setTheme(prev => prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK);
  const toggleLang = () => {
    const langs = Object.values(LANGUAGES);
    const nextIndex = (langs.indexOf(lang) + 1) % langs.length;
    setLang(langs[nextIndex]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      let aiResponseContent = "";
      if (chatInput.toLowerCase().includes("fix")) {
        aiResponseContent = "I have analyzed and fixed the codebase. You can see the detailed changelog in the 'Changes & Fix History' tab.";
      } else {
        aiResponseContent = "I recommend reviewing the performance warnings I identified in your data processing loops.";
      }
      setChatMessages(prev => [...prev, { role: 'ai', content: aiResponseContent }]);
      setIsTyping(false);
    }, 1500);
  };

  const triggerDownload = (id) => {
    if (!id) return;
    setTimeout(() => {
        window.location.href = `/api/download-fix?sessionId=${id}`;
        setIsZipDownloaded(true);
    }, 500);
  };

  // --- Export Functions ---

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`NUR QA Report: ${projectName}`, 14, 15);

    const tableData = results.map(r => [
      r.file,
      r.line,
      r.type.toUpperCase(),
      r.message,
      r.suggestion
    ]);

    doc.autoTable({
      head: [['File', 'Line', 'Type', 'Issue', 'Suggestion']],
      body: tableData,
      startY: 20,
      theme: 'grid'
    });

    doc.save(`NUR_Report_${projectName}.pdf`);
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
    XLSX.utils.book_append_sheet(wb, ws, "QA Results");
    XLSX.writeFile(wb, `NUR_Report_${projectName}.xlsx`);
  };

  const exportToWord = () => {
    let content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>NUR QA Report</title></head>
      <body>
        <h1>NUR QA Analysis Report: ${projectName}</h1>
        <table border='1' style='border-collapse:collapse; width:100%'>
          <tr style='background-color:#f2f2f2'>
            <th>File</th><th>Line</th><th>Type</th><th>Issue</th><th>Suggestion</th>
          </tr>
          ${results.map(r => `
            <tr>
              <td>${r.file}</td><td>${r.line}</td><td>${r.type}</td><td>${r.message}</td><td>${r.suggestion}</td>
            </tr>
          `).join('')}
        </table>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    saveAs(blob, `NUR_Report_${projectName}.doc`);
  };

  // --- Upload Handlers ---

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProjectName(file.name.replace('.zip', ''));
    processAnalysis('/api/analyze', file, 'project');
  };

  const handleFilesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setProjectName(`Direct Upload (${files.length} files)`);
    processAnalysis('/api/analyze-direct', files, 'files');
  };

  const processAnalysis = async (endpoint, payload, fieldName) => {
    setView('scanning');
    setScanProgress(5);
    setCurrentLog("Initializing upload...");
    setChatMessages([]);
    setIsZipDownloaded(false);

    const formData = new FormData();
    if (Array.isArray(payload)) {
      payload.forEach(f => formData.append(fieldName, f));
    } else {
      formData.append(fieldName, payload);
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error occurred');
      }

      setScanProgress(60);
      setCurrentLog("Processing AI analysis...");

      const data = await response.json();
      setScanProgress(100);
      setCurrentLog("Analysis Complete");

      if (data.success && data.report) {
        setResults(data.report.issues || []);
        setChangelog(data.report.changelog || []);
        setStats(data.report.stats || { errors: 0, warnings: 0, performance: 0, score: 0, coverage: 0 });
        setSessionId(data.sessionId);

        if (data.sessionId) triggerDownload(data.sessionId);

        setTimeout(() => setView('dashboard'), 500);
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (error) {
      console.error("Analysis failed: ", error);
      setErrorMessage(error.message);
      setView('error');
    }
  };

  const handleGithubSubmit = async (e) => {
    e.preventDefault();
    if (!githubUrl) return;
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      setErrorMessage("Invalid GitHub URL");
      setView('error');
      return;
    }
    const [_, owner, repo] = match;
    setProjectName(repo.replace('.git', ''));
    setView('scanning');
    setScanProgress(10);
    setCurrentLog("Connecting to GitHub...");

    try {
      const response = await fetch('/api/analyze-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo: repo.replace('.git', '') }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'GitHub analysis failed');
      }

      const data = await response.json();
      setScanProgress(100);

      if (data.success && data.report) {
        setResults(data.report.issues || []);
        setChangelog(data.report.changelog || []);
        setStats(data.report.stats || { errors: 0, warnings: 0, performance: 0, score: 0, coverage: 0 });
        setSessionId(data.sessionId);
        if (data.sessionId) triggerDownload(data.sessionId);
        setTimeout(() => setView('dashboard'), 500);
      } else {
        throw new Error(data.error || "GitHub analysis failed");
      }
    } catch (error) {
      setErrorMessage(error.message);
      setView('error');
    }
  };

  // --- Render Functions ---

  const renderHeader = () => (
     <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/20 backdrop-blur-md border-b border-white/5" >
       <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')} >
         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-lg shadow-red-900/50" >
           <ShieldCheck className="text-white" size={20} />
         </div>
         <div>
           <h1 className="font-bold text-xl tracking-tight text-white">{t.appName}</h1>
           <p className="text-[10px] uppercase tracking-widest text-red-400 font-semibold">{t.tagline}</p>
         </div>
       </div>
       <div className="flex items-center gap-4" >
         <button onClick={toggleLang} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-gray-300" >
           <Globe size={16} />
           <span className="uppercase font-medium">{lang}</span>
         </button>
         <button onClick={toggleTheme} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-300" >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
         </button>
       </div>
     </header>
  );

  const renderLanding = () => (
     <main className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center relative overflow-hidden" >
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none" />
       <div className="max-w-4xl w-full text-center z-10 animate-fade-in" >
         <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60" >{t.welcomeMessage}</h2>
         <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto" >Advanced NUR QA engine for deep code analysis, instant bug fixing, and compliance testing.</p>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto" >
           <label className="group relative cursor-pointer" >
             <input type="file" accept=".zip" className="hidden" onChange={handleFileUpload} />
             <div className="h-40 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white/5 backdrop-blur-sm transition-all group-hover:border-red-500/50 group-hover:bg-red-500/5" >
               <UploadCloud size={28} className="text-red-400 group-hover:scale-110 transition-transform" />
               <div className="text-center" >
                 <p className="font-semibold text-sm text-gray-200">{t.uploadProject}</p>
                 <p className="text-[10px] text-gray-500 uppercase mt-1">ZIP / Tar</p>
               </div>
             </div>
           </label>
           <label className="group relative cursor-pointer" >
             <input
              type="file"
              multiple
              accept=".js,.jsx,.ts,.tsx,.mjs,.cjs,.py,.rb,.java,.kt,.go,.rs,.c,.cpp,.h,.hpp,.cs,.swift,.dart,.lua,.php,.sh,.ps1,.html,.htm,.css,.scss,.sass,.less,.vue,.svelte,.astro,.json,.xml,.yaml,.yml,.toml,.ini,.cfg,.conf,.md,.txt,.markdown,.sql,.graphql,.prisma,.dockerfile,.gitignore,.eslintrc,.prettierrc,.env,.env.example"
              className="hidden"
              onChange={handleFilesUpload}
             />
             <div className="h-40 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white/5 backdrop-blur-sm transition-all group-hover:border-red-500/50 group-hover:bg-red-500/5" >
               <Layers size={28} className="text-orange-400 group-hover:scale-110 transition-transform" />
               <div className="text-center" >
                 <p className="font-semibold text-sm text-gray-200">{t.uploadFiles}</p>
                 <p className="text-[10px] text-gray-500 uppercase mt-1">Direct Multi-File</p>
               </div>
             </div>
           </label>
           <form onSubmit={handleGithubSubmit} className="h-40 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white/5 backdrop-blur-sm p-4">
             <div className="w-full">
               <input
                 type="text"
                 value={githubUrl}
                 onChange={(e) => setGithubUrl(e.target.value)}
                 placeholder="GitHub Repo URL"
                 className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white focus:border-red-500 outline-none"
               />
             </div>
             <Button variant="primary" icon={Github} className="w-full py-2 text-xs" disabled={isGithubLoading}>
               {isGithubLoading ? '...' : t.connectGithub}
             </Button>
           </form>
         </div>
       </div>
     </main>
  );

  const renderScanning = () => (
     <main className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center relative" >
        <div className="w-full max-w-2xl z-10" >
          <Card className="mb-8 border-red-500/30 bg-black/60 text-center" >
            <div className="flex items-center justify-between mb-4" >
              <span className="font-mono text-red-400">{t.processing}</span>
              <span className="font-mono text-gray-400">{Math.round(scanProgress)}%</span>
            </div>
            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden mb-4" >
              <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${scanProgress}%` }} />
            </div>
            <div className="font-mono text-[10px] text-green-400/80 animate-pulse">{currentLog}</div>
          </Card>
        </div>
     </main>
  );

  const renderDashboard = () => (
     <main className="min-h-screen pt-24 px-6 pb-12 flex flex-col gap-6 max-w-7xl mx-auto" >
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6" >
         <Card delay={0.1} className="bg-gradient-to-br from-green-900/20 to-black/40 border-green-500/20" >
           <div className="flex items-center justify-between mb-2" ><span className="text-gray-400 text-sm font-medium">{t.passed}</span><CheckCircle2 className="text-green-500" size={20} /></div>
           <div className="text-3xl font-bold text-white">{stats.score > 90 ? 'Passed' : 'Review'}</div>
         </Card>
         <Card delay={0.2} className="bg-gradient-to-br from-red-900/20 to-black/40 border-red-500/20" >
           <div className="flex items-center justify-between mb-2" ><span className="text-gray-400 text-sm font-medium">{t.failed}</span><Bug className="text-red-500" size={20} /></div>
           <div className="text-3xl font-bold text-white">{stats.errors}</div>
         </Card>
         <Card delay={0.3} className="bg-gradient-to-br from-blue-900/20 to-black/40 border-blue-500/20" >
           <div className="flex items-center justify-between mb-2" ><span className="text-gray-400 text-sm font-medium">Quality Score</span><Zap className="text-blue-500" size={20} /></div>
           <div className="text-3xl font-bold text-white">{stats.score}<span className="text-lg text-gray-500">/100</span></div>
         </Card>
         <Card delay={0.4} className="bg-gradient-to-br from-purple-900/20 to-black/40 border-purple-500/20" >
           <div className="flex items-center justify-between mb-2" ><span className="text-gray-400 text-sm font-medium">Test Coverage</span><Code2 className="text-purple-500" size={20} /></div>
           <div className="text-3xl font-bold text-white">{stats.coverage}%</div>
         </Card>
       </div>

       <div className="flex flex-wrap gap-3 mb-4">
         <Button variant="secondary" onClick={exportToPDF} icon={FileText} className="py-2 text-xs">📄 Export PDF</Button>
         <Button variant="secondary" onClick={exportToExcel} icon={FileJson} className="py-2 text-xs">📊 Export Excel</Button>
         <Button variant="secondary" onClick={exportToWord} icon={FileCode} className="py-2 text-xs">📝 Export Word</Button>
         {sessionId && <Button variant="outline" onClick={() => triggerDownload(sessionId)} icon={Download} className="py-2 text-xs">📦 Download Fix ZIP</Button>}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1" >
         <div className="lg:col-span-2 space-y-6" >
           <div className="flex items-center justify-between" >
             <h3 className="text-xl font-bold text-white flex items-center gap-2" ><Terminal size={20} className="text-red-500" />{t.results}</h3>
             <div className="flex gap-2" >
               <button onClick={() => setActiveTab('issues')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'issues' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Issues</button>
               <button onClick={() => setActiveTab('changelog')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'changelog' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>📜 Changes & Fix History</button>
             </div>
           </div>

          {activeTab === 'issues' && (
             <div className="space-y-4" >
              {results.length === 0 ? <p className="text-gray-500 text-center py-10">No issues found.</p> : results.map((result, idx) => (
                 <div key={idx} className="bg-black/40 border border-white/10 rounded-xl p-5 hover:border-red-500/30 transition-colors group animate-fade-in-up">
                   <div className="flex items-start justify-between mb-3" >
                     <div className="flex items-center gap-3" ><Badge type={result.type} text={result.type.toUpperCase()} /><span className="font-mono text-sm text-gray-400">{result.file}:{result.line}</span></div>
                   </div>
                   <h4 className="text-lg font-medium text-gray-200 mb-2">{result.message}</h4>
                   <p className="text-gray-500 text-sm mb-4">{result.suggestion}</p>
                   {result.fix && <pre className="bg-black/60 rounded-lg p-4 border border-white/5 font-mono text-sm text-green-400 overflow-x-auto"><code>{result.fix}</code></pre>}
                 </div>
              ))}
             </div>
          )}

          {activeTab === 'changelog' && (
             <div className="overflow-x-auto bg-black/40 border border-white/10 rounded-xl">
               <table className="w-full text-left text-sm">
                 <thead className="bg-white/5 text-gray-400 uppercase text-xs font-semibold">
                   <tr><th className="px-6 py-4">File Path</th><th className="px-6 py-4">Bug Type</th><th className="px-6 py-4">Fix Applied</th><th className="px-6 py-4">Status</th></tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                  {changelog.map((entry, idx) => (
                     <tr key={idx} className="hover:bg-white/5">
                       <td className="px-6 py-4 font-mono text-red-400">{entry.file}</td>
                       <td className="px-6 py-4"><Badge type={entry.bugType} text={entry.bugType.toUpperCase()} /></td>
                       <td className="px-6 py-4 text-gray-300">{entry.fixApplied}</td>
                       <td className="px-6 py-4 text-green-400">✅ {entry.status}</td>
                     </tr>
                  ))}
                 </tbody>
               </table>
             </div>
          )}
         </div>

         <div className="lg:col-span-1" >
           <Card className="h-full flex flex-col bg-gradient-to-b from-black/60 to-red-900/10 border-red-500/20" >
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10" ><div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center"><Cpu size={16} className="text-white" /></div><h3 className="font-bold text-white">NUR Assistant</h3></div>
             <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar mb-4 min-h-[300px]" >
               {chatMessages.map((msg, idx) => (
                 <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}><div className={`rounded-2xl p-3 text-sm max-w-[85%] ${msg.role === 'ai' ? 'bg-white/5 text-gray-300' : 'bg-red-600/20 text-white'}`}>{msg.content}</div></div>
               ))}
               {isTyping && <div className="text-xs text-gray-500 animate-pulse">Thinking...</div>}
               <div ref={chatEndRef} />
             </div>
             <form onSubmit={handleSendMessage} className="relative" >
               <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={t.chatPlaceholder} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:border-red-500/50 outline-none" />
               <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-red-600 rounded-lg text-white hover:bg-red-500 transition-colors" ><Send size={16} /></button>
             </form>
           </Card>
         </div>
       </div>
     </main>
  );

  return (
     <div className={`min-h-screen font-sans selection:bg-red-500/30 selection:text-white ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`} >
       <Head><title>NUR QA v2.0 - Intelligent Engine</title></Head>
       <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" >
         <div className="absolute inset-0 bg-gradient-to-br from-[#1a0505] via-[#0f0f0f] to-[#000000]" />
         <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-900/20 rounded-full blur-[100px] animate-pulse" />
       </div>
       {renderHeader()}
       <div className="relative z-10" >
        {view === 'landing' && renderLanding()}
        {view === 'scanning' && renderScanning()}
        {view === 'dashboard' && renderDashboard()}
        {view === 'error' && renderError()}
       </div>
       <style jsx global>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(239, 68, 68, 0.3); border-radius: 4px; }
      `}</style>
     </div>
  );
}

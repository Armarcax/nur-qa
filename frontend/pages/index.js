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

import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const THEMES = { DARK: 'dark', LIGHT: 'light' };
const LANGUAGES = { EN: 'en', HY: 'hy', RU: 'ru' };

const TRANSLATIONS = {
  en: {
    appName: "NUR QA", tagline: "Intelligent Testing Engine", uploadProject: "Upload Project (ZIP)", uploadFiles: "Upload Files (Multi)", connectGithub: "Analyze GitHub Repo", analyzing: "Analyzing...", dashboard: "Dashboard", results: "Test Results", startScan: "Start Analysis", passed: "Passed", failed: "Failed", welcomeMessage: "Ready to optimize your code?", processing: "Processing with Groq AI...", errorTitle: "Analysis Failed", retry: "Try Again", chatPlaceholder: "Ask NUR anything..."
  },
  hy: {
    appName: "NUR QA", tagline: "Խելացի թեստավորման համակարգ", uploadProject: "Վերբեռնել նախագիծը (ZIP)", uploadFiles: "Վերբեռնել ֆայլեր (Multi)", connectGithub: "Վերլուծել GitHub", analyzing: "Վերլուծություն...", dashboard: "Կառավարման վահանակ", results: "Արդյունքներ", startScan: "Սկսել վերլուծությունը", passed: "Հաջողված", failed: "Ձախողված", welcomeMessage: "Պատրա՞ստ եք օպտիմալացնել կոդը:", processing: "Մշակվում է Groq AI-ով...", errorTitle: "Վերլուծությունը ձախողվեց", retry: "Կրկին փորձել", chatPlaceholder: "Հարցրու NUR-ին..."
  },
  ru: {
    appName: "NUR QA", tagline: "Интеллектуальный движок тестирования", uploadProject: "Загрузить проект (ZIP)", uploadFiles: "Загрузить файлы (Multi)", connectGithub: "Анализировать GitHub", analyzing: "Анализ...", dashboard: "Панель управления", results: "Результаты", startScan: "Начать анализ", passed: "Успешно", failed: "Ошибка", welcomeMessage: "Готовы оптимизировать ваш код?", processing: "Обработка через Groq AI...", errorTitle: "Анализ не удался", retry: "Попробовать снова", chatPlaceholder: "Спросите NUR..."
  }
};

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, icon: Icon }) => {
  const variants = {
    primary: "bg-gradient-to-r from-red-600 to-red-800 text-white hover:scale-[1.02] shadow-red-900/20",
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
  const [isZipDownloaded, setIsZipDownloaded] = useState(false);

  const [githubUrl, setGithubUrl] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

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
      setChatMessages(prev => [...prev, { role: 'ai', content: `I've reviewed your question about "${input}". Based on my analysis, you should focus on optimizing the main execution loop for better performance.` }]);
      setIsTyping(false);
    }, 1000);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`NUR QA Report: ${projectName}`, 14, 15);
    doc.autoTable({
      head: [['File', 'Line', 'Type', 'Issue', 'Suggestion']],
      body: results.map(r => [r.file, r.line, r.type.toUpperCase(), r.message, r.suggestion]),
      startY: 20
    });
    doc.save(`NUR_Report_${projectName}.pdf`);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(results.map(r => ({ File: r.file, Line: r.line, Type: r.type, Issue: r.message, Suggestion: r.suggestion })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "QA Results");
    XLSX.writeFile(wb, `NUR_Report_${projectName}.xlsx`);
  };

  const exportToWord = () => {
    const content = `<html><body><h1>NUR QA Report: ${projectName}</h1><table border="1"><tr><th>File</th><th>Line</th><th>Type</th><th>Issue</th><th>Suggestion</th></tr>${results.map(r => `<tr><td>${r.file}</td><td>${r.line}</td><td>${r.type}</td><td>${r.message}</td><td>${r.suggestion}</td></tr>`).join('')}</table></body></html>`;
    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    saveAs(blob, `NUR_Report_${projectName}.doc`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProjectName(file.name);
    processAnalysis('/api/analyze', file, 'project');
  };

  const handleFilesUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setProjectName(`${files.length} files`);
    processAnalysis('/api/analyze-direct', files, 'files');
  };

  const processAnalysis = async (endpoint, payload, fieldName) => {
    setView('scanning');
    setScanProgress(10);
    setCurrentLog("Uploading data...");
    setIsZipDownloaded(false);

    const formData = new FormData();
    if (Array.isArray(payload)) payload.forEach(f => formData.append(fieldName, f));
    else formData.append(fieldName, payload);

    try {
      const response = await fetch(endpoint, { method: 'POST', body: formData });
      if (!response.ok) throw new Error(await response.text());

      const contentType = response.headers.get("content-type") || "";
      const reportHeader = response.headers.get("X-QA-Report");

      let data;
      const processZip = async (res) => {
        const blob = await res.blob();
        saveAs(blob, `fixed_${projectName}.zip`);
        setIsZipDownloaded(true);
        return reportHeader ? JSON.parse(reportHeader) : null;
      };

      if (contentType.includes("application/zip") || contentType.includes("octet-stream")) {
        data = await processZip(response);
      } else {
        const clonedRes = response.clone();
        try {
          data = await response.json();
        } catch (err) {
          if (err instanceof SyntaxError) {
            data = await processZip(clonedRes);
          } else {
            throw err;
          }
        }
      }

      setScanProgress(100);
      if (data) {
        setResults(data.report?.issues || data.issues || []);
        setChangelog(data.report?.changelog || data.changelog || []);
        setStats(data.report?.stats || data.stats || { errors: 0, warnings: 0, performance: 0, score: 0, coverage: 0 });
      }
      setTimeout(() => setView('dashboard'), 500);

    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
      setView('error');
    }
  };

  const handleGithubSubmit = async (e) => {
    e.preventDefault();
    if (!githubUrl) return;
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return setErrorMessage("Invalid GitHub URL");
    const [_, owner, repo] = match;
    setProjectName(repo);
    setView('scanning');
    setScanProgress(20);
    setCurrentLog("Fetching from GitHub...");
    try {
      const response = await fetch('/api/analyze-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo: repo.replace('.git', '') }),
      });
      if (!response.ok) throw new Error(await response.text());

      const contentType = response.headers.get("content-type") || "";
      const reportHeader = response.headers.get("X-QA-Report");
      let data;
      if (contentType.includes("application/zip")) {
        const blob = await response.blob();
        saveAs(blob, `${repo}_fixed.zip`);
        setIsZipDownloaded(true);
        if (reportHeader) data = JSON.parse(reportHeader);
      } else {
        data = await response.json();
      }
      setScanProgress(100);
      if (data) {
        setResults(data.report?.issues || data.issues || []);
        setChangelog(data.report?.changelog || data.changelog || []);
        setStats(data.report?.stats || data.stats || { errors: 0, warnings: 0, performance: 0, score: 0, coverage: 0 });
      }
      setTimeout(() => setView('dashboard'), 500);
    } catch (e) {
      setErrorMessage(e.message);
      setView('error');
    }
  };

  const renderHeader = () => (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/20 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-lg shadow-red-900/50"><ShieldCheck className="text-white" size={20} /></div>
        <h1 className="font-bold text-xl text-white">{t.appName}</h1>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => setLang(l => l === 'en' ? 'hy' : l === 'hy' ? 'ru' : 'en')} className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-300 uppercase">{lang}</button>
        <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg bg-white/5 text-gray-300">{isDark ? <Sun size={18} /> : <Moon size={18} />}</button>
      </div>
    </header>
  );

  const renderLanding = () => (
    <main className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-4xl w-full text-center z-10">
        <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">{t.welcomeMessage}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <label className="group relative cursor-pointer h-40 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white/5 hover:border-red-500/50 transition-all">
            <input type="file" accept=".zip" className="hidden" onChange={handleFileUpload} />
            <UploadCloud size={28} className="text-red-400 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-sm text-gray-200">{t.uploadProject}</p>
          </label>
          <label className="group relative cursor-pointer h-40 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white/5 hover:border-orange-500/50 transition-all">
            <input type="file" multiple className="hidden" onChange={handleFilesUpload} />
            <Layers size={28} className="text-orange-400 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-sm text-gray-200">{t.uploadFiles}</p>
          </label>
          <form onSubmit={handleGithubSubmit} className="h-40 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white/5 p-4">
            <input type="text" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="GitHub URL" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:border-red-500 outline-none" />
            <Button variant="primary" icon={Github} className="w-full py-2 text-xs">{t.connectGithub}</Button>
          </form>
        </div>
      </div>
    </main>
  );

  const renderScanning = () => (
    <main className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center relative">
      <Card className="max-w-2xl w-full text-center">
        <div className="flex items-center justify-between mb-4"><span className="font-mono text-red-400">{t.processing}</span><span className="font-mono text-gray-400">{scanProgress}%</span></div>
        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden mb-4"><div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${scanProgress}%` }} /></div>
        <p className="font-mono text-xs text-green-400 animate-pulse">{currentLog}</p>
      </Card>
    </main>
  );

  const renderDashboard = () => (
    <main className="min-h-screen pt-24 px-6 pb-12 flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card delay={0.1}><div className="flex items-center justify-between mb-2"><span className="text-gray-400 text-sm">{t.passed}</span><CheckCircle2 className="text-green-500" size={20} /></div><div className="text-3xl font-bold text-white">{stats.score > 90 ? 'Clean' : 'Needs Review'}</div></Card>
        <Card delay={0.2}><div className="flex items-center justify-between mb-2"><span className="text-gray-400 text-sm">{t.failed}</span><Bug className="text-red-500" size={20} /></div><div className="text-3xl font-bold text-white">{stats.errors}</div></Card>
        <Card delay={0.3}><div className="flex items-center justify-between mb-2"><span className="text-gray-400 text-sm">Score</span><Zap className="text-blue-500" size={20} /></div><div className="text-3xl font-bold text-white">{stats.score}/100</div></Card>
        <Card delay={0.4}><div className="flex items-center justify-between mb-2"><span className="text-gray-400 text-sm">Coverage</span><Code2 className="text-purple-500" size={20} /></div><div className="text-3xl font-bold text-white">{stats.coverage}%</div></Card>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <Button variant="secondary" onClick={exportToPDF} icon={FileText} className="py-2 text-xs">📄 PDF</Button>
        <Button variant="secondary" onClick={exportToExcel} icon={FileJson} className="py-2 text-xs">📊 Excel</Button>
        <Button variant="secondary" onClick={exportToWord} icon={FileCode} className="py-2 text-xs">📝 Word</Button>
      </div>

      {isZipDownloaded && <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-3"><CheckCircle2 size={16} /> Fixed project downloaded successfully!</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-4 border-b border-white/10">
            <button onClick={() => setActiveTab('issues')} className={`pb-2 px-2 text-sm font-medium ${activeTab === 'issues' ? 'border-b-2 border-red-500 text-white' : 'text-gray-500'}`}>Issues</button>
            <button onClick={() => setActiveTab('changelog')} className={`pb-2 px-2 text-sm font-medium ${activeTab === 'changelog' ? 'border-b-2 border-red-500 text-white' : 'text-gray-500'}`}>📜 Changes & History</button>
          </div>

          {activeTab === 'issues' && (
            <div className="space-y-4">{results.length === 0 ? <p className="text-gray-500 py-10 text-center">No issues detected.</p> : results.map((r, i) => (
              <div key={i} className="bg-black/40 border border-white/10 rounded-xl p-5 hover:border-red-500/30 transition-all">
                <div className="flex items-center gap-3 mb-3"><Badge type={r.type} text={r.type?.toUpperCase()} /><span className="text-xs text-gray-400 font-mono">{r.file}:{r.line}</span></div>
                <h4 className="text-gray-200 font-medium mb-2">{r.message}</h4>
                <p className="text-gray-500 text-xs mb-4">{r.suggestion}</p>
                {r.fix && <pre className="bg-black/60 p-3 rounded-lg border border-white/5 text-green-400 text-xs overflow-x-auto"><code>{r.fix}</code></pre>}
              </div>
            ))}</div>
          )}

          {activeTab === 'changelog' && (
            <div className="overflow-x-auto bg-black/40 border border-white/10 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400 uppercase text-xs font-semibold">
                  <tr><th className="px-6 py-4">File Path</th><th className="px-6 py-4">Bug Type</th><th className="px-6 py-4">Fix Applied</th><th className="px-6 py-4">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {changelog.length === 0 ? <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500">No modifications recorded.</td></tr> : changelog.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-red-400">{entry.file}</td>
                      <td className="px-6 py-4"><Badge type={entry.bugType} text={entry.bugType?.toUpperCase()} /></td>
                      <td className="px-6 py-4 text-gray-300">{entry.fixApplied}</td>
                      <td className="px-6 py-4 text-green-400">✅ {entry.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="lg:col-span-1 h-full"><Card className="h-full flex flex-col"><div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10"><Cpu className="text-red-500" /> <h3 className="font-bold">NUR Assistant</h3></div>
          <div className="flex-1 space-y-4 overflow-y-auto mb-4">{chatMessages.map((m, i) => <div key={i} className={`p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-red-600/20 ml-8 text-white' : 'bg-white/5 mr-8 text-gray-300'}`}>{m.content}</div>)}
          {isTyping && <div className="text-xs text-gray-500 animate-pulse">Thinking...</div>}<div ref={chatEndRef} /></div>
          <form onSubmit={handleSendMessage} className="relative"><input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask NUR..." className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-red-500/50 outline-none" /><button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-red-600 rounded-lg text-white"><Send size={14} /></button></form>
        </Card></div>
      </div>
    </main>
  );

  const renderError = () => (
    <main className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center relative">
      <Card className="max-w-md w-full text-center border-red-500/50 bg-red-900/10">
        <AlertTriangle size={48} className="text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">{t.errorTitle}</h2>
        <p className="text-gray-400 mb-8">{errorMessage}</p>
        <Button onClick={() => setView('landing')} variant="outline" icon={RefreshCw}>{t.retry}</Button>
      </Card>
    </main>
  );

  return (
    <div className={`min-h-screen font-sans selection:bg-red-500/30 selection:text-white ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Head><title>NUR QA - AI Analysis</title></Head>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0505] via-[#0f0f0f] to-[#000000]" />
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-900/20 rounded-full blur-[100px] animate-pulse" />
      </div>
      {renderHeader()}
      <div className="relative z-10">{view === 'landing' && renderLanding()}{view === 'scanning' && renderScanning()}{view === 'dashboard' && renderDashboard()}{view === 'error' && renderError()}</div>
      <style jsx global>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}

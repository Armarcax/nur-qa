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
  Download
} from 'lucide-react';

// --- Configuration & Constants ---

const THEMES = { DARK: 'dark', LIGHT: 'light' };
const LANGUAGES = { EN: 'en', HY: 'hy', RU: 'ru' };

const TRANSLATIONS = {
  en: {
    appName: "NUR QA",
    tagline: "Intelligent Testing Engine",
    uploadProject: "Upload Project (ZIP)",
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
  const [activeTab, setActiveTab] = useState('issues');
  const [errorMessage, setErrorMessage] = useState("");
  const [isZipDownloaded, setIsZipDownloaded] = useState(false);
  
  // GitHub State
  const [githubUrl, setGithubUrl] = useState("");
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Refs
  const logInterval = useRef(null);

  // Derived state
  const t = TRANSLATIONS[lang];
  const isDark = theme === THEMES.DARK;

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Initialize Chat when Dashboard loads
  useEffect(() => {
    if (view === 'dashboard' && chatMessages.length === 0 && projectName) {
      setChatMessages([
        {
          role: 'ai',
          content: `I've analyzed your project "${projectName}". I found ${results.length} issues. ${isZipDownloaded ? "The fixed project has been downloaded." : "I can generate a fixed version for you."}`
        }
      ]);
    }
  }, [view, projectName, results, isZipDownloaded]);

  // Handlers
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

    // Simulate AI Response
    setTimeout(() => {
      let aiResponseContent = "";
      
      if (chatInput.toLowerCase().includes("fix") || chatInput.toLowerCase().includes("ուղղել")) {
        aiResponseContent = "I have already generated the fixed files. Please check your downloads folder for 'NUR_QA_Fixed_Project.zip'.";
      } else if (chatInput.toLowerCase().includes("security") || chatInput.toLowerCase().includes("անվտանգություն")) {
        aiResponseContent = "Security is a priority. I noticed some potential vulnerabilities in your input handling. Always validate and sanitize user data.";
      } else {
        aiResponseContent = "That's an interesting question. Based on your codebase, I recommend refactoring the main loop to improve performance.";
      }

      setChatMessages(prev => [...prev, { role: 'ai', content: aiResponseContent }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProjectName(file.name.replace('.zip', ''));
    setView('scanning');
    setScanProgress(5);
    setCurrentLog("Initializing upload...");
    setChatMessages([]);
    setIsZipDownloaded(false);

    const formData = new FormData();
    formData.append('project', file);

    try {
      // Simulate initial upload progress
      let progress = 5;
      const uploadInterval = setInterval(() => {
        progress += 5;
        if (progress > 40) clearInterval(uploadInterval);
        setScanProgress(progress);
        setCurrentLog(`Uploading ${file.name}...`);
      }, 200);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      clearInterval(uploadInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error occurred');
      }

      setScanProgress(50);
      setCurrentLog("Backend received files. Extracting...");

      // Stream-like progress simulation
      const processInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 95) {
            clearInterval(processInterval);
            return 95;
          }
          return prev + 2;
        });
        
        const logs = [
           "Parsing AST structure...",
           "Identifying component boundaries...",
           "Connecting to Groq Llama-3.3-70b...",
           "Generating unit tests...",
           "Checking for security vulnerabilities..."
        ];
        setCurrentLog(logs[Math.floor(Math.random() * logs.length)]);
      }, 800);

      // Check Content Type to determine if it's a ZIP or JSON
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/zip")) {
        // Handle ZIP Download
        setCurrentLog("Generating fixed project...");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "NUR_QA_Fixed_Project.zip";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        
        setScanProgress(100);
        setCurrentLog("Fixed project downloaded!");
        setIsZipDownloaded(true);
        
        setTimeout(() => {
          setResults([]); 
          setView('dashboard');
        }, 1000);

      } else {
        // Handle JSON Response (if no fixes were made)
        const data = await response.json();
        clearInterval(processInterval);
        
        setScanProgress(100);
        setCurrentLog("Analysis Complete");
        
        setTimeout(() => {
          setResults(data.issues || []);
          setView('dashboard');
        }, 500);
      }

    } catch (error) {
      console.error("Analysis failed: ", error);
      setErrorMessage(error.message);
      setView('error');
    }
  };

  // --- NEW: GitHub Submit Handler ---
  const handleGithubSubmit = async (e) => {
    e.preventDefault();
    if (!githubUrl) return;

    // Parse GitHub URL (e.g., https://github.com/owner/repo)
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      setErrorMessage("Invalid GitHub URL. Use format: https://github.com/owner/repo");
      setView('error');
      return;
    }

    const owner = match[1];
    const repo = match[2].replace('.git', '');

    setProjectName(repo);
    setView('scanning');
    setIsGithubLoading(true);
    setScanProgress(10);
    setCurrentLog("Connecting to GitHub...");
    setIsZipDownloaded(false);

    try {
      const response = await fetch('/api/analyze-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'GitHub analysis failed');
      }

      setScanProgress(50);
      setCurrentLog("Backend received repo. Extracting...");

      // Stream-like progress simulation
      const processInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 95) {
            clearInterval(processInterval);
            return 95;
          }
          return prev + 2;
        });
        
        const logs = [
           "Cloning repository...",
           "Parsing AST structure...",
           "Connecting to AI...",
           "Generating fixes..."
        ];
        setCurrentLog(logs[Math.floor(Math.random() * logs.length)]);
      }, 800);

      // Check Content Type
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/zip")) {
        setCurrentLog("Generating fixed project...");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${repo}-fixed.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        
        setScanProgress(100);
        setCurrentLog("Fixed project downloaded!");
        setIsZipDownloaded(true);
        
        setTimeout(() => {
          setResults([]); 
          setView('dashboard');
        }, 1000);

      } else {
        const data = await response.json();
        clearInterval(processInterval);
        
        setScanProgress(100);
        setCurrentLog("Analysis Complete");
        
        setTimeout(() => {
          setResults(data.issues || []);
          setView('dashboard');
        }, 500);
      }

    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
      setView('error');
    } finally {
      setIsGithubLoading(false);
    }
  };

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
      {/* Background Elements */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none" />
      
       <div className="max-w-4xl w-full text-center z-10 animate-fade-in" >
         <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60" >
          {t.welcomeMessage}
         </h2>
         <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto" >
          NUR QA uses advanced LLMs to analyze your codebase, generate comprehensive tests, and fix bugs before they reach production.
         </p>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto" >
           {/* ZIP Upload */}
           <label className="group relative cursor-pointer" >
             <input type="file" accept=".zip" className="hidden" onChange={handleFileUpload} />
             <div className="h-48 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-4 bg-white/5 backdrop-blur-sm transition-all group-hover:border-red-500/50 group-hover:bg-red-500/5" >
               <div className="p-4 rounded-full bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform" >
                 <UploadCloud size={32} />
               </div>
               <div className="text-center" >
                 <p className="font-semibold text-lg text-gray-200">{t.uploadProject}</p>
                 <p className="text-sm text-gray-500 mt-1">ZIP, TAR.GZ</p>
               </div>
             </div>
           </label>

           {/* GitHub Input Form */}
           <form onSubmit={handleGithubSubmit} className="h-48 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 bg-white/5 backdrop-blur-sm p-6">
             <div className="w-full">
               <label className="block text-sm font-medium text-gray-300 mb-2">{t.connectGithub}</label>
               <input 
                 type="text" 
                 value={githubUrl}
                 onChange={(e) => setGithubUrl(e.target.value)}
                 placeholder="https://github.com/owner/repo"
                 className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500 outline-none"
               />
             </div>
             <Button variant="primary" icon={Github} disabled={isGithubLoading}>
               {isGithubLoading ? 'Analyzing...' : 'Analyze Repo'}
             </Button>
           </form>
         </div>
       </div>
     </main>
  );

  const renderScanning = () => (
     <main className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center relative" >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
       
        <div className="w-full max-w-2xl z-10" >
          <Card className="mb-8 border-red-500/30 bg-black/60" >
            <div className="flex items-center justify-between mb-4" >
              <div className="flex items-center gap-3" >
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono text-red-400">{t.processing}</span>
              </div>
              <span className="font-mono text-gray-400">{Math.round(scanProgress)}%</span>
            </div>
           
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden" >
              <div 
               className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-300"
               style={{ width: `${scanProgress}%` }}
             />
            </div>

            <div className="mt-6 font-mono text-sm text-green-400/80 h-24 overflow-hidden relative" >
              <div className="flex items-center gap-2 animate-pulse" >
                <ChevronRight size={14} />
               {currentLog}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-4" >
            {['Analyzing Syntax', 'Checking Security', 'Simulating User'].map((item, i) => (
               <div key={i} className={`p-4 rounded-xl border border-white/5 bg-white/5 text-center transition-all duration-500 ${scanProgress > (i+1)*30 ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'text-gray-500'}`} >
                 <div className="flex justify-center mb-2" >
                  {scanProgress > (i+1)*30 ? <CheckCircle2 className="text-green-500" /> : <Loader2 className="animate-spin text-gray-500" />}
                 </div>
                 <span className="text-xs font-medium uppercase tracking-wider">{item}</span>
               </div>
            ))}
          </div>
        </div>
     </main>
  );

  const renderError = () => (
     <main className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center relative" >
       <Card className="max-w-md w-full border-red-500/50 bg-red-900/10 text-center" >
         <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6" >
           <AlertTriangle size={32} className="text-red-500" />
         </div>
         <h2 className="text-2xl font-bold text-white mb-2">{t.errorTitle}</h2>
         <p className="text-gray-400 mb-8">{errorMessage}</p>
         <Button onClick={() => setView('landing')} variant="outline" icon={RefreshCw} >
          {t.retry}
         </Button>
       </Card>
     </main>
  );

  const renderDashboard = () => (
     <main className="min-h-screen pt-24 px-6 pb-12 flex flex-col gap-6 max-w-7xl mx-auto" >
      {/* Top Stats Row */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6" >
         <Card delay={0.1} className="bg-gradient-to-br from-green-900/20 to-black/40 border-green-500/20" >
           <div className="flex items-center justify-between mb-2" >
             <span className="text-gray-400 text-sm font-medium">{t.passed}</span>
             <CheckCircle2 className="text-green-500" size={20} />
           </div>
           <div className="text-3xl font-bold text-white" >
            {results.filter(r => !r.type || r.type === 'success').length + Math.floor(Math.random() * 100) + 50}
           </div>
           <div className="text-xs text-green-400 mt-1">Checks passed</div>
         </Card>

         <Card delay={0.2} className="bg-gradient-to-br from-red-900/20 to-black/40 border-red-500/20" >
           <div className="flex items-center justify-between mb-2" >
             <span className="text-gray-400 text-sm font-medium">{t.failed}</span>
             <Bug className="text-red-500" size={20} />
           </div>
           <div className="text-3xl font-bold text-white">{results.filter(r => r.type === 'error').length}</div>
           <div className="text-xs text-red-400 mt-1">Requires attention</div>
         </Card>

         <Card delay={0.3} className="bg-gradient-to-br from-blue-900/20 to-black/40 border-blue-500/20" >
           <div className="flex items-center justify-between mb-2" >
             <span className="text-gray-400 text-sm font-medium">{t.performanceScore}</span>
             <Zap className="text-blue-500" size={20} />
           </div>
           <div className="text-3xl font-bold text-white" >
            {Math.max(0, 100 - (results.length * 5))}
             <span className="text-lg text-gray-500">/100</span>
           </div>
           <div className="text-xs text-blue-400 mt-1">Based on issues</div>
         </Card>

         <Card delay={0.4} className="bg-gradient-to-br from-purple-900/20 to-black/40 border-purple-500/20" >
           <div className="flex items-center justify-between mb-2" >
             <span className="text-gray-400 text-sm font-medium">{t.testCoverage}</span>
             <Code2 className="text-purple-500" size={20} />
           </div>
           <div className="text-3xl font-bold text-white" >
             {Math.min(100, Math.max(40, 100 - (results.filter(r => r.type === 'warning').length * 2)))}%
           </div>
           <div className="text-xs text-purple-400 mt-1">Estimated</div>
         </Card>
       </div>

      {/* Main Content Area */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1" >
        
        {/* Left Column: Issues List */}
         <div className="lg:col-span-2 space-y-6" >
           <div className="flex items-center justify-between" >
             <h3 className="text-xl font-bold text-white flex items-center gap-2" >
               <Terminal size={20} className="text-red-500" />
              {t.results}
             </h3>
             <div className="flex gap-2" >
               <button 
                onClick={() => setActiveTab('issues')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'issues' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
               >
                Issues
               </button>
               <button 
                onClick={() => setActiveTab('coverage')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'coverage' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
               >
                Files Analyzed
               </button>
             </div>
           </div>

          {isZipDownloaded && (
             <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-between mb-4 animate-fade-in-up">
               <div className="flex items-center gap-3">
                 <CheckCircle2 className="text-green-500" />
                 <span className="text-green-400 font-medium">Fixed project downloaded successfully!</span>
               </div>
               <Button variant="outline" icon={Download} onClick={() => window.location.reload()}>
                 Analyze Another
               </Button>
             </div>
          )}

          {results.length === 0 && !isZipDownloaded ? (
              <div className="p-12 text-center border border-white/10 rounded-xl bg-white/5" >
                 <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
                 <h3 className="text-xl font-bold text-white">No Issues Found!</h3>
                 <p className="text-gray-400 mt-2">Your code looks clean.</p>
              </div>
          ) : (
             <div className="space-y-4" >
              {results.map((result, idx) => (
                 <div
                  key={idx}
                  className="bg-black/40 border border-white/10 rounded-xl p-5 hover:border-red-500/30 transition-colors group animate-fade-in-up"
                  style={{ animationDelay: `${0.5 + (idx * 0.1)}s` }}
                 >
                   <div className="flex items-start justify-between mb-3" >
                     <div className="flex items-center gap-3" >
                       <Badge type={result.type} text={result.type.toUpperCase()} />
                       <span className="font-mono text-sm text-gray-400 flex items-center gap-1" >
                         <FileCode size={12} />
                        {result.file}:{result.line}
                       </span>
                     </div>
                   </div>
                  
                   <h4 className="text-lg font-medium text-gray-200 mb-2">{result.message}</h4>
                   <p className="text-gray-500 text-sm mb-4">{result.suggestion}</p>
                  
                  {result.fix && (
                     <div className="bg-black/60 rounded-lg p-4 border border-white/5 relative group/code" >
                       <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity" >
                          <button className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded">Copy</button>
                       </div>
                       <pre className="font-mono text-sm text-green-400 overflow-x-auto" >
                         <code>{result.fix}</code>
                       </pre>
                     </div>
                  )}
                 </div>
              ))}
             </div>
          )}
         </div>

        {/* Right Column: Assistant / Chat */}
         <div className="lg:col-span-1" >
           <Card className="h-full flex flex-col bg-gradient-to-b from-black/60 to-red-900/10 border-red-500/20" >
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10" >
               <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center animate-pulse" >
                 <Cpu size={16} className="text-white" />
               </div>
               <div>
                 <h3 className="font-bold text-white">NUR Assistant</h3>
                 <p className="text-xs text-green-400 flex items-center gap-1" >
                   <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Online via Groq
                 </p>
               </div>
             </div>

             <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar mb-4 min-h-[300px]" >
               {chatMessages.map((msg, idx) => (
                 <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                   <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${msg.role === 'ai' ? 'bg-red-900/50 text-red-400' : 'bg-blue-900/50 text-blue-400'}`}>
                     {msg.role === 'ai' ? 'AI' : 'You'}
                   </div>
                   <div className={`rounded-2xl p-3 text-sm max-w-[85%] ${msg.role === 'ai' ? 'bg-white/5 rounded-tl-none text-gray-300' : 'bg-red-600/20 rounded-tr-none text-white'}`}>
                     {msg.content}
                   </div>
                 </div>
               ))}
               {isTyping && (
                 <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-red-900/50 flex-shrink-0 flex items-center justify-center text-xs font-bold text-red-400">AI</div>
                   <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 text-sm text-gray-300 flex items-center gap-1">
                     <Loader2 size={14} className="animate-spin" /> Thinking...
                   </div>
                 </div>
               )}
               <div ref={chatEndRef} />
             </div>

             <div className="mt-auto" >
               <form onSubmit={handleSendMessage} className="relative" >
                 <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={t.chatPlaceholder}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
                />
                 <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-red-600 rounded-lg text-white hover:bg-red-500 transition-colors" >
                   <Send size={16} />
                 </button>
               </form>
             </div>
           </Card>
         </div>

       </div>
     </main>
  );

  return (
     <div className={`min-h-screen font-sans selection:bg-red-500/30 selection:text-white ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`} >
       <Head>
         <title>NUR QA - Intelligent Testing</title>
         <meta name="viewport" content="width=device-width, initial-scale=1" />
       </Head>

      {/* Pomegranate Background Effect */}
       <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" >
        {/* Deep Red Base */}
         <div className="absolute inset-0 bg-gradient-to-br from-[#1a0505] via-[#0f0f0f] to-[#000000]" />
        
        {/* Abstract Seeds/Shapes - Blurred heavily for texture */}
         <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-900/20 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-800/10 rounded-full blur-[80px] mix-blend-screen" />
        
        {/* Grain Overlay */}
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} ></div>
       </div>

      {renderHeader()}
      
       <div className="relative z-10" >
        {view === 'landing' && renderLanding()}
        {view === 'scanning' && renderScanning()}
        {view === 'dashboard' && renderDashboard()}
        {view === 'error' && renderError()}
       </div>

       <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-pulse-slow {
          animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.5s ease-out forwards;
        }
         /* Custom Scrollbar for Chat */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.3);
          border-radius: 4px;
         }
      `}</style>
     </div>
  );
}
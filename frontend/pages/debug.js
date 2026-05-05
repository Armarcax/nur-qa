import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    setLogs((prev) => [...prev, msg]);
    console.log(msg);
  };

  useEffect(() => {
    const runDebug = async () => {
      addLog("🚀 Starting Debug...");
      
      // 1. Check Env Variable
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      addLog(`📌 NEXT_PUBLIC_BACKEND_URL from env: "${backendUrl}"`);

      if (!backendUrl) {
        addLog("❌ ERROR: NEXT_PUBLIC_BACKEND_URL is undefined!");
        return;
      }

      // 2. Try to connect
      try {
        addLog(`🔌 Attempting to connect to: ${backendUrl}/health`);
        const response = await fetch(`${backendUrl}/health`, {
          method: 'GET',
          mode: 'cors' // Important for cross-origin
        });

        if (response.ok) {
          const data = await response.json();
          addLog(`✅ Success! Backend responded: ${JSON.stringify(data)}`);
        } else {
          addLog(`⚠️ Backend responded with status: ${response.status}`);
        }
      } catch (error) {
        addLog(`❌ Connection Failed: ${error.message}`);
        addLog("💡 Tip: Check if Render is awake and CORS is enabled.");
      }
    };

    runDebug();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', background: '#000', color: '#0f0', minHeight: '100vh' }}>
      <h1>NUR QA Debug Console</h1>
      <div>
        {logs.map((log, i) => (
          <div key={i} style={{ marginBottom: '5px' }}>{log}</div>
        ))}
      </div>
    </div>
  );
}
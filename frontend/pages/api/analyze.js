import http from 'http';
import https from 'https';
import { URL } from 'url';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Օգտագործում ենք NEXT_PUBLIC_BACKEND_URL, որը Vercel-ում և .env.local-ում է
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  
  console.log(`[Proxy] Forwarding request to: ${BACKEND_URL}/api/analyze`);

  try {
    const targetUrl = new URL('/api/analyze', BACKEND_URL);
    
    const options = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
      path: targetUrl.pathname,
      method: 'POST',
      headers: {
        ...req.headers,
        host: targetUrl.host,
        connection: 'close' // Կարևոր է պրոքսիի համար
      },
    };

    const client = targetUrl.protocol === 'https:' ? https : http;

    const proxyReq = client.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error('[Proxy Error]', err.message);
      if (!res.headersSent) {
        res.status(502).json({ error: `Failed to connect to backend at ${BACKEND_URL}. Check if it's running.` });
      } else {
        res.end();
      }
    });

    req.pipe(proxyReq, { end: true });

  } catch (error) {
    console.error('[Proxy Setup Error]', error);
    res.status(500).json({ error: 'Internal server error in proxy setup' });
  }
}
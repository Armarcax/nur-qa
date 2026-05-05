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

  // Ստուգում ենք NEXT_PUBLIC_BACKEND_URL, քանի որ դա Vercel-ում հասանելի է
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5000';
  
  console.log(`Proxying request to: ${BACKEND_URL}/api/analyze`);

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
        // Հեռացնում ենք connection header-ը, որպեսզի խնդիրներ չլինեն
        connection: 'close'
      },
    };

    const client = targetUrl.protocol === 'https:' ? https : http;

    const proxyReq = client.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy Error:', err.message);
      if (!res.headersSent) {
        res.status(502).json({ error: `Failed to connect to backend at ${BACKEND_URL}. Is it running?` });
      } else {
        res.end();
      }
    });

    req.pipe(proxyReq, { end: true });

  } catch (error) {
    console.error('Server Setup Error:', error);
    res.status(500).json({ error: 'Internal server error in proxy' });
  }
}
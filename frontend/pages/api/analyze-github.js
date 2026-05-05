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

  // Վերցնում ենք Backend URL-ը .env-ից
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!BACKEND_URL) {
    console.error('[NUR QA Proxy] NEXT_PUBLIC_BACKEND_URL is missing');
    return res.status(500).json({ error: 'Backend URL not configured' });
  }

  try {
    const targetUrl = new URL('/api/analyze-github', BACKEND_URL);
    
    // Մաքրում ենք headers-ները
    const safeHeaders = {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
    };

    const options = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
      path: targetUrl.pathname,
      method: 'POST',
      headers: safeHeaders,
    };

    const client = targetUrl.protocol === 'https:' ? https : http;

    const proxyReq = client.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error('[GitHub Proxy Error]', err.message);
      if (!res.headersSent) {
        res.status(502).json({ error: 'Failed to connect to backend for GitHub analysis' });
      }
    });

    req.pipe(proxyReq, { end: true });

  } catch (error) {
    console.error('[GitHub Proxy Setup Error]', error);
    res.status(500).json({ error: 'Internal server error in proxy setup' });
  }
}
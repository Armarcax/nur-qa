import http from 'http';
import https from 'https';
import { URL } from 'url';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  try {
    const targetUrl = new URL('/api/analyze-direct', BACKEND_URL);
    const safeHeaders = {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
      'accept': req.headers['accept'],
    };

    const options = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
      path: targetUrl.pathname + targetUrl.search,
      method: 'POST',
      headers: safeHeaders,
    };

    const client = targetUrl.protocol === 'https:' ? https : http;
    const proxyReq = client.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error('[NUR Proxy Error]', err.message);
      if (!res.headersSent) res.status(502).json({ error: 'Bad Gateway' });
      else res.end();
    });

    req.pipe(proxyReq, { end: true });

  } catch (error) {
    console.error('[NUR Proxy Setup Error]', error);
    res.status(500).json({ error: 'Proxy Setup Error' });
  }
}

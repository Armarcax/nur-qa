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

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!BACKEND_URL) {
    console.error('[NUR QA Proxy] NEXT_PUBLIC_BACKEND_URL is not defined in Vercel Env Vars');
    return res.status(500).json({ error: 'Backend URL is not configured on the server.' });
  }

  console.log(`[NUR QA Proxy] Forwarding request to: ${BACKEND_URL}/api/analyze`);

  try {
    const targetUrl = new URL('/api/analyze', BACKEND_URL);

    // Clean headers to prevent ERR_HTTP_INVALID_HEADER_VALUE on Vercel
    const safeHeaders = {};
    if (req.headers['content-type']) safeHeaders['content-type'] = req.headers['content-type'];
    if (req.headers['content-length']) safeHeaders['content-length'] = req.headers['content-length'];

    const options = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
      path: targetUrl.pathname + targetUrl.search,
      method: 'POST',
      headers: safeHeaders,
    };

    const client = targetUrl.protocol === 'https:' ? https : http;

    const proxyReq = client.request(options, (proxyRes) => {
      // Ensure specific headers are not causing issues
      const resHeaders = { ...proxyRes.headers };
      delete resHeaders['transfer-encoding'];
      delete resHeaders['connection'];

      res.writeHead(proxyRes.statusCode, resHeaders);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error('[NUR QA Proxy Error]', err.message);
      if (!res.headersSent) {
        res.status(502).json({ error: `Failed to connect to backend at ${BACKEND_URL}.` });
      } else {
        res.end();
      }
    });

    req.pipe(proxyReq, { end: true });

  } catch (error) {
    console.error('[NUR QA Proxy Setup Error]', error);
    res.status(500).json({ error: 'Internal server error in proxy setup' });
  }
}
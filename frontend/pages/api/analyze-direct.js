export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  console.log(`[NUR QA Proxy] Forwarding multi-file upload to: ${backendUrl}/api/analyze-direct`);

  try {
    const safeHeaders = {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
      'accept': req.headers['accept']
    };

    const response = await fetch(`${backendUrl}/api/analyze-direct`, {
      method: 'POST',
      headers: safeHeaders,
      body: req,
      duplex: 'half'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[NUR QA Proxy] Backend error: ${response.status} - ${errorText}`);
      return res.status(response.status).send(errorText);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error("[NUR QA Proxy] Error proxying multi-file request:", error);
    return res.status(500).json({ error: "Failed to connect to analysis engine" });
  }
}

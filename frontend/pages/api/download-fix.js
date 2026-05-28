export default async function handler(req, res) {
  const { sessionId } = req.query;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required" });
  }

  try {
    const response = await fetch(`${backendUrl}/api/download-fix?sessionId=${sessionId}`);

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).send(errorText);
    }

    const contentType = response.headers.get('content-type');
    const contentDisposition = response.headers.get('content-disposition');

    res.setHeader('Content-Type', contentType || 'application/zip');
    if (contentDisposition) {
      res.setHeader('Content-Disposition', contentDisposition);
    }

    const buffer = await response.arrayBuffer();
    res.status(200).send(Buffer.from(buffer));

  } catch (error) {
    console.error("[Download Proxy Error]", error);
    res.status(500).json({ error: "Failed to proxy download request" });
  }
}

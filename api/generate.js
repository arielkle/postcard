export default async function handler(req, res) {
  // הגדרת כותרות CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key missing. Please set GEMINI_API_KEY in Vercel settings.' });
  }

  try {
    const { promptInput } = req.body;
    
    // כתובת ה-API של Imagen 4.0
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: { prompt: `A magical illustrated postcard of: ${promptInput}` },
        parameters: { sampleCount: 1 }
      })
    });

    const data = await response.json();

    // אם גוגל החזירה שגיאה
    if (data.error || (data.predictions && data.predictions[0] && data.predictions[0].error)) {
      const errorMsg = data.error?.message || data.predictions[0].error;
      return res.status(400).json({ error: errorMsg });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
}

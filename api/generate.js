export default async function handler(req, res) {
  // הגדרת כותרות CORS לאבטחה וגישה מהדפדפן
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
    
    // כתובת ה-API המעודכנת למודל Imagen 3
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [
          { 
            prompt: `A beautiful, detailed illustration of an imaginary land: ${promptInput}. Storybook style, vibrant colors.` 
          }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          safetySetting: "BLOCK_LOW_AND_ABOVE"
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // חילוץ הודעת השגיאה המפורטת מגוגל
      const errorMsg = data.error?.message || "Unknown error from Google API";
      return res.status(response.status).json({ 
        error: `שגיאת גוגל: ${errorMsg}`,
        technicalDetails: data 
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
}

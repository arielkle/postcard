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
    return res.status(500).json({ error: 'מפתח API לא הוגדר בשרת Vercel' });
  }

  try {
    const { promptInput } = req.body;
    
    // שליחה למודל Imagen - שים לב למבנה ה-instances המדויק (מערך)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;
    
    console.log("Sending prompt to Google:", promptInput);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [
          { prompt: `A magical, detailed, vibrant illustration of an imaginary land: ${promptInput}. Storybook style, no text.` }
        ],
        parameters: { 
          sampleCount: 1,
          aspectRatio: "1:1"
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Google API Error:", data);
      return res.status(response.status).json({ 
        error: data.error?.message || "שגיאה בתקשורת עם גוגל",
        details: data 
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({ error: 'שגיאה פנימית בשרת: ' + error.message });
  }
}

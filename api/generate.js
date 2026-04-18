export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'מפתח API לא נמצא בהגדרות' });

  try {
    const { promptInput } = req.body;
    
    // פנייה סופר מהירה ל-Gemini 1.5 Flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Translate to a short English image prompt: ${promptInput}`
          }]
        }],
        generationConfig: {
            maxOutputTokens: 40 // מגביל את התשובה כדי שתהיה מהירה מאוד
        }
      })
    });

    const data = await response.json();
    const refinedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text || promptInput;

    return res.status(200).json({ refinedPrompt: refinedPrompt.trim() });

  } catch (error) {
    return res.status(500).json({ error: 'שגיאת שרת: ' + error.message });
  }
}

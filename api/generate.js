export default async function handler(req, res) {
  // הגדרות CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey.length < 10) {
    return res.status(500).json({ 
      error: 'מפתח ה-API חסר או קצר מדי. וודא שהגדרת אותו ב-Vercel תחת GEMINI_API_KEY.' 
    });
  }

  try {
    const { promptInput } = req.body;
    
    // שליחה ל-Gemini 1.5 Flash לתרגום מהיר
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Translate this to a 5-word English image prompt: ${promptInput}` }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `שגיאה מגוגל: ${data.error?.message || 'לא ידוע'}` 
      });
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || promptInput;
    return res.status(200).json({ refinedPrompt: result.trim() });

  } catch (err) {
    return res.status(500).json({ error: 'שגיאת שרת פנימית: ' + err.message });
  }
}

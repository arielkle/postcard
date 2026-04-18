export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'מפתח API לא הוגדר ב-Vercel' });

  try {
    const { promptInput } = req.body;
    
    // שינוי ל-v1 (יציב) ושימוש בשם המודל המלא
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Summarize this Hebrew description into 5 English keywords for image generation: ${promptInput}` }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // אם v1 לא עובד, ננסה גרסה חלופית או נחזיר שגיאה מפורטת
      return res.status(response.status).json({ 
        error: `Google API Error: ${data.error?.message || 'Unknown'}` 
      });
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "magical land";
    return res.status(200).json({ refinedPrompt: result.trim() });

  } catch (err) {
    return res.status(500).json({ error: 'Server Error: ' + err.message });
  }
}

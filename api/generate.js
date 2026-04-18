export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'מפתח ה-API לא הוגדר כראוי ב-Vercel' });

  try {
    const { promptInput } = req.body;
    
    // שימוש במודל המעודכן ביותר gemini-1.5-flash-latest
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Generate a 5-word English visual prompt for: ${promptInput}` }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // אם גוגל מחזיר שגיאה, נחזיר תרגום בסיסי "קשיח" כדי שהציור יצליח
      return res.status(200).json({ refinedPrompt: "magical fantasy landscape " + promptInput.substring(0, 10) });
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "magical land";
    return res.status(200).json({ refinedPrompt: result.trim() });

  } catch (err) {
    // במקרה של קריסה, מחזירים פרומפט באנגלית כדי שהתהליך ימשך
    return res.status(200).json({ refinedPrompt: "magical landscape" });
  }
}

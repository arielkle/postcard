export default async function handler(req, res) {
  // הגדרות אבטחה וגישה (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'מפתח API לא הוגדר ב-Vercel' });

  try {
    const { promptInput } = req.body;
    
    // פנייה ל-Gemini 1.5 Flash (הכי מהיר שיש) כדי לתרגם ולשפר את התיאור
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Translate this Hebrew description into a short, effective English image prompt (max 30 words). Focus on visual elements for a magical postcard. Output ONLY the English prompt. Description: ${promptInput}`
          }]
        }]
      })
    });

    const data = await response.json();
    const refinedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text || promptInput;

    // מחזיר את התרגום לאפליקציה
    return res.status(200).json({ refinedPrompt: refinedPrompt.trim() });

  } catch (error) {
    return res.status(500).json({ error: 'Error: ' + error.message });
  }
}

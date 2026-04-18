export default async function handler(req, res) {
  // הגדרות CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'מפתח API חסר בהגדרות Vercel' });

  try {
    const { promptInput } = req.body;
    
    // פנייה למודל Gemini 1.5 Flash - המודל החינמי והזמין ביותר
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an AI assistant that helps students create postcards. 
            Translate this Hebrew description into a detailed English image prompt for a magical, colorful illustration. 
            Keep it whimsical and artistic. Output ONLY the English description.
            Hebrew: ${promptInput}`
          }]
        }]
      })
    });

    const data = await response.json();
    const refinedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text || promptInput;

    // מחזירים את הפרומפט המשופר באנגלית לאפליקציה
    return res.status(200).json({ refinedPrompt: refinedPrompt.trim() });

  } catch (error) {
    return res.status(500).json({ error: 'Internal Error: ' + error.message });
  }
}

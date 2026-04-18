export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing API Key' });

  try {
    const { promptInput } = req.body;
    
    // שימוש במודל פלאש המהיר ביותר עם הנחיה ליצירתיות ויזואלית
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `You are a professional image prompt engineer. 
            Transform this Hebrew description into a vivid, highly detailed, and artistic English image prompt for a magical postcard. 
            Use artistic keywords like "digital art", "octane render", "fantasy lighting", "vibrant colors".
            STRICT RULE: Output ONLY the English prompt text. No Hebrew, no explanations.
            Hebrew input: ${promptInput}` 
          }] 
        }],
        generationConfig: { 
          maxOutputTokens: 70,
          temperature: 0.7 
        }
      })
    });

    const data = await response.json();
    let result = data.candidates?.[0]?.content?.parts?.[0]?.text || "magical fantasy landscape, highly detailed, cinematic lighting";
    
    // ניקוי שאריות עברית במידה ויש
    result = result.replace(/[\u0590-\u05FF]/g, ''); 

    return res.status(200).json({ refinedPrompt: result.trim() });

  } catch (err) {
    return res.status(200).json({ refinedPrompt: "dreamy magical fantasy landscape, artstation style, 8k resolution" });
  }
}

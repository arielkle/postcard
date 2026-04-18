export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing API Key' });

  try {
    const { promptInput } = req.body;
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `Translate this Hebrew description into a professional English image prompt. 
            STRICT RULES:
            1. Keep the EXACT subject and theme requested by the user.
            2. DO NOT add "magical", "postcard", or "fantasy" unless the user asked for it.
            3. Enhance the visual details (lighting, style, texture) to make it look high-quality.
            4. Output ONLY the English prompt. No Hebrew, no explanations.
            
            Hebrew input: ${promptInput}` 
          }] 
        }],
        generationConfig: { 
          maxOutputTokens: 80,
          temperature: 0.4 // טמפרטורה נמוכה יותר כדי להיות פחות "יצירתי" ויותר נאמן למקור
        }
      })
    });

    const data = await response.json();
    let result = data.candidates?.[0]?.content?.parts?.[0]?.text || promptInput;
    
    // ניקוי עברית למקרה ששורבבה
    result = result.replace(/[\u0590-\u05FF]/g, ''); 

    return res.status(200).json({ refinedPrompt: result.trim() });

  } catch (err) {
    return res.status(200).json({ refinedPrompt: "high quality image of requested subject" });
  }
}

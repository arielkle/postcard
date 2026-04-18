export default async function handler(req, res) {
  // מוודאים שרק האפליקציה שלנו שולחת בקשות מסוג POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // השרת שולף את המפתח הסודי מההגדרות המאובטחות שלו
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key is missing on the server' });
  }

  try {
    const { promptInput } = req.body;
    
    // מוסיפים את ההנחיות כדי שזה ייראה כמו גלויה
    const enhancedPrompt = `A beautiful, magical, highly detailed illustrated postcard of an imaginary land. Description: ${promptInput}. Vibrant colors, storybook style, no text in the image.`;

    // השרת שלנו (ולא הדפדפן של הילד) הוא זה שפונה לגוגל
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: { prompt: enhancedPrompt },
        parameters: { sampleCount: 1 }
      })
    });

    const data = await response.json();
    
    // השרת שולח את התמונה חזרה לאפליקציה שלך
    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating image' });
  }
}

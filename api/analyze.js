export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    
    try {
      const { imageBase64, mediaType } = req.body;
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
              { type: 'text', text: 'You are an expert interior designer. Analyze this interior image and return ONLY a JSON object. No explanation, no markdown, no backticks. Start your response with { and end with }.\n\nUse this exact structure:\n{"title":"한글 무드 제목 2-3단어","titleEn":"English mood 3-4 words","description":"한국어 2문장 공간 설명","keywords":["keyword1","keyword2","keyword3","keyword4","keyword5"],"searchQuery":"english unsplash search terms interior style","searchQueries":["main search query interior","variation search query","another variation"],"renderPrompt":"English rendering prompt for AI image generation 50-70 words"}' }
            ]
          }]
        })
      });
      const data = await response.json();
      if (data.error) return res.status(500).json({ error: data.error.message });
      const text = data.content.map(b => b.text || '').join('');
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return res.status(500).json({ error: 'JSON 파싱 실패' });
      res.json(JSON.parse(match[0]));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

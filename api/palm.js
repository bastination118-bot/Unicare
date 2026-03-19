// Vercel Serverless Function - 手相分析 AI 解读
// 调用 Moonshot Kimi API 分析手相图片

export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, gender } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    // 构建提示词
    const prompt = `你是一位专业的手相分析师。请分析这张手掌照片，识别五大线纹（生命线、智慧线、感情线、事业线、财运线）并提供详细解读。

【分析要求】
1. 生命线：起点、长度、弧度、断裂情况，代表生命力、健康状况
2. 智慧线：起点、长度、分叉情况，代表思维能力、学习能力
3. 感情线：起点、终点、岛纹、分叉，代表感情态度、婚姻状况
4. 事业线：清晰与否、断续情况，代表事业稳定性、成就
5. 财运线：有无、清晰程度，代表财富运势

【输出格式】
请严格按照以下 JSON 格式输出：
{
  "overall": "整体手相分析总结",
  "lines": {
    "life": { 
      "name": "生命线", 
      "status": "清晰/模糊/断裂", 
      "score": 85, 
      "analysis": "详细分析..." 
    },
    "wisdom": { 
      "name": "智慧线", 
      "status": "长/短/分叉", 
      "score": 80, 
      "analysis": "详细分析..." 
    },
    "emotion": { 
      "name": "感情线", 
      "status": "描述", 
      "score": 75, 
      "analysis": "详细分析..." 
    },
    "career": { 
      "name": "事业线", 
      "status": "描述", 
      "score": 70, 
      "analysis": "详细分析..." 
    },
    "wealth": { 
      "name": "财运线", 
      "status": "描述", 
      "score": 65, 
      "analysis": "详细分析..." 
    }
  },
  "suggestion": "综合建议..."
}`;

    // 调用 Moonshot API
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MOONSHOT_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.MOONSHOT_MODEL || 'kimi-k2.5',
        messages: [
          { 
            role: 'system', 
            content: '你是一位专业的手相分析师，擅长解读手相五大线纹。请基于图片提供详细分析。' 
          },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { url: image } 
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Moonshot API error:', error);
      return res.status(500).json({ error: 'AI service error', details: error });
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // 尝试解析 JSON 响应
    let palmData;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        palmData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // 如果解析失败，返回模拟结构
      palmData = {
        overall: aiResponse.slice(0, 200) + '...',
        lines: {
          life: { name: '生命线', status: '清晰', score: 80, analysis: '生命力旺盛，健康状况良好' },
          wisdom: { name: '智慧线', status: '较长', score: 75, analysis: '思维敏捷，学习能力强' },
          emotion: { name: '感情线', status: '平稳', score: 70, analysis: '感情态度认真，对待感情专一' },
          career: { name: '事业线', status: '清晰', score: 75, analysis: '事业稳定，有发展潜力' },
          wealth: { name: '财运线', status: '较好', score: 70, analysis: '财运平稳，理财能力不错' }
        },
        suggestion: '建议保持积极心态，把握机遇，注意健康平衡。'
      };
    }

    return res.status(200).json({
      success: true,
      data: palmData
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

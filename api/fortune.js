// Vercel Serverless Function - 八字运势 AI 解读
// 此 API 代理调用 Moonshot Kimi API，保护 API Key 不暴露在前端

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
    const { bazi, wuxingCount, gender } = req.body;

    if (!bazi) {
      return res.status(400).json({ error: 'Missing bazi data' });
    }

    // 构建八字信息字符串
    const baziString = `${bazi.yearGan}${bazi.yearZhi}年 ${bazi.monthGan}${bazi.monthZhi}月 ${bazi.dayGan}${bazi.dayZhi}日 ${bazi.hourGan}${bazi.hourZhi}时`;
    
    // 构建五行信息
    const wuxingMap = { jin: '金', mu: '木', shui: '水', huo: '火', tu: '土' };
    const wuxingString = Object.entries(wuxingCount || {})
      .map(([k, v]) => `${wuxingMap[k]}:${v}`)
      .join(', ');

    // 构建提示词
    const prompt = `你是一位专业的八字命理分析师。请根据以下八字信息，为用户提供专业的今日运势解读。

【用户信息】
- 性别：${gender === 'male' ? '男' : '女'}
- 八字：${baziString}
- 五行分布：${wuxingString}

【分析要求】
1. 分析八字的日主强弱和喜用神
2. 结合今日日期（${new Date().toLocaleDateString('zh-CN')}），分析今日运势
3. 从事业、财运、感情、健康四个维度给出具体建议
4. 给出综合评分（0-100分）
5. 给出幸运色和幸运数字

【输出格式】
请严格按照以下 JSON 格式输出，不要包含其他内容：
{
  "analysis": "八字简要分析...",
  "career": { "score": 85, "advice": "事业建议..." },
  "wealth": { "score": 80, "advice": "财运建议..." },
  "love": { "score": 75, "advice": "感情建议..." },
  "health": { "score": 90, "advice": "健康建议..." },
  "overallScore": 82,
  "luckyColor": "紫色",
  "luckyNumber": 8,
  "summary": "今日运势总结..."
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
          { role: 'system', content: '你是一位专业的八字命理分析师，擅长八字排盘和运势解读。请用专业但易懂的语言为用户分析。' },
          { role: 'user', content: prompt }
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
    let fortuneData;
    try {
      // 提取 JSON 部分
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        fortuneData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // 如果解析失败，返回原始文本
      fortuneData = {
        analysis: aiResponse,
        career: { score: 80, advice: '详见分析内容' },
        wealth: { score: 80, advice: '详见分析内容' },
        love: { score: 80, advice: '详见分析内容' },
        health: { score: 80, advice: '详见分析内容' },
        overallScore: 80,
        luckyColor: '紫色',
        luckyNumber: 8,
        summary: aiResponse.slice(0, 100) + '...'
      };
    }

    return res.status(200).json({
      success: true,
      data: fortuneData,
      bazi: baziString
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

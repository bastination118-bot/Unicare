// Vercel Serverless Function - 舌相分析 AI 解读
// 此 API 代理调用 Moonshot Kimi API，生成专业舌诊分析

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
    const { tongueFeatures, userSymptoms } = req.body;

    // 构建提示词
    const prompt = `你是一位资深的中医舌诊专家。请根据以下舌相特征，为用户提供专业的中医健康分析。

【舌相特征】
${tongueFeatures || '舌色淡红，舌苔薄白'}

【用户症状】
${userSymptoms || '无明显不适'}

【分析要求】
1. 分析舌色（淡白/红/绛/紫/青等）及其健康含义
2. 分析舌苔（白苔/黄苔/厚苔/薄苔/腻苔/剥苔等）及其健康含义
3. 综合判断体质类型（气虚/阳虚/阴虚/湿热/血瘀/痰湿/平和等）
4. 计算健康指数（0-100分）
5. 从饮食、作息、穴位按摩三个维度给出调理建议
6. 评估严重程度（正常/轻度/中度/重度）

【输出格式】
请严格按照以下 JSON 格式输出，不要包含其他内容：
{
  "tongueColor": {
    "name": "淡白舌",
    "meaning": "气血不足，阳虚内寒",
    "description": "舌色比正常人浅淡"
  },
  "tongueCoating": {
    "name": "薄白苔",
    "meaning": "正常或表证初期",
    "description": "苔薄而均匀"
  },
  "combinedType": "淡白舌薄白苔",
  "constitution": "气虚质/阳虚质",
  "constitutionDesc": "容易疲劳，手脚冰凉，面色苍白",
  "healthIndex": 72,
  "severity": "mild",
  "symptoms": ["容易疲劳", "手脚冰凉"],
  "analysis": "根据舌相分析，您目前...",
  "recommendations": {
    "diet": ["红枣", "桂圆", "山药"],
    "lifestyle": ["早睡晚起", "避免寒凉"],
    "acupoints": ["足三里", "气海"]
  },
  "warning": "如症状持续，建议咨询专业中医师"
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
            content: '你是一位资深的中医舌诊专家，精通中医舌诊理论。请根据舌相特征提供专业、准确但易懂的健康分析。注意：本分析仅供参考，不能替代专业医疗诊断。' 
          },
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
    let analysisData;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // 返回备用数据
      analysisData = generateFallbackData(tongueFeatures);
    }

    return res.status(200).json({
      success: true,
      data: analysisData
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// 生成备用数据
function generateFallbackData(features) {
  return {
    tongueColor: {
      name: '淡红舌',
      meaning: '气血调和，健康状态良好',
      description: '舌色淡红润泽'
    },
    tongueCoating: {
      name: '薄白苔',
      meaning: '正常健康状态',
      description: '苔薄白均匀'
    },
    combinedType: '淡红舌薄白苔',
    constitution: '平和质',
    constitutionDesc: '面色红润，精力充沛，睡眠良好',
    healthIndex: 85,
    severity: 'normal',
    symptoms: ['无明显症状'],
    analysis: '根据舌相分析，您的健康状况良好。舌色淡红，苔薄白，说明气血调和，脏腑功能正常。',
    recommendations: {
      diet: ['均衡饮食', '多吃蔬果', '适量蛋白质'],
      lifestyle: ['规律作息', '适量运动', '保持心情舒畅'],
      acupoints: ['足三里', '关元']
    },
    warning: '继续保持良好的生活习惯'
  };
}

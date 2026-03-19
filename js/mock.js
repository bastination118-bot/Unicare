// 模拟数据
const MockData = {
  // 今日运势
  dailyFortunes: [
    { brief: '今日运势平稳，适合处理积压事务，贵人运佳', luckyColor: '紫色', star: '⭐⭐⭐⭐' },
    { brief: '今日财运亨通，可能有意外收获，宜把握机会', luckyColor: '金色', star: '⭐⭐⭐⭐⭐' },
    { brief: '今日适合静思，避免冲动决策，多听取他人建议', luckyColor: '蓝色', star: '⭐⭐⭐' },
    { brief: '今日桃花运旺，社交场合易遇良缘', luckyColor: '粉色', star: '⭐⭐⭐⭐' },
    { brief: '今日事业运上升，工作上容易获得认可', luckyColor: '绿色', star: '⭐⭐⭐⭐' },
    { brief: '今日需注意健康，适当休息，避免过度劳累', luckyColor: '橙色', star: '⭐⭐' },
    { brief: '今日灵感迸发，适合创作和学习新事物', luckyColor: '青色', star: '⭐⭐⭐⭐⭐' },
    { brief: '今日人际关系和谐，适合团队合作', luckyColor: '黄色', star: '⭐⭐⭐⭐' }
  ],

  // 详细运势
  fortuneDetails: {
    career: [
      '工作上会遇到新的挑战，但只要保持耐心就能顺利解决',
      '今日事业运旺，适合推进重要项目或向上级汇报',
      '工作中可能出现小波折，建议多与同事沟通协作',
      '贵人运佳，可能会得到前辈的指点和帮助',
      '适合学习新技能，为未来发展做准备'
    ],
    wealth: [
      '财运平稳，适合储蓄和理财规划',
      '可能有意外之财，但不宜过度消费',
      '投资需谨慎，避免冲动决策',
      '正财稳定，努力工作会有相应回报',
      '今日不宜借贷，避免财务纠纷'
    ],
    love: [
      '单身者今日桃花运佳，多参加社交活动',
      '有伴侣者今日感情甜蜜，适合约会',
      '感情运势平稳，需要更多耐心经营',
      '今日容易与异性产生共鸣，把握机会',
      '建议多关心另一半的感受，增进感情'
    ],
    health: [
      '身体状况良好，保持规律作息',
      '注意劳逸结合，避免过度疲劳',
      '今日适合运动锻炼，增强体质',
      '注意饮食卫生，避免肠胃不适',
      '保持心情愉悦，有利于身心健康'
    ]
  },

  // 手相线纹
  palmLines: {
    life: {
      name: '生命线',
      meanings: {
        long: { desc: '生命线长且清晰', meaning: '体质较好，精力充沛，寿命长久' },
        short: { desc: '生命线较短', meaning: '需要注意身体健康，保持良好作息' },
        deep: { desc: '生命线深而明显', meaning: '生命力旺盛，适应能力强' },
        broken: { desc: '生命线有断裂', meaning: '生活中可能有重大变化，需多加注意' },
        forked: { desc: '生命线末端分叉', meaning: '晚年生活丰富，可能异地发展' }
      }
    },
    wisdom: {
      name: '智慧线',
      meanings: {
        long: { desc: '智慧线长至月丘', meaning: '思维敏捷，富有创造力' },
        short: { desc: '智慧线较短', meaning: '务实理性，注重实际行动' },
        straight: { desc: '智慧线笔直', meaning: '逻辑性强，善于分析' },
        curved: { desc: '智慧线弯曲', meaning: '想象力丰富，艺术天赋高' },
        forked: { desc: '智慧线末端分叉', meaning: '多才多艺，适应能力强' }
      }
    },
    emotion: {
      name: '感情线',
      meanings: {
        long: { desc: '感情线延伸至食指', meaning: '感情丰富，重视精神交流' },
        short: { desc: '感情线较短', meaning: '理性冷静，不轻易表露情感' },
        clear: { desc: '感情线清晰深长', meaning: '感情专一，婚姻美满' },
        chain: { desc: '感情线呈链状', meaning: '感情经历丰富，可能多段恋情' },
        forked: { desc: '感情线末端分叉', meaning: '感情细腻，但容易犹豫不决' }
      }
    },
    career: {
      name: '事业线',
      meanings: {
        clear: { desc: '事业线清晰直上', meaning: '事业发展顺利，目标明确' },
        faint: { desc: '事业线较浅', meaning: '事业方向尚在探索中' },
        broken: { desc: '事业线有断裂', meaning: '事业可能有转折或转型' },
        multiple: { desc: '多条事业线', meaning: '多才多艺，可能身兼数职' },
        late: { desc: '事业线从中部起', meaning: '大器晚成，后期事业有成' }
      }
    },
    wealth: {
      name: '财运线',
      meanings: {
        many: { desc: '财运线多条清晰', meaning: '财源广进，理财有道' },
        few: { desc: '财运线较少', meaning: '财运平稳，需努力积累' },
        clear: { desc: '财运线深刻明显', meaning: '正财运旺，收入稳定' },
        cross: { desc: '财运线有十字纹', meaning: '可能有意外之财' },
        upward: { desc: '财运线向上延伸', meaning: '财运上升趋势' }
      }
    }
  },

  // 获取今日运势
  getDailyFortune() {
    const saved = localStorage.getItem('dailyFortune')
    const today = new Date().toDateString()
    
    if (saved) {
      const data = JSON.parse(saved)
      if (data.date === today) return data.data
    }
    
    const fortune = this.dailyFortunes[Math.floor(Math.random() * this.dailyFortunes.length)]
    localStorage.setItem('dailyFortune', JSON.stringify({ date: today, data: fortune }))
    return fortune
  },

  // 获取详细运势
  getDetailedFortune() {
    return {
      career: this.fortuneDetails.career[Math.floor(Math.random() * this.fortuneDetails.career.length)],
      wealth: this.fortuneDetails.wealth[Math.floor(Math.random() * this.fortuneDetails.wealth.length)],
      love: this.fortuneDetails.love[Math.floor(Math.random() * this.fortuneDetails.love.length)],
      health: this.fortuneDetails.health[Math.floor(Math.random() * this.fortuneDetails.health.length)]
    }
  },

  // 生成手相结果
  generatePalmResult() {
    const result = {}
    
    for (const key in this.palmLines) {
      const line = this.palmLines[key]
      const meanings = Object.keys(line.meanings)
      const randomKey = meanings[Math.floor(Math.random() * meanings.length)]
      result[key] = {
        name: line.name,
        ...line.meanings[randomKey]
      }
    }
    
    return result
  }
}

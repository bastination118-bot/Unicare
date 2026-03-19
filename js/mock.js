// 使用记录器 - v1.1.0 新增后台记录功能
const UsageLogger = {
  STORAGE_KEY: 'unicare_usage_logs',
  userId: null,

  init() {
    // 生成或获取用户ID
    this.userId = localStorage.getItem('unicare_user_id') || this.generateUserId()
    localStorage.setItem('unicare_user_id', this.userId)
  },

  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  },

  getDeviceInfo() {
    const ua = navigator.userAgent
    let device = 'desktop'
    if (/Mobile|Android|iPhone|iPad/i.test(ua)) {
      device = 'mobile'
    }
    return {
      device: device,
      userAgent: ua,
      screenSize: `${window.innerWidth}x${window.innerHeight}`
    }
  },

  log(data) {
    const record = {
      timestamp: new Date().toISOString(),
      userId: this.userId,
      ...this.getDeviceInfo(),
      ...data
    }

    // 存入 localStorage
    const logs = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]')
    logs.push(record)
    
    // 限制存储数量（最近100条）
    if (logs.length > 100) {
      logs.shift()
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs))

    // 尝试同步到服务器（如果有）
    this.syncToServer(record)

    return record
  },

  syncToServer(record) {
    // 前端无法直接写入服务器文件，这里预留接口
    // 实际部署时可以通过 API 发送到后端
    console.log('[UsageLogger]', record)
  },

  getLogs() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]')
  },

  exportLogs() {
    const logs = this.getLogs()
    return logs.map(log => JSON.stringify(log)).join('\n')
  },

  clearLogs() {
    localStorage.removeItem(this.STORAGE_KEY)
  }
}

// 模拟数据 - v1.1.0 新增舌相分析
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

  // ===== 舌相分析数据 =====
  tongueAnalysis: {
    // 舌色类型
    tongueColors: {
      pale: {
        name: '淡白舌',
        meaning: '气血不足，阳虚内寒',
        characteristics: '舌色比正常人浅淡，呈淡白色',
        healthIndex: 65,
        constitution: '气虚质/阳虚质',
        symptoms: ['容易疲劳', '手脚冰凉', '面色苍白', '食欲不振'],
        advice: {
          diet: ['红枣', '桂圆', '山药', '牛肉', '生姜'],
          lifestyle: ['早睡晚起', '避免寒凉', '适量运动', '多晒太阳'],
          acupoints: ['足三里', '气海', '关元', '脾俞']
        }
      },
      red: {
        name: '红舌',
        meaning: '阴虚火旺，内热较重',
        characteristics: '舌色较正常深，呈鲜红色',
        healthIndex: 70,
        constitution: '阴虚质',
        symptoms: ['口干舌燥', '失眠多梦', '心烦易怒', '手足心热'],
        advice: {
          diet: ['银耳', '百合', '梨', '绿豆', '莲藕'],
          lifestyle: ['早睡早起', '避免熬夜', '放松心情', '适度运动'],
          acupoints: ['太溪', '三阴交', '涌泉', '照海']
        }
      },
      crimson: {
        name: '绛舌',
        meaning: '热入营血，热毒内盛',
        characteristics: '舌色深红，比红舌更深',
        healthIndex: 60,
        constitution: '热盛质',
        symptoms: ['高热', '口渴', '神昏', '出血倾向'],
        advice: {
          diet: ['西瓜', '苦瓜', '黄瓜', '绿豆', '菊花茶'],
          lifestyle: ['立即就医', '大量饮水', '卧床休息', '避免劳累'],
          acupoints: ['大椎', '曲池', '合谷', '十宣']
        }
      },
      purple: {
        name: '紫舌',
        meaning: '血瘀寒凝，气血不畅',
        characteristics: '舌色紫暗，或有瘀斑',
        healthIndex: 55,
        constitution: '血瘀质',
        symptoms: ['胸闷刺痛', '痛经', '肤色暗沉', '记忆力减退'],
        advice: {
          diet: ['山楂', '玫瑰花', '红糖', '黑木耳', '洋葱'],
          lifestyle: ['活血化瘀', '适量运动', '保持心情舒畅', '避免久坐'],
          acupoints: ['血海', '膈俞', '内关', '三阴交']
        }
      },
      blue: {
        name: '青紫舌',
        meaning: '严重血瘀或寒极',
        characteristics: '舌色青紫，晦暗不泽',
        healthIndex: 50,
        constitution: '血瘀质/寒凝质',
        symptoms: ['剧烈疼痛', '四肢冰冷', '唇甲青紫', '呼吸困难'],
        advice: {
          diet: ['生姜', '桂皮', '红糖', '羊肉', '韭菜'],
          lifestyle: ['立即就医', '保暖防寒', '避免劳累', '卧床休息'],
          acupoints: ['关元', '气海', '神阙', '命门']
        }
      }
    },

    // 舌苔类型
    tongueCoatings: {
      whiteThin: {
        name: '薄白苔',
        meaning: '正常或表证初期',
        characteristics: '苔薄而均匀，白色',
        healthImpact: '正常健康状态或轻微表证',
        severity: 'normal'
      },
      whiteThick: {
        name: '白厚苔',
        meaning: '痰湿内停，寒湿困脾',
        characteristics: '苔白而厚，湿润',
        healthImpact: '消化不良，脾胃功能弱',
        severity: 'mild'
      },
      yellowThin: {
        name: '薄黄苔',
        meaning: '热势较轻',
        characteristics: '苔薄，微黄',
        healthImpact: '轻度内热',
        severity: 'mild'
      },
      yellowThick: {
        name: '黄厚苔',
        meaning: '湿热内蕴，食积化热',
        characteristics: '苔黄而厚，干燥或粘腻',
        healthImpact: '内热较重，消化功能异常',
        severity: 'moderate'
      },
      greasy: {
        name: '腻苔',
        meaning: '痰湿内阻，湿浊内蕴',
        characteristics: '苔质致密，颗粒细腻，如涂油脂',
        healthImpact: '脾胃湿困，痰湿体质',
        severity: 'moderate'
      },
      peeled: {
        name: '剥苔',
        meaning: '胃阴不足，气血亏虚',
        characteristics: '舌苔部分或全部脱落',
        healthImpact: '阴虚或气血不足',
        severity: 'moderate'
      },
      grayBlack: {
        name: '灰黑苔',
        meaning: '热极或寒极',
        characteristics: '苔色灰黑，干燥或滑润',
        healthImpact: '严重病症，需及时就医',
        severity: 'severe'
      }
    },

    // 体质类型
    constitutions: {
      qiDeficiency: {
        name: '气虚质',
        features: '容易疲劳，气短懒言，声音低弱',
        suggestion: '补气健脾，避免过劳'
      },
      yangDeficiency: {
        name: '阳虚质',
        features: '畏寒怕冷，手足不温，喜热饮食',
        suggestion: '温阳散寒，注意保暖'
      },
      yinDeficiency: {
        name: '阴虚质',
        features: '手足心热，口干咽燥，喜冷饮',
        suggestion: '滋阴降火，避免熬夜'
      },
      dampHeat: {
        name: '湿热质',
        features: '面部油腻，口苦口臭，大便黏滞',
        suggestion: '清热利湿，清淡饮食'
      },
      bloodStasis: {
        name: '血瘀质',
        features: '肤色暗沉，易有瘀斑，痛经',
        suggestion: '活血化瘀，适量运动'
      },
      phlegmDamp: {
        name: '痰湿质',
        features: '体形肥胖，腹部肥满，口黏痰多',
        suggestion: '化痰祛湿，控制饮食'
      },
      balanced: {
        name: '平和质',
        features: '面色红润，精力充沛，睡眠良好',
        suggestion: '保持现状，均衡养生'
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
  },

  // ===== 生成舌相分析结果 =====
  generateTongueResult(imageData) {
    // 生成确定性种子
    let seed
    if (imageData) {
      // 使用图片base64的长度和部分字符内容作为种子
      seed = imageData.length
      const contentStart = imageData.indexOf(',') + 1
      const content = imageData.substring(contentStart)
      const samplePositions = [0, Math.floor(content.length / 4), Math.floor(content.length / 2)]
      for (const pos of samplePositions) {
        if (content[pos]) {
          seed += content.charCodeAt(pos)
        }
      }
    } else {
      seed = Date.now()
    }
    
    // 基于种子的伪随机数生成器
    const pseudoRandom = (s) => {
      const x = Math.sin(s) * 10000
      return x - Math.floor(x)
    }
    
    const colors = Object.keys(this.tongueAnalysis.tongueColors)
    const coatings = Object.keys(this.tongueAnalysis.tongueCoatings)
    
    // 基于种子生成确定性索引
    const colorIndex = Math.floor(pseudoRandom(seed) * colors.length)
    const coatingIndex = Math.floor(pseudoRandom(seed + 1) * coatings.length)
    
    const colorKey = colors[colorIndex]
    const coatingKey = coatings[coatingIndex]
    
    const colorData = this.tongueAnalysis.tongueColors[colorKey]
    const coatingData = this.tongueAnalysis.tongueCoatings[coatingKey]
    
    // 计算综合健康指数
    let healthIndex = colorData.healthIndex
    if (coatingData.severity === 'severe') healthIndex -= 15
    else if (coatingData.severity === 'moderate') healthIndex -= 10
    else if (coatingData.severity === 'mild') healthIndex -= 5
    
    healthIndex = Math.max(30, Math.min(95, healthIndex))
    
    return {
      tongueColor: colorData,
      tongueCoating: coatingData,
      combinedType: `${colorData.name}${coatingData.name}`,
      healthIndex: healthIndex,
      constitution: colorData.constitution,
      analysis: this.generateTongueAnalysis(colorData, coatingData, healthIndex),
      recommendations: colorData.advice,
      analysisSource: 'demo',
      analysisTime: new Date().toISOString()
    }
  },

  // 生成舌相分析文本
  generateTongueAnalysis(colorData, coatingData, healthIndex) {
    const analyses = []
    
    analyses.push(`您的舌色为${colorData.name}，${colorData.meaning}。`)
    analyses.push(`舌苔呈现${coatingData.name}，${coatingData.meaning}。`)
    
    if (healthIndex >= 80) {
      analyses.push('整体健康状况良好，建议继续保持良好的生活习惯。')
    } else if (healthIndex >= 60) {
      analyses.push('身体存在轻微的失衡，建议适当调理，注意休息。')
    } else {
      analyses.push('身体需要关注和调理，建议咨询专业中医师。')
    }
    
    return analyses.join('\n')
  }
}

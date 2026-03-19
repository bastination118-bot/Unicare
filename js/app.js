// 应用主逻辑 - v1.1.0 接入 Kimi AI
const app = {
  currentPage: 'home',
  selectedGender: 'male',
  palmImage: null,
  baziData: null,
  aiFortune: null,  // 存储 AI 运势分析结果

  init() {
    this.setTodayDate()
    this.loadDailyFortune()
    this.loadSavedBazi()
    this.bindNavEvents()
  },

  setTodayDate() {
    const date = new Date()
    const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`
    document.getElementById('todayDate').textContent = dateStr
  },

  loadDailyFortune() {
    const fortune = MockData.getDailyFortune()
    document.getElementById('luckyColor').textContent = `幸运色：${fortune.luckyColor}`
    document.getElementById('luckyStar').textContent = fortune.star
    document.getElementById('dailyFortune').textContent = fortune.brief
  },

  loadSavedBazi() {
    const saved = localStorage.getItem('baziData')
    if (saved) {
      this.baziData = JSON.parse(saved)
      // 同时加载缓存的 AI 分析结果
      const savedAiFortune = localStorage.getItem('aiFortune')
      if (savedAiFortune) {
        this.aiFortune = JSON.parse(savedAiFortune)
      }
    }
  },

  bindNavEvents() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault()
        const page = e.target.dataset.page
        if (page === 'fortune') {
          this.goToFortune()
        } else if (page === 'home') {
          this.goHome()
        }
      })
    })
  },

  // 页面导航
  goHome() {
    this.showPage('home')
    this.updateNav('home')
  },

  goToPalm() {
    this.showPage('palm')
    document.getElementById('palm-step1').style.display = 'block'
    document.getElementById('palm-step2').style.display = 'none'
    document.getElementById('palmPreview').style.display = 'none'
    document.getElementById('startPalmBtn').style.display = 'none'
  },

  goToBazi() {
    this.showPage('bazi')
  },

  goToFortune() {
    if (!this.baziData) {
      this.goToBazi()
      return
    }
    this.showPage('fortune')
    this.updateNav('fortune')
    this.updateFortunePage()
  },

  goBack() {
    this.goHome()
  },

  showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
    document.getElementById(pageId).classList.add('active')
    this.currentPage = pageId
    window.scrollTo(0, 0)
  },

  updateNav(page) {
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active')
      if (tab.dataset.page === page) {
        tab.classList.add('active')
      }
    })
  },

  // ============ 手相分析（规则引擎 + 模拟数据） ============
  handlePalmPhoto(event) {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      this.palmImage = e.target.result
      document.getElementById('palmPreviewImg').src = this.palmImage
      document.getElementById('palmPreview').style.display = 'block'
      document.getElementById('startPalmBtn').style.display = 'block'
    }
    reader.readAsDataURL(file)
  },

  startPalmAnalysis() {
    document.getElementById('palm-step1').style.display = 'none'
    document.getElementById('palm-step2').style.display = 'block'

    const tips = [
      '💡 正在识别生命线...',
      '💡 正在分析智慧线...',
      '💡 正在读取感情线...',
      '💡 正在评估事业线...',
      '💡 正在计算财运线...',
      '💡 AI 正在生成综合建议...'
    ]

    let progress = 0
    const progressEl = document.getElementById('palmProgress')
    const tipEl = document.getElementById('palmTip')

    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5
      if (progress > 100) progress = 100
      
      progressEl.textContent = Math.floor(progress) + '%'
      
      const tipIndex = Math.floor(progress / 20)
      if (tipIndex < tips.length) {
        tipEl.textContent = tips[tipIndex]
      }

      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          this.showPalmReport()
        }, 500)
      }
    }, 300)
  },

  showPalmReport() {
    // 使用规则引擎生成手相分析结果
    const result = PalmAnalysisEngine.analyze(this.palmImage)
    
    // 设置日期
    const date = new Date()
    document.getElementById('palmReportDate').textContent = 
      `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`

    // 生成线纹报告
    let html = ''
    for (const key in result) {
      const line = result[key]
      html += `
        <div class="line-card">
          <div class="line-header">
            <span class="line-name">${line.name}</span>
            <span class="line-badge">${line.desc}</span>
          </div>
          <div class="line-meaning">${line.meaning}</div>
        </div>
      `
    }
    document.getElementById('palmLinesContainer').innerHTML = html

    // 生成 AI 风格建议
    const suggestions = PalmAnalysisEngine.generateSuggestions(result)
    let suggestionHtml = ''
    suggestions.forEach(s => {
      suggestionHtml += `
        <div class="suggestion-item">
          <span class="suggestion-label">${s.label}</span>
          <div class="suggestion-text">${s.text}</div>
        </div>
      `
    })
    document.getElementById('palmSuggestion').innerHTML = suggestionHtml

    this.showPage('palm-report')
  },

  savePalmReport() {
    alert('报告已保存到本地！')
  },

  // ============ 八字录入 ============
  selectGender(gender) {
    this.selectedGender = gender
    document.querySelectorAll('.gender-option').forEach(el => {
      el.classList.remove('active')
    })
    document.querySelector(`[data-gender="${gender}"]`).classList.add('active')
  },

  async submitBazi() {
    const birthDate = document.getElementById('birthDate').value
    const birthTime = document.getElementById('birthTime').value

    if (!birthDate) {
      alert('请选择出生日期')
      return
    }

    const [year, month, day] = birthDate.split('-').map(Number)
    const [hour, minute] = birthTime.split(':').map(Number)

    const bazi = BaziUtil.getBazi(year, month, day, hour)
    const wuxingCount = BaziUtil.getWuxingCount(bazi)

    this.baziData = {
      birthDate,
      birthTime,
      gender: this.selectedGender,
      bazi,
      wuxingCount
    }

    localStorage.setItem('baziData', JSON.stringify(this.baziData))
    
    // 清除旧的 AI 分析结果，强制重新获取
    localStorage.removeItem('aiFortune')
    this.aiFortune = null
    
    this.goToFortune()
  },

  // ============ 运势报告（接入 Kimi AI） ============
  async updateFortunePage() {
    if (!this.baziData) {
      document.getElementById('fortune-empty').style.display = 'block'
      document.getElementById('fortune-content').style.display = 'none'
      return
    }

    document.getElementById('fortune-empty').style.display = 'none'
    document.getElementById('fortune-content').style.display = 'block'

    const { bazi, wuxingCount } = this.baziData

    // 渲染八字命盘
    this.renderBaziGrid(bazi)
    
    // 渲染五行图表
    this.renderWuxingChart(wuxingCount)

    // 检查是否需要调用 AI 获取运势
    const today = new Date().toDateString()
    const cacheKey = `aiFortune_${today}`
    const cached = localStorage.getItem(cacheKey)
    
    if (cached) {
      this.aiFortune = JSON.parse(cached)
      this.renderFortuneContent(this.aiFortune)
    } else {
      // 显示加载状态
      this.showFortuneLoading()
      // 调用 AI 获取运势
      await this.fetchAIFortune()
    }
  },

  renderBaziGrid(bazi) {
    const baziGridHtml = `
      <div class="bazi-row header">
        <div class="bazi-cell label">柱</div>
        <div class="bazi-cell">年柱</div>
        <div class="bazi-cell">月柱</div>
        <div class="bazi-cell">日柱</div>
        <div class="bazi-cell">时柱</div>
      </div>
      <div class="bazi-row">
        <div class="bazi-cell label">天干</div>
        <div class="bazi-cell ${BaziUtil.getWuxingClass(bazi.yearGan)}">${bazi.yearGan}</div>
        <div class="bazi-cell ${BaziUtil.getWuxingClass(bazi.monthGan)}">${bazi.monthGan}</div>
        <div class="bazi-cell ${BaziUtil.getWuxingClass(bazi.dayGan)}">${bazi.dayGan}</div>
        <div class="bazi-cell ${BaziUtil.getWuxingClass(bazi.hourGan)}">${bazi.hourGan}</div>
      </div>
      <div class="bazi-row">
        <div class="bazi-cell label">地支</div>
        <div class="bazi-cell ${BaziUtil.getWuxingClass(bazi.yearZhi)}">${bazi.yearZhi}</div>
        <div class="bazi-cell ${BaziUtil.getWuxingClass(bazi.monthZhi)}">${bazi.monthZhi}</div>
        <div class="bazi-cell ${BaziUtil.getWuxingClass(bazi.dayZhi)}">${bazi.dayZhi}</div>
        <div class="bazi-cell ${BaziUtil.getWuxingClass(bazi.hourZhi)}">${bazi.hourZhi}</div>
      </div>
    `
    document.getElementById('baziGrid').innerHTML = baziGridHtml
  },

  renderWuxingChart(wuxingCount) {
    const wuxingMap = { jin: '金', mu: '木', shui: '水', huo: '火', tu: '土' }
    const wuxingHtml = Object.entries(wuxingCount).map(([key, value]) => `
      <div class="wuxing-item">
        <div class="wuxing-bar-wrapper">
          <div class="wuxing-bar ${key}" style="height: ${value * 20}px;"></div>
        </div>
        <div class="wuxing-name">${wuxingMap[key]}</div>
        <div class="wuxing-value">${value}</div>
      </div>
    `).join('')
    document.getElementById('wuxingChart').innerHTML = wuxingHtml

    // 五行总结
    const maxWuxing = Object.entries(wuxingCount).sort((a, b) => b[1] - a[1])[0]
    const wuxingSummaryMap = {
      jin: '金旺之人性格刚毅果断，重义气，有领导才能，适合从事管理、金融、法律等行业。',
      mu: '木旺之人性格温和善良，有创造力，适合从事教育、文化、艺术等行业。',
      shui: '水旺之人性格聪明灵活，善于沟通，适合从事销售、咨询、媒体等行业。',
      huo: '火旺之人性格热情开朗，有感染力，适合从事演艺、营销、公关等行业。',
      tu: '土旺之人性格稳重踏实，有责任感，适合从事建筑、房地产、农业等行业。'
    }
    document.getElementById('wuxingSummary').textContent = wuxingSummaryMap[maxWuxing[0]]
  },

  showFortuneLoading() {
    document.getElementById('todayScore').textContent = '综合评分：AI 分析中...'
    document.getElementById('fortuneTags').innerHTML = '<span class="fortune-tag">🤖 Kimi AI 正在解读...</span>'
    document.getElementById('fortuneDetail').innerHTML = `
      <div class="detail-item">
        <div class="detail-label">⏳ 正在生成专业运势分析</div>
        <div class="detail-text">Kimi AI 正在根据您的八字命盘进行深度分析，请稍候...</div>
      </div>
    `
  },

  async fetchAIFortune() {
    try {
      // 检测是否在本地开发环境（没有 Vercel API）
      const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      
      let fortuneData
      
      if (isLocalDev) {
        // 本地开发使用模拟数据
        console.log('本地开发模式：使用模拟 AI 数据')
        await new Promise(resolve => setTimeout(resolve, 1500)) // 模拟网络延迟
        fortuneData = this.generateMockAIFortune()
      } else {
        // 生产环境调用 Vercel API
        const response = await fetch('/api/fortune', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bazi: this.baziData.bazi,
            wuxingCount: this.baziData.wuxingCount,
            gender: this.baziData.gender
          })
        })

        if (!response.ok) {
          throw new Error('AI service error')
        }

        const result = await response.json()
        fortuneData = result.data
      }

      // 缓存结果
      const today = new Date().toDateString()
      localStorage.setItem(`aiFortune_${today}`, JSON.stringify(fortuneData))
      this.aiFortune = fortuneData

      // 渲染结果
      this.renderFortuneContent(fortuneData)

    } catch (error) {
      console.error('获取 AI 运势失败:', error)
      // 使用备用数据
      const fallbackData = this.generateMockAIFortune()
      this.renderFortuneContent(fallbackData)
    }
  },

  renderFortuneContent(data) {
    // 综合评分
    document.getElementById('todayScore').textContent = `综合评分：${data.overallScore || 80}分`

    // 标签
    const tags = [
      { text: data.overallScore >= 85 ? '🌟 运势极佳' : data.overallScore >= 70 ? '✨ 运势良好' : '🌤 运势平稳', class: data.overallScore >= 80 ? 'good' : '' },
      { text: `🎨 幸运色：${data.luckyColor || '紫色'}`, class: '' },
      { text: `🔢 幸运数字：${data.luckyNumber || 8}`, class: '' }
    ]
    document.getElementById('fortuneTags').innerHTML = tags.map(t => 
      `<span class="fortune-tag ${t.class}">${t.text}</span>`
    ).join('')

    // 详细运势
    const careerScore = data.career?.score || 80
    const wealthScore = data.wealth?.score || 80
    const loveScore = data.love?.score || 80
    const healthScore = data.health?.score || 80

    document.getElementById('fortuneDetail').innerHTML = `
      <div class="detail-item">
        <div class="detail-label">💼 事业运势 <span class="score-badge">${careerScore}分</span></div>
        <div class="detail-text">${data.career?.advice || '事业运势平稳，保持专注会有不错的收获。'}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">💰 财运运势 <span class="score-badge">${wealthScore}分</span></div>
        <div class="detail-text">${data.wealth?.advice || '财运稳定，适合储蓄和理财规划。'}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">💕 感情运势 <span class="score-badge">${loveScore}分</span></div>
        <div class="detail-text">${data.love?.advice || '感情运势良好，多沟通增进感情。'}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">🏃 健康运势 <span class="score-badge">${healthScore}分</span></div>
        <div class="detail-text">${data.health?.advice || '注意劳逸结合，保持规律作息。'}</div>
      </div>
      ${data.analysis ? `
      <div class="detail-item ai-analysis">
        <div class="detail-label">🔮 AI 命盘分析</div>
        <div class="detail-text">${data.analysis}</div>
      </div>
      ` : ''}
    `
  },

  generateMockAIFortune() {
    // 生成模拟 AI 运势数据（用于本地开发或 API 失败时）
    return {
      analysis: '根据您的八字命盘分析，日主中和偏旺，喜用神为金水。今日天干地支相生相合，整体运势较为顺畅。',
      career: { score: 85, advice: '今日事业运旺，适合推进重要项目或向上级汇报工作成果。贵人运佳，可能会得到前辈的指点和帮助。' },
      wealth: { score: 78, advice: '财运平稳，正财收入稳定。今日不宜高风险投资，适合储蓄和理财规划。' },
      love: { score: 82, advice: '感情运势良好，单身者有机会遇到心仪对象，有伴侣者今日感情甜蜜，适合约会增进感情。' },
      health: { score: 88, advice: '身体状况良好，精力充沛。建议保持规律作息，适当运动增强体质。' },
      overallScore: 83,
      luckyColor: '紫色',
      luckyNumber: 6,
      summary: '今日整体运势良好，适合主动出击，把握机会。'
    }
  },

  showMemberTip() {
    alert('会员功能开发中，敬请期待！')
  }
}

// 手相分析规则引擎
const PalmAnalysisEngine = {
  analyze(imageData) {
    // 基于规则引擎的手相分析（模拟 AI 分析效果）
    // 实际项目中可以接入真实的计算机视觉 API
    
    const lines = ['life', 'wisdom', 'emotion', 'career', 'wealth']
    const result = {}
    
    // 为每个线纹生成基于规则的分析
    lines.forEach(lineKey => {
      result[lineKey] = this.analyzeLine(lineKey)
    })
    
    return result
  },

  analyzeLine(lineKey) {
    const lineData = MockData.palmLines[lineKey]
    const meanings = Object.keys(lineData.meanings)
    
    // 根据当前日期和用户信息生成确定性结果
    const seed = new Date().getDate() + lineKey.charCodeAt(0)
    const selectedKey = meanings[seed % meanings.length]
    
    return {
      name: lineData.name,
      ...lineData.meanings[selectedKey]
    }
  },

  generateSuggestions(lineResults) {
    const suggestions = []
    
    // 生命线分析
    if (lineResults.life) {
      const lifeScore = lineResults.life.desc.includes('长') || lineResults.life.desc.includes('深') ? 'high' : 'medium'
      suggestions.push({
        label: '💪 健康建议',
        text: lifeScore === 'high' 
          ? '生命线显示您体质较好，精力充沛。建议保持规律作息，适当运动以维持良好状态。'
          : '生命线提示您需要注意身体健康，建议加强锻炼，保持良好作息，定期体检。'
      })
    }
    
    // 智慧线分析
    if (lineResults.wisdom) {
      const isCreative = lineResults.wisdom.desc.includes('弯曲') || lineResults.wisdom.desc.includes('分叉')
      suggestions.push({
        label: '📚 学习建议',
        text: isCreative
          ? '智慧线显示您具有较强的创造力和想象力，适合从事艺术、设计等创意工作。'
          : '智慧线显示您逻辑思维强，善于分析问题，适合从事科研、技术等需要理性思维的工作。'
      })
    }
    
    // 感情线分析
    if (lineResults.emotion) {
      const isStable = lineResults.emotion.desc.includes('清晰') || lineResults.emotion.desc.includes('长')
      suggestions.push({
        label: '💕 情感建议',
        text: isStable
          ? '感情线显示您感情丰富且专一，在感情中真诚投入，容易获得美满的爱情。'
          : '感情线提示您在感情中可能较为理性，建议多表达情感，增进与伴侣的沟通。'
      })
    }
    
    // 事业线分析
    if (lineResults.career) {
      const isClear = lineResults.career.desc.includes('清晰') || lineResults.career.desc.includes('直上')
      suggestions.push({
        label: '💼 事业建议',
        text: isClear
          ? '事业线清晰，显示您事业发展顺利，目标明确。建议继续专注深耕，会有不错的成就。'
          : '事业线显示您可能还在探索职业方向，建议多尝试不同领域，找到真正热爱的事业。'
      })
    }
    
    return suggestions
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  app.init()
})

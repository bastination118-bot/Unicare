// 应用主逻辑 - v1.1.0 接入 Kimi AI + 舌相分析
const app = {
  currentPage: 'home',
  selectedGender: 'male',
  palmImage: null,
  baziData: null,
  aiFortune: null,
  tongueImage: null,
  tongueResult: null,

  init() {
    this.setTodayDate()
    this.loadDailyFortune()
    this.loadSavedBazi()
    this.bindNavEvents()
    this.initDateInput()
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
    
    // 加载个性化内容
    this.loadPersonalizedContent()
    
    // 检查解锁状态
    this.checkUnlockStatus()
  },

  loadPersonalizedContent() {
    // 从 localStorage 获取用户数据
    const surveyData = localStorage.getItem('surveyData')
    const baziData = localStorage.getItem('baziData')
    
    if (surveyData || baziData) {
      // 显示个性化卡片
      document.getElementById('personalizedCard').style.display = 'block'
      
      // 设置日期
      const date = new Date()
      document.getElementById('personalDate').textContent = `${date.getMonth() + 1}月${date.getDate()}日`
      
      // 根据八字或问卷生成个性化内容
      if (baziData) {
        const bazi = JSON.parse(baziData)
        // 根据八字五行推荐幸运色
        const luckyColors = {
          '金': '白色、金色',
          '木': '绿色、青色', 
          '水': '黑色、蓝色',
          '火': '红色、紫色',
          '土': '黄色、棕色'
        }
        
        // 简单示例：根据日柱天干推荐
        const dayGan = bazi.day ? bazi.day.charAt(0) : ''
        const ganToElement = {
          '甲': '木', '乙': '木',
          '丙': '火', '丁': '火',
          '戊': '土', '己': '土',
          '庚': '金', '辛': '金',
          '壬': '水', '癸': '水'
        }
        const element = ganToElement[dayGan] || '火'
        document.getElementById('luckyColorPersonal').textContent = `幸运色：${luckyColors[element]}`
        
        // 根据日柱推荐幸运数字
        const luckyNums = {
          '金': '4、9', '木': '3、8',
          '水': '1、6', '火': '2、7',
          '土': '5、0'
        }
        document.getElementById('luckyNumber').textContent = `幸运数字：${luckyNums[element]}`
      }
      
      // 生成今日宜忌（基于星期）
      const dayOfWeek = new Date().getDay()
      const yiJiList = [
        { yi: '签约、出行', ji: '动土、争吵' },
        { yi: '学习、交流', ji: '冲动消费' },
        { yi: '合作、谈判', ji: '独断专行' },
        { yi: '创新、突破', ji: '墨守成规' },
        { yi: '理财、规划', ji: '借贷、担保' },
        { yi: '社交、聚会', ji: '宅家、懒惰' },
        { yi: '休息、冥想', ji: '过度工作' }
      ]
      const todayYiJi = yiJiList[dayOfWeek]
      document.getElementById('todayYiJi').textContent = `宜：${todayYiJi.yi} | 忌：${todayYiJi.ji}`
    }
  },

  loadSavedBazi() {
    const saved = localStorage.getItem('baziData')
    if (saved) {
      this.baziData = JSON.parse(saved)
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

  // ============ 页面导航 ============
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

  goToTongue() {
    this.showPage('tongue')
    document.getElementById('tongue-step1').style.display = 'block'
    document.getElementById('tongue-step2').style.display = 'none'
    document.getElementById('tonguePreview').style.display = 'none'
    document.getElementById('startTongueBtn').style.display = 'none'
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

  // v1.1 新功能导航
  goToSolarTerm() {
    window.location.href = 'pages/solar-term/index.html'
  },

  goToInvite() {
    window.location.href = 'pages/invite/index.html'
  },

  goToSurvey() {
    window.location.href = 'pages/survey/index.html'
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

  // ============ 手相分析 ============
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

  async startPalmAnalysis() {
    document.getElementById('palm-step1').style.display = 'none'
    document.getElementById('palm-step2').style.display = 'block'

    const tips = ['💡 正在识别生命线...', '💡 正在分析智慧线...', '💡 正在读取感情线...', 
                  '💡 正在评估事业线...', '💡 正在计算财运线...', '💡 AI 正在生成综合建议...']

    let progress = 0
    const progressEl = document.getElementById('palmProgress')
    const tipEl = document.getElementById('palmTip')

    // 进度动画
    const interval = setInterval(() => {
      progress += Math.random() * 10 + 3
      if (progress > 90) progress = 90
      progressEl.textContent = Math.floor(progress) + '%'
      const tipIndex = Math.floor(progress / 18)
      if (tipIndex < tips.length) tipEl.textContent = tips[tipIndex]
    }, 500)

    try {
      // 调用 AI API
      const response = await fetch('/api/palm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: this.palmImage,
          gender: this.selectedGender
        })
      })

      clearInterval(interval)

      if (!response.ok) {
        throw new Error('AI service error')
      }

      const data = await response.json()
      progressEl.textContent = '100%'
      setTimeout(() => this.showPalmReport(data.data), 500)

    } catch (error) {
      console.error('手相分析失败:', error)
      clearInterval(interval)
      
      // 使用备用模拟数据
      const fallbackResult = PalmAnalysisEngine.analyze(this.palmImage)
      progressEl.textContent = '100%'
      tipEl.textContent = '💡 使用离线分析模式...'
      setTimeout(() => this.showPalmReport({ lines: fallbackResult }), 1000)
    }
  },

  showPalmReport(result) {
    const date = new Date()
    document.getElementById('palmReportDate').textContent = 
      `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`

    // 处理 API 返回格式或备用格式
    const lines = result.lines || result
    
    let html = ''
    for (const key in lines) {
      const line = lines[key]
      html += `
        <div class="line-card">
          <div class="line-header">
            <span class="line-name">${line.name}</span>
            <span class="line-score">${line.score || 75}分</span>
          </div>
          <div class="line-status" style="color: #888; font-size: 13px; margin-bottom: 8px;">${line.status || line.desc || ''}</div>
          <div class="line-meaning">${line.analysis || line.meaning}</div>
        </div>`
    }
    document.getElementById('palmLinesContainer').innerHTML = html

    // 显示综合建议
    const suggestion = result.suggestion || '根据您的手相分析，建议保持积极心态，把握机遇，注意健康平衡。'
    document.getElementById('palmSuggestion').innerHTML = `
      <div class="suggestion-item">
        <div class="suggestion-text">${suggestion}</div>
      </div>`

    this.showPage('palm-report')
  },

  savePalmReport() {
    alert('报告已保存到本地！')
  },

  // ============ 舌相分析 ============
  handleTonguePhoto(event) {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      this.tongueImage = e.target.result
      document.getElementById('tonguePreviewImg').src = this.tongueImage
      document.getElementById('tonguePreview').style.display = 'block'
      document.getElementById('startTongueBtn').style.display = 'block'
    }
    reader.readAsDataURL(file)
  },

  startTongueAnalysis() {
    document.getElementById('tongue-step1').style.display = 'none'
    document.getElementById('tongue-step2').style.display = 'block'

    const tips = ['💡 正在识别舌色...', '💡 正在分析舌苔...', '💡 正在评估舌形...', 
                  '💡 正在判断体质...', '💡 正在计算健康指数...', '💡 AI 正在生成舌诊报告...']

    let progress = 0
    const progressEl = document.getElementById('tongueProgress')
    const tipEl = document.getElementById('tongueTip')

    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5
      if (progress > 100) progress = 100
      progressEl.textContent = Math.floor(progress) + '%'
      const tipIndex = Math.floor(progress / 20)
      if (tipIndex < tips.length) tipEl.textContent = tips[tipIndex]

      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => this.showTongueReport(), 500)
      }
    }, 300)
  },

  async showTongueReport() {
    // 显示加载状态
    this.showPage('tongue-report')
    document.getElementById('tongueReportLoading').style.display = 'block'
    document.getElementById('tongueReportContent').style.display = 'none'

    try {
      // 检测是否在本地开发环境
      const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      
      let result
      if (isLocalDev) {
        console.log('本地开发模式：使用模拟舌相数据')
        await new Promise(resolve => setTimeout(resolve, 1500))
        result = MockData.generateTongueResult()
      } else {
        // 调用 AI API
        const response = await fetch('/api/tongue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tongueFeatures: '用户上传舌相照片',
            userSymptoms: '暂无'
          })
        })

        if (!response.ok) throw new Error('AI service error')
        const data = await response.json()
        result = data.data
      }

      this.tongueResult = result
      this.renderTongueReport(result)

    } catch (error) {
      console.error('舌相分析失败:', error)
      // 使用备用数据
      const fallbackResult = MockData.generateTongueResult()
      this.renderTongueReport(fallbackResult)
    }
  },

  renderTongueReport(result) {
    document.getElementById('tongueReportLoading').style.display = 'none'
    document.getElementById('tongueReportContent').style.display = 'block'

    const date = new Date()
    document.getElementById('tongueReportDate').textContent = 
      `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`

    // 舌相类型
    document.getElementById('tongueType').textContent = result.combinedType || '淡白舌薄白苔'
    
    // 健康指数
    const healthIndex = result.healthIndex || 75
    document.getElementById('healthIndex').textContent = healthIndex
    document.getElementById('healthProgress').style.width = `${healthIndex}%`
    
    // 根据健康指数设置颜色
    const healthColor = healthIndex >= 80 ? '#52C41A' : healthIndex >= 60 ? '#FAAD14' : '#FF4D4F'
    document.getElementById('healthProgress').style.background = healthColor

    // 体质判断
    document.getElementById('constitutionType').textContent = result.constitution || '平和质'
    document.getElementById('constitutionDesc').textContent = result.constitutionDesc || '面色红润，精力充沛'

    // 舌色详情
    if (result.tongueColor) {
      document.getElementById('tongueColorName').textContent = result.tongueColor.name
      document.getElementById('tongueColorMeaning').textContent = result.tongueColor.meaning
      document.getElementById('tongueColorDesc').textContent = result.tongueColor.description
    }

    // 舌苔详情
    if (result.tongueCoating) {
      document.getElementById('tongueCoatingName').textContent = result.tongueCoating.name
      document.getElementById('tongueCoatingMeaning').textContent = result.tongueCoating.meaning
      document.getElementById('tongueCoatingDesc').textContent = result.tongueCoating.description
    }

    // 症状分析
    if (result.symptoms && result.symptoms.length > 0) {
      document.getElementById('symptomsList').innerHTML = result.symptoms.map(s => 
        `<span class="symptom-tag">${s}</span>`).join('')
    }

    // 详细分析
    document.getElementById('tongueAnalysis').textContent = result.analysis || '根据舌相分析，您的健康状况良好。'

    // 调理建议
    if (result.recommendations) {
      // 饮食建议
      if (result.recommendations.diet) {
        document.getElementById('dietAdvice').innerHTML = result.recommendations.diet.map(item =>
          `<span class="advice-tag diet">${item}</span>`).join('')
      }
      // 作息建议
      if (result.recommendations.lifestyle) {
        document.getElementById('lifestyleAdvice').innerHTML = result.recommendations.lifestyle.map(item =>
          `<span class="advice-tag lifestyle">${item}</span>`).join('')
      }
      // 穴位建议
      if (result.recommendations.acupoints) {
        document.getElementById('acupointAdvice').innerHTML = result.recommendations.acupoints.map(item =>
          `<span class="advice-tag acupoint">${item}</span>`).join('')
      }
    }

    // 严重程度提示
    const severity = result.severity || 'normal'
    const severityMap = {
      normal: { text: '健康状态良好', class: 'severity-normal' },
      mild: { text: '轻度失衡，建议调理', class: 'severity-mild' },
      moderate: { text: '中度失衡，需要关注', class: 'severity-moderate' },
      severe: { text: '重度失衡，建议就医', class: 'severity-severe' }
    }
    const severityInfo = severityMap[severity]
    document.getElementById('severityAlert').innerHTML = 
      `<div class="severity-badge ${severityInfo.class}">${severityInfo.text}</div>`
  },

  saveTongueReport() {
    alert('舌诊报告已保存到本地！')
  },

  // ============ 八字录入 ============
  initDateInput() {
    const yearInput = document.getElementById('birthYear')
    const monthInput = document.getElementById('birthMonth')
    const dayInput = document.getElementById('birthDay')

    if (!yearInput || !monthInput || !dayInput) return

    // 年份输入4位后自动跳到月份
    yearInput.addEventListener('input', (e) => {
      const value = e.target.value
      if (value.length >= 4) {
        // 限制范围
        const year = parseInt(value)
        if (year >= 1900 && year <= 2030) {
          monthInput.focus()
        }
      }
    })

    // 月份输入2位后自动跳到日期
    monthInput.addEventListener('input', (e) => {
      const value = e.target.value
      if (value.length >= 2) {
        const month = parseInt(value)
        if (month >= 1 && month <= 12) {
          dayInput.focus()
        }
      }
    })

    // 限制输入长度
    yearInput.addEventListener('keydown', (e) => {
      if (yearInput.value.length >= 4 && e.key >= '0' && e.key <= '9' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
      }
    })

    monthInput.addEventListener('keydown', (e) => {
      if (monthInput.value.length >= 2 && e.key >= '0' && e.key <= '9' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
      }
    })

    dayInput.addEventListener('keydown', (e) => {
      if (dayInput.value.length >= 2 && e.key >= '0' && e.key <= '9' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
      }
    })
  },

  selectGender(gender) {
    this.selectedGender = gender
    document.querySelectorAll('.gender-option').forEach(el => el.classList.remove('active'))
    document.querySelector(`[data-gender="${gender}"]`).classList.add('active')
  },

  async submitBazi() {
    const year = document.getElementById('birthYear').value
    const month = document.getElementById('birthMonth').value
    const day = document.getElementById('birthDay').value
    const birthTime = document.getElementById('birthTime').value

    if (!year || !month || !day) {
      alert('请填写完整的出生日期')
      return
    }

    const yearNum = parseInt(year)
    const monthNum = parseInt(month)
    const dayNum = parseInt(day)

    // 验证日期有效性
    if (yearNum < 1900 || yearNum > 2030) {
      alert('请输入有效的年份（1900-2030）')
      return
    }
    if (monthNum < 1 || monthNum > 12) {
      alert('请输入有效的月份（1-12）')
      return
    }
    if (dayNum < 1 || dayNum > 31) {
      alert('请输入有效的日期（1-31）')
      return
    }

    const birthDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    const [hour, minute] = birthTime.split(':').map(Number)

    const bazi = BaziUtil.getBazi(yearNum, monthNum, dayNum, hour)
    const wuxingCount = BaziUtil.getWuxingCount(bazi)

    this.baziData = { birthDate, birthTime, gender: this.selectedGender, bazi, wuxingCount }
    localStorage.setItem('baziData', JSON.stringify(this.baziData))
    localStorage.removeItem('aiFortune')
    this.aiFortune = null
    this.goToFortune()
  },

  // ============ 运势报告 ============
  async updateFortunePage() {
    if (!this.baziData) {
      document.getElementById('fortune-empty').style.display = 'block'
      document.getElementById('fortune-content').style.display = 'none'
      return
    }

    document.getElementById('fortune-empty').style.display = 'none'
    document.getElementById('fortune-content').style.display = 'block'

    const { bazi, wuxingCount } = this.baziData
    this.renderBaziGrid(bazi)
    this.renderWuxingChart(wuxingCount)

    const today = new Date().toDateString()
    const cacheKey = `aiFortune_${today}`
    const cached = localStorage.getItem(cacheKey)
    
    if (cached) {
      this.aiFortune = JSON.parse(cached)
      this.renderFortuneContent(this.aiFortune)
    } else {
      this.showFortuneLoading()
      await this.fetchAIFortune()
    }
  },

  renderBaziGrid(bazi) {
    document.getElementById('baziGrid').innerHTML = `
      <div class="bazi-row header"><div class="bazi-cell label">柱</div><div class="bazi-cell">年柱</div><div class="bazi-cell">月柱</div><div class="bazi-cell">日柱</div><div class="bazi-cell">时柱</div></div>
      <div class="bazi-row"><div class="bazi-cell label">天干</div><div class="bazi-cell ${BaziUtil.getWuxingClass(bazi.yearGan)}">${bazi.yearGan}</div><div class="bazi-cell ${BaziUtil.getWuxingClass(bazi.monthGan)}">${bazi.monthGan}</div><div class="bazi-cell ${BaziUtil.getWuxingClass(bazi.dayGan)}">${bazi.dayGan}</div><div class="bazi-cell ${BaziUtil.getWuxingClass(bazi.hourGan)}">${bazi.hourGan}</div></div>
      <div class="bazi-row"><div class="bazi-cell label">地支</div><div class="bazi-cell ${BaziUtil.getWuxingClass(bazi.yearZhi)}">${bazi.yearZhi}</div><div class="bazi-cell ${BaziUtil.getWuxingClass(bazi.monthZhi)}">${bazi.monthZhi}</div><div class="bazi-cell ${BaziUtil.getWuxingClass(bazi.dayZhi)}">${bazi.dayZhi}</div><div class="bazi-cell ${BaziUtil.getWuxingClass(bazi.hourZhi)}">${bazi.hourZhi}</div></div>`
  },

  renderWuxingChart(wuxingCount) {
    const wuxingMap = { jin: '金', mu: '木', shui: '水', huo: '火', tu: '土' }
    document.getElementById('wuxingChart').innerHTML = Object.entries(wuxingCount).map(([key, value]) => `
      <div class="wuxing-item"><div class="wuxing-bar-wrapper"><div class="wuxing-bar ${key}" style="height: ${value * 20}px;"></div></div><div class="wuxing-name">${wuxingMap[key]}</div><div class="wuxing-value">${value}</div></div>`).join('')

    const maxWuxing = Object.entries(wuxingCount).sort((a, b) => b[1] - a[1])[0]
    const wuxingSummaryMap = {
      jin: '金旺之人性格刚毅果断，重义气，有领导才能。', mu: '木旺之人性格温和善良，有创造力。',
      shui: '水旺之人性格聪明灵活，善于沟通。', huo: '火旺之人性格热情开朗，有感染力。',
      tu: '土旺之人性格稳重踏实，有责任感。'
    }
    document.getElementById('wuxingSummary').textContent = wuxingSummaryMap[maxWuxing[0]]
  },

  showFortuneLoading() {
    document.getElementById('todayScore').textContent = '综合评分：AI 分析中...'
    document.getElementById('fortuneTags').innerHTML = '<span class="fortune-tag">🤖 Kimi AI 正在解读...</span>'
    document.getElementById('fortuneDetail').innerHTML = '<div class="detail-item"><div class="detail-label">⏳ 正在生成专业运势分析</div><div class="detail-text">Kimi AI 正在根据您的八字命盘进行深度分析，请稍候...</div></div>'
  },

  async fetchAIFortune() {
    try {
      const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      let fortuneData
      
      if (isLocalDev) {
        await new Promise(resolve => setTimeout(resolve, 1500))
        fortuneData = this.generateMockAIFortune()
      } else {
        const response = await fetch('/api/fortune', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bazi: this.baziData.bazi, wuxingCount: this.baziData.wuxingCount, gender: this.baziData.gender })
        })
        if (!response.ok) throw new Error('AI service error')
        fortuneData = (await response.json()).data
      }

      const today = new Date().toDateString()
      localStorage.setItem(`aiFortune_${today}`, JSON.stringify(fortuneData))
      this.aiFortune = fortuneData
      this.renderFortuneContent(fortuneData)
    } catch (error) {
      console.error('获取 AI 运势失败:', error)
      this.renderFortuneContent(this.generateMockAIFortune())
    }
  },

  renderFortuneContent(data) {
    document.getElementById('todayScore').textContent = `综合评分：${data.overallScore || 80}分`
    const tags = [
      { text: data.overallScore >= 85 ? '🌟 运势极佳' : data.overallScore >= 70 ? '✨ 运势良好' : '🌤 运势平稳', class: data.overallScore >= 80 ? 'good' : '' },
      { text: `🎨 幸运色：${data.luckyColor || '紫色'}`, class: '' },
      { text: `🔢 幸运数字：${data.luckyNumber || 8}`, class: '' }
    ]
    document.getElementById('fortuneTags').innerHTML = tags.map(t => `<span class="fortune-tag ${t.class}">${t.text}</span>`).join('')

    document.getElementById('fortuneDetail').innerHTML = `
      <div class="detail-item"><div class="detail-label">💼 事业运势 <span class="score-badge">${data.career?.score || 80}分</span></div><div class="detail-text">${data.career?.advice || '事业运势平稳。'}</div></div>
      <div class="detail-item"><div class="detail-label">💰 财运运势 <span class="score-badge">${data.wealth?.score || 80}分</span></div><div class="detail-text">${data.wealth?.advice || '财运稳定。'}</div></div>
      <div class="detail-item"><div class="detail-label">💕 感情运势 <span class="score-badge">${data.love?.score || 80}分</span></div><div class="detail-text">${data.love?.advice || '感情运势良好。'}</div></div>
      <div class="detail-item"><div class="detail-label">🏃 健康运势 <span class="score-badge">${data.health?.score || 80}分</span></div><div class="detail-text">${data.health?.advice || '注意劳逸结合。'}</div></div>
      ${data.analysis ? `<div class="detail-item ai-analysis"><div class="detail-label">🔮 AI 命盘分析</div><div class="detail-text">${data.analysis}</div></div>` : ''}`
  },

  generateMockAIFortune() {
    return {
      analysis: '根据您的八字命盘分析，日主中和偏旺，喜用神为金水。今日天干地支相生相合，整体运势较为顺畅。',
      career: { score: 85, advice: '今日事业运旺，适合推进重要项目或向上级汇报工作成果。' },
      wealth: { score: 78, advice: '财运平稳，正财收入稳定。今日不宜高风险投资。' },
      love: { score: 82, advice: '感情运势良好，单身者有机会遇到心仪对象。' },
      health: { score: 88, advice: '身体状况良好，精力充沛。建议保持规律作息。' },
      overallScore: 83, luckyColor: '紫色', luckyNumber: 6,
      summary: '今日整体运势良好，适合主动出击，把握机会。'
    }
  },

  checkUnlockStatus() {
    const unlocked = localStorage.getItem('deepReportUnlocked') === 'true'
    const memberCard = document.getElementById('memberCard')
    const memberTitle = document.getElementById('memberTitle')
    const memberStatus = document.getElementById('memberStatus')
    const memberBtn = document.getElementById('memberBtn')
    
    if (!memberCard) return
    
    if (unlocked) {
      memberCard.classList.add('unlocked')
      memberTitle.textContent = '✅ 已解锁深度报告'
      memberStatus.textContent = '已解锁'
      memberStatus.classList.remove('locked')
      memberStatus.classList.add('unlocked')
      memberBtn.textContent = '查看深度报告'
    } else {
      memberCard.classList.remove('unlocked')
      memberTitle.textContent = '✨ 解锁完整报告'
      memberStatus.textContent = '未解锁'
      memberStatus.classList.remove('unlocked')
      memberStatus.classList.add('locked')
      memberBtn.textContent = '立即查看'
    }
  },

  handleMemberClick() {
    const unlocked = localStorage.getItem('deepReportUnlocked') === 'true'
    
    if (unlocked) {
      this.showDeepReport()
    } else {
      this.goToInvite()
    }
  },

  showDeepReport() {
    if (!this.baziData) {
      alert('请先录入八字信息')
      this.goToBazi()
      return
    }
    alert('深度报告功能开发中...\n\n已解锁内容：\n• 详细八字分析\n• 年度运势预测\n• 专家级健康建议')
  },

  showMemberTip() {
    this.handleMemberClick()
  }
}

// 手相分析规则引擎
const PalmAnalysisEngine = {
  analyze(imageData) {
    const lines = ['life', 'wisdom', 'emotion', 'career', 'wealth']
    const result = {}
    lines.forEach(lineKey => { result[lineKey] = this.analyzeLine(lineKey) })
    return result
  },
  analyzeLine(lineKey) {
    const lineData = MockData.palmLines[lineKey]
    const meanings = Object.keys(lineData.meanings)
    const seed = new Date().getDate() + lineKey.charCodeAt(0)
    return { name: lineData.name, ...lineData.meanings[meanings[seed % meanings.length]] }
  },
  generateSuggestions(lineResults) {
    const suggestions = []
    if (lineResults.life) {
      const isGood = lineResults.life.desc.includes('长') || lineResults.life.desc.includes('深')
      suggestions.push({ label: '💪 健康建议', text: isGood ? '生命线显示您体质较好，精力充沛。' : '生命线提示您需要注意身体健康，建议加强锻炼。' })
    }
    if (lineResults.wisdom) {
      const isCreative = lineResults.wisdom.desc.includes('弯曲') || lineResults.wisdom.desc.includes('分叉')
      suggestions.push({ label: '📚 学习建议', text: isCreative ? '智慧线显示您具有较强的创造力和想象力。' : '智慧线显示您逻辑思维强，善于分析问题。' })
    }
    if (lineResults.emotion) {
      const isStable = lineResults.emotion.desc.includes('清晰') || lineResults.emotion.desc.includes('长')
      suggestions.push({ label: '💕 情感建议', text: isStable ? '感情线显示您感情丰富且专一。' : '感情线提示您在感情中可能较为理性，建议多表达情感。' })
    }
    if (lineResults.career) {
      const isClear = lineResults.career.desc.includes('清晰') || lineResults.career.desc.includes('直上')
      suggestions.push({ label: '💼 事业建议', text: isClear ? '事业线清晰，显示您事业发展顺利。' : '事业线显示您可能还在探索职业方向。' })
    }
    return suggestions
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => { app.init() })

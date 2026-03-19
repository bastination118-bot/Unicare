// 应用主逻辑 - v1.2.0 邀请闭环 + 首次引导 + AI透明度提升
const app = {
  currentPage: 'home',
  selectedGender: 'male',
  palmImage: null,
  baziData: null,
  aiFortune: null,
  tongueImage: null,
  tongueResult: null,

  // Analytics 追踪
  track(eventName, properties = {}) {
    if (window.va) {
      window.va('event', eventName, properties)
    }
  },

  // ========== 邀请码处理 ==========
  parseInviteCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('invite');
    return inviteCode ? inviteCode.toUpperCase() : null;
  },

  checkInviteCode() {
    const inviteCode = this.parseInviteCode();
    if (!inviteCode) return;
    
    // 检查是否已经使用过邀请码
    const usedCode = localStorage.getItem('usedInviteCode');
    if (usedCode) {
      console.log('已经使用过邀请码:', usedCode);
      return;
    }

    // 保存邀请码到localStorage，以便在邀请页面使用
    localStorage.setItem('pendingInviteCode', inviteCode);
    
    // 显示邀请弹窗
    this.showInviteModal(inviteCode);
  },

  showInviteModal(inviteCode) {
    const modal = document.getElementById('inviteModal');
    const codeDisplay = document.getElementById('inviteCodeDisplay');
    if (modal && codeDisplay) {
      codeDisplay.textContent = inviteCode;
      modal.style.display = 'flex';
    }
  },

  closeInviteModal() {
    const modal = document.getElementById('inviteModal');
    if (modal) {
      modal.style.display = 'none';
    }
  },

  acceptInvite() {
    const inviteCode = localStorage.getItem('pendingInviteCode');
    if (inviteCode) {
      localStorage.setItem('usedInviteCode', inviteCode);
      localStorage.setItem('deepReportUnlocked', 'true');
      
      // 增加免费次数
      const currentCount = parseInt(localStorage.getItem('freeAnalysisCount') || '3');
      localStorage.setItem('freeAnalysisCount', currentCount + 3);
      
      this.closeInviteModal();
      
      // 刷新页面状态
      this.checkUnlockStatus();
      alert('🎉 邀请码已应用！已获得+3次免费分析次数和深度报告权限');
    }
  },

  // ========== 首次引导 ==========
  checkFirstVisit() {
    const hasVisited = localStorage.getItem('firstVisit');
    if (!hasVisited) {
      localStorage.setItem('firstVisit', 'true');
      localStorage.setItem('guideStep', '1');
      this.showGuide();
    }
  },

  showGuide() {
    const currentStep = localStorage.getItem('guideStep') || '1';
    const guideModal = document.getElementById('guideModal');
    
    if (guideModal) {
      // 隐藏所有步骤
      document.querySelectorAll('.guide-step').forEach(step => {
        step.style.display = 'none';
      });
      
      // 显示当前步骤
      const currentStepEl = document.getElementById(`guideStep${currentStep}`);
      if (currentStepEl) {
        currentStepEl.style.display = 'block';
        guideModal.style.display = 'flex';
      }
    }
  },

  nextGuideStep() {
    const currentStep = parseInt(localStorage.getItem('guideStep') || '1');
    const nextStep = currentStep + 1;
    
    if (nextStep > 3) {
      this.closeGuide();
      localStorage.setItem('guideCompleted', 'true');
    } else {
      localStorage.setItem('guideStep', nextStep.toString());
      this.showGuide();
    }
  },

  skipGuide() {
    this.closeGuide();
    localStorage.setItem('guideCompleted', 'true');
  },

  closeGuide() {
    const guideModal = document.getElementById('guideModal');
    if (guideModal) {
      guideModal.style.display = 'none';
    }
  },

  init() {
    this.setTodayDate()
    this.loadDailyFortune()
    this.loadSavedBazi()
    this.bindNavEvents()
    this.initDateInput()
    
    // 检查邀请码
    this.checkInviteCode()
    
    // 检查首次访问（延迟显示引导）
    setTimeout(() => {
      this.checkFirstVisit()
    }, 1000)
    
    // 追踪页面访问
    this.track('page_view', { page: 'home' })
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
    this.track('feature_click', { feature: 'palm_analysis' })
  },

  goToTongue() {
    this.showPage('tongue')
    document.getElementById('tongue-step1').style.display = 'block'
    document.getElementById('tongue-step2').style.display = 'none'
    document.getElementById('tonguePreview').style.display = 'none'
    document.getElementById('startTongueBtn').style.display = 'none'
    this.track('feature_click', { feature: 'tongue_analysis' })
  },

  goToBazi() {
    this.showPage('bazi')
    this.track('feature_click', { feature: 'bazi_input' })
  },

  goToFortune() {
    if (!this.baziData) {
      this.goToBazi()
      return
    }
    this.showPage('fortune')
    this.updateNav('fortune')
    this.updateFortunePage()
    this.track('feature_click', { feature: 'fortune_report' })
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
    this.track('feature_click', { feature: 'invite' })
  },

  goToSurvey() {
    window.location.href = 'pages/survey/index.html'
    this.track('feature_click', { feature: 'survey' })
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
      // 显示流量提示
      document.getElementById('palmDataTip').style.display = 'flex'
    }
    reader.readAsDataURL(file)
  },

  async startPalmAnalysis() {
    // 网络状态检测
    const networkStatus = await this.checkNetworkStatus()
    if (networkStatus === 'poor') {
      const userChoice = confirm('⚠️ 网络连接不稳定，可能影响 AI 分析结果。\n\n请选择：\n• 点击「确定」使用离线演示模式（无需网络）\n• 点击「取消」稍后重试')
      if (!userChoice) {
        // 用户选择稍后重试，返回第一步
        document.getElementById('palm-step1').style.display = 'block'
        document.getElementById('palm-step2').style.display = 'none'
        return
      }
      // 用户选择离线模式
      this.runOfflinePalmAnalysis()
      return
    }

    document.getElementById('palm-step1').style.display = 'none'
    document.getElementById('palm-step2').style.display = 'block'
    this.track('analysis_started', { type: 'palm' })

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
      
      // 标记为AI分析
      data.data.analysisSource = 'kimi-ai'
      data.data.analysisTime = new Date().toISOString()
      
      setTimeout(() => this.showPalmReport(data.data, false), 500)

    } catch (error) {
      console.error('手相分析失败:', error)
      clearInterval(interval)
      
      // 显示错误提示，让用户选择
      progressEl.textContent = '分析失败'
      tipEl.textContent = '❌ 无法连接到 AI 分析服务'
      
      setTimeout(() => {
        const userChoice = confirm('⚠️ AI 分析服务暂时不可用\n\n请选择：\n• 点击「确定」使用离线演示模式\n• 点击「取消」返回重试')
        if (userChoice) {
          // 用户选择离线模式
          this.runOfflinePalmAnalysis()
        } else {
          // 用户选择返回
          document.getElementById('palm-step1').style.display = 'block'
          document.getElementById('palm-step2').style.display = 'none'
        }
      }, 500)
    }
  },

  // 网络状态检测
  async checkNetworkStatus() {
    // 检测navigator.connection
    if ('connection' in navigator) {
      const connection = navigator.connection
      if (connection.effectiveType === '4g' && !connection.saveData) {
        return 'good'
      } else if (connection.effectiveType === '2g' || connection.saveData) {
        return 'poor'
      }
    }
    
    // 尝试ping一个轻量级资源
    try {
      const start = Date.now()
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-store',
        signal: AbortSignal.timeout(3000)
      })
      const latency = Date.now() - start
      
      if (response.ok && latency < 1000) {
        return 'good'
      } else if (latency > 3000) {
        return 'poor'
      }
    } catch (e) {
      return 'poor'
    }
    
    return 'unknown'
  },

  // 离线手相分析
  runOfflinePalmAnalysis() {
    document.getElementById('palm-step1').style.display = 'none'
    document.getElementById('palm-step2').style.display = 'block'

    const progressEl = document.getElementById('palmProgress')
    const tipEl = document.getElementById('palmTip')
    
    progressEl.textContent = '0%'
    tipEl.textContent = '💡 正在使用离线演示模式...'

    let progress = 0
    const interval = setInterval(() => {
      progress += 15
      progressEl.textContent = Math.min(progress, 100) + '%'
      
      if (progress >= 100) {
        clearInterval(interval)
        
        // 使用基于图片的确定性分析
        const fallbackResult = PalmAnalysisEngine.analyze(this.palmImage)
        const result = {
          lines: fallbackResult,
          suggestion: '根据您的手相分析，建议保持积极心态，把握机遇，注意健康平衡。',
          analysisSource: 'demo',
          analysisTime: new Date().toISOString()
        }
        
        setTimeout(() => this.showPalmReport(result, true), 300)
      }
    }, 200)
  },

  showPalmReport(result, isFallback = false) {
    const date = new Date()
    const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
    
    document.getElementById('palmReportDate').textContent = `${dateStr} ${timeStr}`

    // 处理 API 返回格式或备用格式
    const lines = result.lines || result
    
    // 分析来源标识
    const analysisSource = result.analysisSource || (isFallback ? 'demo' : 'unknown')
    
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

    // 添加分析来源标识
    const sourceBadge = document.getElementById('palmSourceBadge')
    if (sourceBadge) {
      if (analysisSource === 'kimi-ai') {
        sourceBadge.innerHTML = '🤖 由 Kimi AI 分析'
        sourceBadge.className = 'source-badge ai-source-badge'
      } else if (analysisSource === 'demo' || isFallback) {
        sourceBadge.innerHTML = '📱 离线演示模式'
        sourceBadge.className = 'source-badge demo-source-badge'
      } else {
        sourceBadge.innerHTML = '📊 智能分析'
        sourceBadge.className = 'source-badge'
      }
    }

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
      // 显示流量提示
      document.getElementById('tongueDataTip').style.display = 'flex'
    }
    reader.readAsDataURL(file)
  },

  startTongueAnalysis() {
    document.getElementById('tongue-step1').style.display = 'none'
    document.getElementById('tongue-step2').style.display = 'block'
    this.track('analysis_started', { type: 'tongue' })

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

    let result
    let analysisSource = 'unknown'
    let isFallback = false

    try {
      // 检测是否在本地开发环境
      const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      
      if (isLocalDev) {
        console.log('本地开发模式：使用模拟舌相数据')
        await new Promise(resolve => setTimeout(resolve, 1500))
        result = MockData.generateTongueResult(this.tongueImage)
        analysisSource = 'demo'
        isFallback = true
      } else {
        // 调用 AI API - 传递真实图片
        const response = await fetch('/api/tongue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: this.tongueImage,
            userSymptoms: '暂无'
          })
        })

        if (!response.ok) {
          throw new Error('AI service error')
        }
        
        const data = await response.json()
        result = data.data
        analysisSource = data.source || 'kimi-ai'
      }

      this.tongueResult = result
      this.renderTongueReport(result, analysisSource, isFallback)

    } catch (error) {
      console.error('舌相分析失败:', error)
      // 使用备用数据
      result = MockData.generateTongueResult(this.tongueImage)
      this.renderTongueReport(result, 'demo', true)
    }
  },

  renderTongueReport(result, analysisSource = 'unknown', isFallback = false) {
    document.getElementById('tongueReportLoading').style.display = 'none'
    document.getElementById('tongueReportContent').style.display = 'block'

    const date = new Date()
    const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
    
    document.getElementById('tongueReportDate').textContent = `${dateStr} ${timeStr}`

    // 分析来源标识
    const sourceBadge = document.getElementById('tongueSourceBadge')
    if (sourceBadge) {
      if (analysisSource === 'kimi-ai') {
        sourceBadge.innerHTML = '🤖 由 Kimi AI 分析'
        sourceBadge.className = 'source-badge ai-source-badge'
      } else if (analysisSource === 'demo' || isFallback) {
        sourceBadge.innerHTML = '📱 离线演示模式'
        sourceBadge.className = 'source-badge demo-source-badge'
      } else {
        sourceBadge.innerHTML = '📊 智能分析'
        sourceBadge.className = 'source-badge'
      }
    }

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
  dateType: 'solar', // 'solar' 或 'lunar'
  unknownTime: false,

  initDateInput() {
    // 移除自动跳转逻辑
    const yearInput = document.getElementById('birthYear')
    const monthInput = document.getElementById('birthMonth')
    const dayInput = document.getElementById('birthDay')

    if (!yearInput || !monthInput || !dayInput) return

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

  selectDateType(type) {
    this.dateType = type
    document.querySelectorAll('.date-type-btn').forEach(btn => {
      btn.classList.remove('active')
    })
    document.getElementById(type === 'solar' ? 'solarBtn' : 'lunarBtn').classList.add('active')
  },

  toggleUnknownTime() {
    const checkbox = document.getElementById('unknownTime')
    this.unknownTime = checkbox.checked
    const timeInput = document.getElementById('birthTime')
    if (this.unknownTime) {
      timeInput.disabled = true
      timeInput.value = '12:00'
      timeInput.style.opacity = '0.5'
    } else {
      timeInput.disabled = false
      timeInput.style.opacity = '1'
    }
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
    let birthTime = document.getElementById('birthTime').value

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

    // 如果不清楚时辰，使用默认午时
    if (this.unknownTime) {
      birthTime = '12:00'
    }

    // 如果选择的是农历，可以在这里添加农历转公历的逻辑
    // 目前先直接使用输入的日期
    if (this.dateType === 'lunar') {
      // TODO: 农历转公历
      console.log('农历日期:', yearNum, monthNum, dayNum)
    }

    const birthDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    const [hour, minute] = birthTime.split(':').map(Number)

    const bazi = BaziUtil.getBazi(yearNum, monthNum, dayNum, hour)
    const wuxingCount = BaziUtil.getWuxingCount(bazi)

    this.baziData = { birthDate, birthTime, gender: this.selectedGender, bazi, wuxingCount, unknownTime: this.unknownTime }
    localStorage.setItem('baziData', JSON.stringify(this.baziData))
    localStorage.removeItem('aiFortune')
    this.aiFortune = null
    this.track('bazi_submitted', { year: yearNum, gender: this.selectedGender })
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
    const memberPreview = document.getElementById('memberPreview')
    const freeCounter = document.getElementById('freeCounter')
    
    if (!memberCard) return
    
    // 更新免费次数
    const freeCount = localStorage.getItem('freeAnalysisCount') || '3'
    if (freeCounter) {
      freeCounter.textContent = freeCount
    }
    
    if (unlocked) {
      memberCard.classList.add('unlocked')
      memberTitle.textContent = '✨ 专属深度报告'
      memberStatus.textContent = '已解锁'
      memberStatus.classList.remove('locked')
      memberStatus.classList.add('unlocked')
      memberBtn.textContent = '查看深度报告'
      // 隐藏特权预览
      if (memberPreview) {
        memberPreview.style.display = 'none'
      }
    } else {
      memberCard.classList.remove('unlocked')
      memberTitle.textContent = '✨ 解锁完整报告'
      memberStatus.textContent = '未解锁'
      memberStatus.classList.remove('unlocked')
      memberStatus.classList.add('locked')
      memberBtn.textContent = '立即查看'
      // 显示特权预览
      if (memberPreview) {
        memberPreview.style.display = 'block'
      }
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
  // 从base64图片生成确定性种子
  generateSeed(imageData) {
    if (!imageData) {
      return Date.now()
    }
    
    // 使用图片base64的长度和部分字符内容作为种子
    let seed = imageData.length
    
    // 提取图片base64的特定位置字符（跳过data:image前缀）
    const contentStart = imageData.indexOf(',') + 1
    const content = imageData.substring(contentStart)
    
    // 采样几个位置的字符码
    const samplePositions = [0, Math.floor(content.length / 4), Math.floor(content.length / 2), Math.floor(content.length * 0.75)]
    for (const pos of samplePositions) {
      if (content[pos]) {
        seed += content.charCodeAt(pos)
      }
    }
    
    return seed
  },
  
  // 基于种子生成伪随机数
  pseudoRandom(seed) {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  },
  
  analyze(imageData) {
    const seed = this.generateSeed(imageData)
    const lines = ['life', 'wisdom', 'emotion', 'career', 'wealth']
    const result = {}
    lines.forEach((lineKey, index) => { 
      result[lineKey] = this.analyzeLine(lineKey, seed + index) 
    })
    return result
  },
  
  analyzeLine(lineKey, seed) {
    const lineData = MockData.palmLines[lineKey]
    const meanings = Object.keys(lineData.meanings)
    
    // 使用种子生成确定性索引
    const randomValue = this.pseudoRandom(seed)
    const selectedIndex = Math.floor(randomValue * meanings.length)
    const selectedKey = meanings[selectedIndex]
    
    // 生成基于种子的分数 (60-95)
    const score = 60 + Math.floor(this.pseudoRandom(seed + 100) * 36)
    
    return { 
      name: lineData.name, 
      score: score,
      ...lineData.meanings[selectedKey] 
    }
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

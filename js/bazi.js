// 八字计算工具
const BaziUtil = {
  tianGan: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
  diZhi: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
  
  wuxing: {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
    '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
    '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土',
    '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金',
    '戌': '土', '亥': '水'
  },

  getYearGanZhi(year) {
    const ganIndex = (year - 4) % 10
    const zhiIndex = (year - 4) % 12
    return this.tianGan[ganIndex] + this.diZhi[zhiIndex]
  },

  getMonthGanZhi(year, month) {
    const yearGanIndex = (year - 4) % 10
    const monthZhiIndex = (month + 1) % 12
    const monthGanIndex = (yearGanIndex * 2 + month) % 10
    return this.tianGan[monthGanIndex] + this.diZhi[monthZhiIndex]
  },

  getDayGanZhi(year, month, day) {
    const baseDate = new Date(1900, 0, 31)
    const targetDate = new Date(year, month - 1, day)
    const diffDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24))
    
    const ganIndex = (diffDays + 10) % 10
    const zhiIndex = (diffDays + 12) % 12
    
    return this.tianGan[ganIndex] + this.diZhi[zhiIndex]
  },

  getHourGanZhi(dayGan, hour) {
    const zhiIndex = Math.floor((hour + 1) / 2) % 12
    const dayGanIndex = this.tianGan.indexOf(dayGan)
    const ganIndex = (dayGanIndex * 2 + zhiIndex) % 10
    return this.tianGan[ganIndex] + this.diZhi[zhiIndex]
  },

  getBazi(year, month, day, hour) {
    const yearGZ = this.getYearGanZhi(year)
    const monthGZ = this.getMonthGanZhi(year, month)
    const dayGZ = this.getDayGanZhi(year, month, day)
    const hourGZ = this.getHourGanZhi(dayGZ[0], hour)
    
    return {
      yearGan: yearGZ[0],
      yearZhi: yearGZ[1],
      monthGan: monthGZ[0],
      monthZhi: monthGZ[1],
      dayGan: dayGZ[0],
      dayZhi: dayGZ[1],
      hourGan: hourGZ[0],
      hourZhi: hourGZ[1]
    }
  },

  getWuxingCount(bazi) {
    const count = { jin: 0, mu: 0, shui: 0, huo: 0, tu: 0 }
    const map = { '金': 'jin', '木': 'mu', '水': 'shui', '火': 'huo', '土': 'tu' }
    
    const allChars = [
      bazi.yearGan, bazi.yearZhi,
      bazi.monthGan, bazi.monthZhi,
      bazi.dayGan, bazi.dayZhi,
      bazi.hourGan, bazi.hourZhi
    ]
    
    allChars.forEach(char => {
      const wx = this.wuxing[char]
      if (wx && map[wx]) {
        count[map[wx]]++
      }
    })
    
    return count
  },

  getWuxingClass(char) {
    const wuxingMap = {
      '甲': 'mu', '乙': 'mu', '丙': 'huo', '丁': 'huo',
      '戊': 'tu', '己': 'tu', '庚': 'jin', '辛': 'jin',
      '壬': 'shui', '癸': 'shui',
      '子': 'shui', '丑': 'tu', '寅': 'mu', '卯': 'mu',
      '辰': 'tu', '巳': 'huo', '午': 'huo', '未': 'tu',
      '申': 'jin', '酉': 'jin', '戌': 'tu', '亥': 'shui'
    }
    return wuxingMap[char] || ''
  }
}

# Unicare Web - AI健康运势分析

🦄 Unicare 是一个基于 AI 的健康运势分析网页应用，提供**手相分析**、**舌相分析（中医舌诊）**和**八字运势**功能。

## 🌐 在线访问

- **Vercel 部署**: https://unicare-web.vercel.app
- **GitHub 仓库**: https://github.com/basti-zhang/unicare-web

## ✨ 功能特性

### 🔮 手相分析
- 上传手掌照片，AI 分析五大线纹
- 生命线、智慧线、感情线、事业线、财运线解读
- AI 生成个性化建议

### 👅 舌相分析 (中医舌诊) ⭐NEW
- 拍摄舌头照片，AI 智能分析
- **舌色识别**: 淡白、红、绛、紫、青等
- **舌苔分析**: 白苔、黄苔、厚苔、薄苔、腻苔、剥苔等
- **健康指数**: 0-100 分综合评分
- **体质判断**: 气虚/阳虚/阴虚/湿热/血瘀/痰湿/平和质
- **调理建议**: 
  - 🥗 饮食调理推荐
  - 😴 作息调理建议
  - 💆 穴位按摩指导

### ☯️ 八字运势
- 录入出生日期时间，AI 生成专业八字命盘
- 五行命理分析
- 今日运势解读（事业、财运、感情、健康）
- 幸运色、幸运数字

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | 原生 HTML5 + CSS3 + JavaScript |
| **AI 模型** | Moonshot Kimi K2.5 |
| **API** | Vercel Serverless Functions |
| **部署** | Vercel (CDN + HTTPS) |

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/yourusername/unicare-web.git
cd unicare-web
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入你的 Moonshot API Key
# 获取 API Key: https://platform.moonshot.cn
```

### 3. 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 4. 部署到 Vercel

**方式 A：使用部署脚本**
```bash
./deploy.sh
```

**方式 B：使用 Vercel CLI**
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel --prod
```

详细部署指南请参见 [DEPLOY.md](./DEPLOY.md)

## 🔑 获取 Moonshot API Key

1. 访问 [Moonshot AI 开放平台](https://platform.moonshot.cn)
2. 注册/登录账号
3. 进入「用户中心」→「API Key 管理」
4. 创建新的 API Key
5. 将 API Key 填入 `.env` 文件的 `MOONSHOT_API_KEY`

## 📁 项目结构

```
web/
├── api/                    # Vercel Serverless Functions
│   ├── fortune.js          # 八字运势 AI 解读 API
│   └── tongue.js           # 舌相分析 AI 解读 API
├── css/
│   └── style.css           # 全局样式
├── js/
│   ├── app.js              # 主应用逻辑
│   ├── bazi.js             # 八字计算工具
│   └── mock.js             # 模拟数据（含中医舌诊数据库）
├── index.html              # 主页面
├── .env.example            # 环境变量模板
├── README.md               # 项目说明
├── DEPLOY.md               # 详细部署指南
├── deploy.sh               # 部署脚本
├── package.json            # 项目配置
└── vercel.json             # Vercel 配置
```

## 🔒 安全说明

- API Key 存储在环境变量中，不会暴露在前端代码
- 用户数据仅存储在本地 localStorage
- 所有 API 调用通过 Vercel Serverless Functions 代理
- 舌相照片仅在本地处理，不上传服务器

## ⚠️ 免责声明

本程序仅供娱乐和健康参考，不构成专业医疗或命理建议。如有健康问题，请及时咨询专业医生。

## 📝 版本记录

参见 [CHANGELOG.md](./CHANGELOG.md)

## 📄 许可证

MIT License

---

Powered by [Kimi AI](https://platform.moonshot.cn) | Made with ❤️

# Unicare Web - AI健康运势分析

🦄 Unicare 是一个基于 AI 的健康运势分析网页应用，提供手相分析和八字运势功能。

## 🌐 在线访问

- **Vercel 部署**: https://unicare-web.vercel.app (待配置)
- **GitHub 仓库**: https://github.com/yourusername/unicare-web (待创建)

## ✨ 功能特性

- ✋ **手相分析** - 上传手掌照片，AI 分析五大线纹（生命线、智慧线、感情线、事业线、财运线）
- ☯️ **八字运势** - 录入出生日期时间，AI 生成专业八字命盘和运势解读
- 🎯 **今日运势** - 每日自动生成运势简报
- 🤖 **AI 驱动** - 接入 Kimi AI 大模型，提供专业级解读

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

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel --prod
```

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
│   └── fortune.js          # 八字运势 AI 解读 API
├── css/
│   └── style.css           # 全局样式
├── js/
│   ├── app.js              # 主应用逻辑
│   ├── bazi.js             # 八字计算工具
│   └── mock.js             # 模拟数据
├── index.html              # 主页面
├── .env.example            # 环境变量模板
├── package.json            # 项目配置
└── vercel.json             # Vercel 配置
```

## 🔒 安全说明

- API Key 存储在环境变量中，不会暴露在前端代码
- 用户数据仅存储在本地 localStorage
- 所有 API 调用通过 Vercel Serverless Functions 代理

## 📝 版本记录

参见 [CHANGELOG.md](./CHANGELOG.md)

## ⚠️ 免责声明

本程序仅供娱乐参考，不构成专业医疗或命理建议。

## 📄 许可证

MIT License

---

Powered by [Kimi AI](https://platform.moonshot.cn) | Made with ❤️

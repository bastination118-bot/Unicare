# Unicare Web 部署指南

## 📋 前置要求

- GitHub 账号
- Vercel 账号（可以使用 GitHub 账号直接登录）
- Moonshot AI API Key

---

## 🚀 快速部署步骤

### 1. 获取 Moonshot AI API Key

1. 访问 [Moonshot AI 开放平台](https://platform.moonshot.cn)
2. 使用手机号注册/登录
3. 进入「用户中心」→「API Key 管理」
4. 点击「创建 API Key」
5. **立即复制并保存 API Key**（只显示一次！）

### 2. 创建 GitHub 仓库

**方式 A：使用 GitHub 网页（推荐新手）**

1. 访问 https://github.com/new
2. 仓库名称填写：`unicare-web`
3. 选择「Public」（公开）或「Private」（私有）
4. 点击「Create repository」

**方式 B：使用命令行**

```bash
# 确保已安装 gh CLI
# macOS: brew install gh
# 其他: https://cli.github.com

# 登录 GitHub
gh auth login

# 创建仓库
cd /path/to/Unicare/web
gh repo create unicare-web --public --source=. --remote=origin --push
```

### 3. 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 Moonshot API Key：

```env
# Moonshot AI (Kimi) API 配置
MOONSHOT_API_KEY=sk-your-actual-api-key-here
MOONSHOT_API_URL=https://api.moonshot.cn/v1/chat/completions
MOONSHOT_MODEL=kimi-k2.5

# 应用配置
APP_VERSION=1.1.0
APP_NAME=Unicare
```

### 4. 部署到 Vercel

**方式 A：使用 Vercel 网页（推荐新手）**

1. 访问 https://vercel.com/new
2. 点击「Import Git Repository」
3. 选择你的 `unicare-web` 仓库
4. 在项目配置页面：
   - Framework Preset: **Other**
   - Root Directory: **./** （保持默认）
5. 点击「Environment Variables」展开
6. 添加环境变量：
   - Name: `MOONSHOT_API_KEY`
   - Value: 你的 API Key
7. 点击「Deploy」

**方式 B：使用 Vercel CLI**

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel（会打开浏览器）
vercel login

# 部署
cd /path/to/Unicare/web
vercel --prod

# 按提示操作，选择已有项目或创建新项目
```

### 5. 验证部署

1. 部署完成后，Vercel 会提供域名，如：
   - `https://unicare-web-xxx.vercel.app`
   - `https://unicare-web.vercel.app`（如果配置了自定义域名）

2. 访问网站测试功能：
   - ✅ 首页显示正常
   - ✅ 手相分析页面正常
   - ✅ 八字录入和运势分析正常
   - ✅ 底部显示 "Powered by Kimi AI"

---

## 🔧 配置自动部署

Vercel 会自动配置 GitHub 集成：

1. 每次 push 到 GitHub 的 `main` 分支，Vercel 会自动重新部署
2. 在 Vercel Dashboard 可以查看部署历史

如需禁用自动部署：
- Vercel Dashboard → 项目设置 → Git → 关闭 "Auto-Deploy"

---

## 📝 环境变量说明

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `MOONSHOT_API_KEY` | Kimi API 密钥 | https://platform.moonshot.cn |
| `MOONSHOT_API_URL` | Kimi API 地址 | 默认：https://api.moonshot.cn/v1/chat/completions |
| `MOONSHOT_MODEL` | 使用的模型 | 默认：kimi-k2.5 |

---

## 🐛 常见问题

### Q: API Key 泄露了怎么办？

1. 立即到 Moonshot 平台删除旧 API Key
2. 创建新的 API Key
3. 更新 Vercel 环境变量
4. 重新部署

### Q: 如何更新网站内容？

```bash
# 修改代码后
git add .
git commit -m "更新描述"
git push origin main
# Vercel 会自动重新部署
```

### Q: 如何绑定自定义域名？

1. Vercel Dashboard → 项目 → Settings → Domains
2. 添加你的域名
3. 按照提示配置 DNS

---

## 📞 获取帮助

- **Vercel 文档**: https://vercel.com/docs
- **Moonshot API 文档**: https://platform.moonshot.cn/docs
- **GitHub 文档**: https://docs.github.com

---

*部署指南版本: v1.1.0*

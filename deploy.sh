#!/bin/bash
# Unicare Web 部署脚本
# 使用方式: ./deploy.sh

echo "🦄 Unicare Web 部署脚本"
echo "========================"

# 检查 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装，正在安装..."
    npm install -g vercel
fi

echo "✅ Vercel CLI 版本: $(vercel --version)"

# 检查是否登录
if ! vercel whoami &> /dev/null; then
    echo "⚠️  未登录 Vercel，请先运行: vercel login"
    exit 1
fi

echo "✅ 已登录 Vercel"

# 检查环境变量
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件，请根据 .env.example 创建"
    exit 1
fi

echo "✅ 环境变量文件存在"

# 部署到 Vercel
echo ""
echo "🚀 开始部署到 Vercel..."
vercel --prod

echo ""
echo "✅ 部署完成！"
echo "📱 访问地址将在部署完成后显示"

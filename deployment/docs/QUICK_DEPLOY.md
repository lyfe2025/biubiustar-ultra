# 🚀 Biubiustar Ultra 快速部署指南

## 📋 快速开始

### 1. Vercel 部署 (推荐，5分钟)

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 配置环境变量
cp env.example .env
# 编辑 .env 文件，填入你的 Supabase 配置

# 3. 部署
vercel --prod
```

### 2. Docker 部署 (10分钟)

```bash
# 1. 配置环境变量
cp env.example .env
# 编辑 .env 文件

# 2. 一键部署
./deploy.sh -m docker -e prod
```

### 3. 传统服务器部署 (15分钟)

```bash
# 1. 配置环境变量
cp env.example .env
# 编辑 .env 文件

# 2. 一键部署
./deploy.sh -m server -e prod
```

---

## 🔑 必需配置

### Supabase 配置
1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 获取项目 URL 和 API 密钥
4. 配置到 `.env` 文件

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 📱 部署后验证

- ✅ 网站正常访问
- ✅ 用户注册登录
- ✅ 文件上传功能
- ✅ API 接口响应

---

## 🆘 遇到问题？

1. 查看详细部署文档: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. 检查环境变量配置
3. 查看部署日志
4. 运行健康检查: `curl /api/health`

---

## 🎯 推荐部署方式

- **个人项目/演示**: Vercel
- **生产环境**: Docker
- **企业环境**: 传统服务器

选择最适合你的部署方式，开始享受 Biubiustar Ultra 的强大功能！

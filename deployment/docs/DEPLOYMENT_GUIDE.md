# Biubiustar Ultra 部署方案文档

## 📋 项目概述

Biubiustar Ultra 是一个现代化的社交媒体平台，采用前后端分离架构，支持多语言，具备完整的用户系统、内容管理、活动管理等功能。

### 🏗️ 技术架构
- **前端**: React 18 + TypeScript + Vite + Tailwind CSS
- **后端**: Express.js + TypeScript + Supabase
- **数据库**: PostgreSQL (通过 Supabase)
- **部署平台**: 支持 Vercel、Docker、传统服务器等多种方式

---

## 🚀 部署方式概览

### 1. Vercel 部署 (推荐)
- 适合: 快速部署、自动CI/CD、全球CDN
- 成本: 免费额度充足，按需付费
- 复杂度: ⭐⭐ (简单)

### 2. Docker 容器化部署
- 适合: 生产环境、私有服务器、Kubernetes
- 成本: 服务器成本
- 复杂度: ⭐⭐⭐ (中等)

### 3. 传统服务器部署
- 适合: 完全控制、自定义配置、企业环境
- 成本: 服务器成本 + 运维成本
- 复杂度: ⭐⭐⭐⭐ (复杂)

---

## 🎯 方式一: Vercel 部署 (推荐)

### 前置条件
- GitHub/GitLab 代码仓库
- Vercel 账户
- Supabase 项目

### 部署步骤

#### 1. 环境变量配置
在 Vercel 项目设置中配置以下环境变量：

```bash
# Supabase 配置
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 邮件服务配置 (可选)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password

# 其他配置
NODE_ENV=production
```

#### 2. 构建配置
项目已配置 `vercel.json`，确保构建命令正确：

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci --only=production",
  "framework": null,
  "functions": {
    "api/index.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 30,
      "memory": 512
    }
  }
}
```

#### 3. 自动部署
1. 连接 GitHub 仓库到 Vercel
2. 配置分支部署规则
3. 推送代码到主分支自动触发部署

### 优势
- ✅ 自动 HTTPS 和 CDN
- ✅ 零配置部署
- ✅ 自动扩展
- ✅ 全球边缘网络
- ✅ 实时预览和回滚

---

## 🐳 方式二: Docker 容器化部署

### 前置条件
- Docker 和 Docker Compose
- 服务器 (Linux 推荐)
- 域名和 SSL 证书

### 1. 创建 Dockerfile

```dockerfile
# 前端构建阶段
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# 后端运行阶段
FROM node:18-alpine AS backend
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=frontend-builder /app/dist ./dist
COPY api ./api
COPY supabase ./supabase

EXPOSE 3000
CMD ["npm", "run", "server:dev"]
```

### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    volumes:
      - ./uploads:/app/public/uploads
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./uploads:/var/www/uploads
    depends_on:
      - app
    restart: unless-stopped

volumes:
  uploads:
```

### 3. Nginx 配置

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app_backend {
        server app:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # 静态文件
        location /uploads/ {
            alias /var/www/uploads/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API 代理
        location /api/ {
            proxy_pass http://app_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # SPA 路由
        location / {
            try_files $uri $uri/ /index.html;
            root /var/www/dist;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 4. 部署命令

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 🖥️ 方式三: 传统服务器部署

### 前置条件
- Linux 服务器 (Ubuntu 20.04+ 推荐)
- Node.js 18+
- Nginx
- PM2 进程管理器
- SSL 证书

### 1. 服务器环境准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 Nginx
sudo apt install nginx -y

# 安装 PM2
sudo npm install -g pm2

# 安装 Certbot (SSL)
sudo apt install certbot python3-certbot-nginx -y
```

### 2. 项目部署

```bash
# 克隆项目
git clone https://github.com/your-username/biubiustar-ultra.git
cd biubiustar-ultra

# 安装依赖
npm ci --only=production

# 构建前端
npm run build

# 配置环境变量
cp .env.example .env
nano .env
```

### 3. PM2 配置

创建 `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'biubiustar-api',
    script: 'api/server.ts',
    interpreter: 'tsx',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

启动服务:
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 4. Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # 静态文件
    location /uploads/ {
        alias /var/www/biubiustar-ultra/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 前端文件
    location / {
        root /var/www/biubiustar-ultra/dist;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5. SSL 证书配置

```bash
# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔧 通用配置说明

### 环境变量配置

```bash
# 必需配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 可选配置
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-domain.com
UPLOAD_MAX_SIZE=10485760
SESSION_SECRET=your_session_secret

# 邮件服务 (可选)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 数据库迁移

```bash
# 使用 Supabase CLI
supabase db push

# 或手动执行 SQL 文件
psql -h your-db-host -U your-username -d your-database -f supabase/migrations/001_initial_schema.sql
```

### 文件上传配置

确保 `public/uploads` 目录存在且有正确的权限：

```bash
mkdir -p public/uploads
chmod 755 public/uploads
chown www-data:www-data public/uploads  # Linux
```

---

## 📊 性能优化建议

### 前端优化
- 启用 Gzip 压缩
- 配置静态资源缓存
- 使用 CDN 加速
- 图片懒加载和压缩

### 后端优化
- 启用 PM2 集群模式
- 配置 Redis 缓存 (可选)
- 数据库连接池优化
- API 响应压缩

### 数据库优化
- 创建必要的索引
- 定期清理日志表
- 配置连接池
- 监控慢查询

---

## 🔒 安全配置

### 基础安全
- 启用 HTTPS
- 配置 CORS 策略
- 设置安全头
- 启用 CSRF 保护

### 高级安全
- 配置 IP 白名单
- 启用速率限制
- 日志审计
- 定期安全扫描

---

## 📈 监控和维护

### 日志管理
```bash
# PM2 日志
pm2 logs

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# 应用日志
tail -f logs/app.log
```

### 性能监控
- 使用 PM2 监控进程状态
- 配置 Nginx 访问日志分析
- 数据库性能监控
- 服务器资源监控

### 备份策略
- 数据库定期备份
- 代码版本控制
- 配置文件备份
- 上传文件备份

---

## 🚨 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 清理缓存
rm -rf node_modules package-lock.json
npm install

# 检查 TypeScript 错误
npm run check
```

#### 2. 运行时错误
```bash
# 检查环境变量
echo $VITE_SUPABASE_URL

# 检查端口占用
netstat -tulpn | grep :3000

# 查看应用日志
pm2 logs
```

#### 3. 数据库连接问题
```bash
# 测试 Supabase 连接
curl -X GET "https://your-project.supabase.co/rest/v1/" \
  -H "apikey: your_anon_key"
```

---

## 📞 技术支持

### 部署问题
- 检查环境变量配置
- 验证网络连接
- 查看错误日志
- 确认依赖版本

### 性能问题
- 分析慢查询
- 检查资源使用
- 优化数据库索引
- 配置缓存策略

---

## 📝 部署检查清单

### 部署前检查
- [ ] 环境变量配置完整
- [ ] 数据库连接正常
- [ ] 代码构建成功
- [ ] 依赖安装完整
- [ ] 文件权限正确

### 部署后验证
- [ ] 网站正常访问
- [ ] API 接口响应正常
- [ ] 文件上传功能正常
- [ ] 用户注册登录正常
- [ ] 数据库操作正常
- [ ] SSL 证书有效
- [ ] 性能指标正常

---

## 🎉 部署完成

恭喜！您的 Biubiustar Ultra 平台已成功部署。建议您：

1. **定期备份** 数据库和文件
2. **监控性能** 和错误日志
3. **更新依赖** 保持安全性
4. **测试功能** 确保稳定性
5. **优化配置** 提升用户体验

如有任何问题，请参考故障排除部分或联系技术支持团队。

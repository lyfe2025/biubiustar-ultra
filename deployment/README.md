# 🚀 Biubiustar Ultra 部署

## 📁 文件结构

```
deployment/
├── README.md                 # 本说明文件
├── Dockerfile               # Docker 镜像配置
├── docker-compose.yml       # 服务编排配置
├── nginx/                   # Nginx 配置
│   ├── nginx.conf          # 主配置
│   └── conf.d/default.conf # 站点配置
├── configs/                 # 配置文件
│   ├── env.example         # 环境变量模板 ⭐ 只需配置这一个文件
│   └── ecosystem.config.js # PM2 配置
└── scripts/                 # 部署脚本
    └── deploy.sh           # 一键部署脚本
```

## 🎯 核心特性

- ✅ **单一配置文件**: 只需配置 `.env` 文件，所有服务自动适配
- ✅ **无硬编码**: 所有端口、路径、阈值都通过环境变量配置
- ✅ **单机优化**: 针对单机环境优化的部署方案
- ✅ **大文件支持**: 内置安全分离机制
- ✅ **一键部署**: 支持 Docker 和传统部署

## 🚀 快速部署

### 1. 配置环境变量 (唯一需要配置的文件)
```bash
cp deployment/configs/env.example .env
nano .env  # 配置 Supabase 信息和其他参数
```

### 2. 一键部署
```bash
# Docker 部署 (推荐)
./deployment/scripts/deploy.sh -m docker -e prod

# 传统服务器部署
./deployment/scripts/deploy.sh -m server -e prod
```

### 3. 其他操作
```bash
# 更新服务
./deployment/scripts/deploy.sh -m docker -a update

# 创建备份
./deployment/scripts/deploy.sh -m docker -a backup

# 清理环境
./deployment/scripts/deploy.sh -m docker -a cleanup
```

## ⚙️ 环境变量配置

### 必需配置
```bash
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 可选配置 (都有默认值)
```bash
# 端口配置
APP_PORT=3000              # 应用端口
NGINX_HTTP_PORT=80         # Nginx HTTP 端口
NGINX_HTTPS_PORT=443       # Nginx HTTPS 端口

# 性能配置
MEMORY_LIMIT=512           # 内存限制 (MB)
LARGE_FILE_THRESHOLD=50    # 大文件阈值 (MB)
TEMP_FILE_RETENTION_DAYS=7 # 临时文件保留天数

# 备份配置
BACKUP_RETENTION_DAYS=7    # 备份保留天数
BACKUP_COMPRESSION_LEVEL=6 # 备份压缩级别
```

## 📋 系统要求

- **Docker**: Docker Engine 20.10+, Docker Compose 2.0+
- **传统**: Node.js 18+, PM2 5.0+, Nginx 1.18+
- **内存**: 至少 2GB 可用内存
- **磁盘**: 至少 20GB 可用空间

## 🚨 注意事项

1. **只需配置一个文件**: 复制 `env.example` 为 `.env` 并填入你的配置
2. **所有服务自动适配**: 端口、路径、阈值等都会自动应用
3. **部署脚本需要执行权限**: `chmod +x deployment/scripts/deploy.sh`

---

**开始部署**: 配置 `.env` 文件后运行一键部署脚本即可！

> 💡 **优势**: 这是真正的"一个配置文件搞定一切"的部署方案！

# BiubiuStar Ultra 一键部署指南

## 🚀 快速开始

### 一键部署命令

```bash
# 克隆项目并进入部署目录
git clone https://github.com/lyfe2025/biubiustar-ultra.git
cd biubiustar-ultra/deploy

# 执行一键部署
./deploy.sh
```

### 自定义部署

```bash
# 指定项目目录
./deploy.sh --target-dir /path/to/your/project

# 跳过环境检查
./deploy.sh --skip-env-check

# 使用自定义配置文件
./deploy.sh --config /path/to/your/.env

# 查看帮助
./deploy.sh --help
```

## 📋 部署流程

### 1. 环境检查
- 自动检查并安装必要依赖：Git、Node.js、npm、pnpm
- 支持 macOS 和主流 Linux 发行版
- 可选 Docker 环境检查

### 2. 项目获取
- 从 GitHub 克隆最新代码
- 支持指定分支或标签
- 自动处理目录冲突

### 3. 配置生成
- 基于 `env.template` 生成 `.env` 配置文件
- 智能检测现有配置并提供合并选项
- 提供配置向导帮助填写关键参数

### 4. 依赖安装
- 自动检测并使用 pnpm 或 npm
- 安装项目依赖
- 构建前端资源

### 5. 服务启动
- 使用项目内置的 `project.sh` 脚本启动服务
- 自动处理端口冲突
- 后台运行并保存进程信息

### 6. 健康检查
- 验证前端和后端服务状态
- 检查 API 端点可用性
- 监控系统资源使用情况

### 7. 访问信息
- 显示前端访问地址
- 显示后端 API 地址
- 提供管理面板链接

## 📁 文件结构

```
deploy/
├── deploy.sh          # 主部署脚本
├── check-env.sh       # 环境检查脚本
├── health-check.sh    # 健康检查脚本
├── env.template       # 环境变量模板
└── README.md          # 本文档
```

## 🔧 脚本详解

### deploy.sh - 主部署脚本

**功能特性：**
- 完整的部署流程管理
- 智能错误处理和回滚
- 详细的日志输出
- 支持多种部署选项

**使用方法：**
```bash
./deploy.sh [选项]

选项：
  --target-dir DIR     指定项目部署目录 (默认: ../biubiustar-ultra)
  --repo-url URL       指定 Git 仓库地址
  --branch BRANCH      指定分支 (默认: main)
  --skip-env-check     跳过环境依赖检查
  --skip-build         跳过构建步骤
  --config FILE        使用指定的配置文件
  --force              强制覆盖现有部署
  --help               显示帮助信息
```

### check-env.sh - 环境检查脚本

**检查项目：**
- Git 版本控制工具
- Node.js 运行环境 (推荐 v18+)
- npm 包管理器
- pnpm 包管理器 (推荐)
- Docker (可选)

**自动安装：**
- macOS: 使用 Homebrew
- Ubuntu/Debian: 使用 apt
- CentOS/RHEL: 使用 yum/dnf
- Arch Linux: 使用 pacman

**使用方法：**
```bash
./check-env.sh [选项]

选项：
  --install-missing    自动安装缺失的依赖
  --check-docker       检查 Docker 环境
  --verbose            显示详细信息
```

### health-check.sh - 健康检查脚本

**检查内容：**
- 服务进程状态
- 端口占用情况
- HTTP 服务响应
- API 端点可用性
- 系统资源使用
- 项目文件完整性

**使用方法：**
```bash
./health-check.sh [选项]

选项：
  --project-dir DIR    指定项目目录
  --timeout SECONDS    设置检查超时时间 (默认: 30)
  --report             生成详细报告
  --continuous         持续监控模式
```

## ⚙️ 配置说明

### 环境变量配置

部署脚本会基于 `env.template` 生成 `.env` 配置文件。关键配置项：

**必须配置：**
- `SUPABASE_URL` - Supabase 项目 URL
- `SUPABASE_ANON_KEY` - Supabase 匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase 服务角色密钥
- `JWT_SECRET` - JWT 签名密钥
- `SESSION_SECRET` - 会话密钥

**推荐配置：**
- `NODE_ENV=production` - 生产环境
- `PORT=3000` - 后端端口
- `FRONTEND_URL` - 前端访问地址
- `CORS_ORIGIN` - CORS 允许的源

### 端口配置

默认端口分配：
- 前端服务：5173
- 后端服务：3001

如需修改，请编辑 `.env` 文件中的相应配置。

## 🛠️ 故障排除

### 常见问题

**1. 端口被占用**
```bash
# 查看端口占用
lsof -i :3001

# 停止现有服务
./deploy.sh --force
```

**2. 依赖安装失败**
```bash
# 清理缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

**3. 权限问题**
```bash
# 给脚本执行权限
chmod +x deploy.sh check-env.sh health-check.sh
```

**4. 配置错误**
```bash
# 重新生成配置
rm .env
./deploy.sh --config env.template
```

### 日志查看

```bash
# 查看部署日志
tail -f deploy.log

# 查看应用日志
cd ../
./project.sh logs
```

### 服务管理

```bash
# 查看服务状态
./health-check.sh --report

# 重启服务
cd ../
./project.sh restart

# 停止服务
cd ../
./project.sh stop
```

## 🔒 安全建议

### 生产环境部署

1. **更换默认密钥**
   ```bash
   # 生成强密钥
   openssl rand -hex 32
   ```

2. **配置防火墙**
   ```bash
   # 只开放必要端口
   ufw allow 80
   ufw allow 443
   ufw allow 22
   ```

3. **使用 HTTPS**
   - 配置 SSL 证书
   - 启用 HSTS
   - 设置安全头

4. **定期更新**
   ```bash
   # 更新项目代码
   git pull origin main
   ./deploy.sh --force
   ```

### 备份策略

1. **数据库备份**
   - 定期备份 Supabase 数据
   - 设置自动备份计划

2. **配置备份**
   ```bash
   # 备份配置文件
   cp .env .env.backup.$(date +%Y%m%d)
   ```

3. **代码备份**
   - 使用 Git 版本控制
   - 定期推送到远程仓库

## 📊 监控和维护

### 性能监控

```bash
# 系统资源监控
top
htop
df -h

# 应用性能监控
./health-check.sh --continuous
```

### 日志管理

```bash
# 日志轮转
logrotate /etc/logrotate.d/biubiustar

# 清理旧日志
find logs/ -name "*.log" -mtime +30 -delete
```

### 更新流程

```bash
# 1. 备份当前版本
cp -r biubiustar-ultra biubiustar-ultra.backup

# 2. 拉取最新代码
cd biubiustar-ultra
git pull origin main

# 3. 重新部署
cd deploy
./deploy.sh --force

# 4. 验证服务
./health-check.sh --report
```

## 🆘 技术支持

### 获取帮助

- **项目文档**: [GitHub Wiki](https://github.com/lyfe2025/biubiustar-ultra/wiki)
- **问题反馈**: [GitHub Issues](https://github.com/lyfe2025/biubiustar-ultra/issues)
- **讨论交流**: [GitHub Discussions](https://github.com/lyfe2025/biubiustar-ultra/discussions)

### 联系方式

- **邮箱**: support@biubiustar.com
- **QQ群**: 123456789
- **微信群**: 扫描二维码加入

---

## 📝 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- 支持一键部署
- 完整的环境检查
- 自动化健康检查

---

**感谢使用 BiubiuStar Ultra！** 🌟

如果这个项目对你有帮助，请给我们一个 ⭐ Star！
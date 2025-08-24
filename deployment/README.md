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
│   ├── env.example         # 环境变量模板 ⭐ 应用运行时配置
│   ├── deploy-config.sh    # 部署配置中心 ⭐ 部署过程配置
│   └── ecosystem.config.js # PM2 配置
└── scripts/                 # 部署脚本
    ├── deploy.sh           # 传统部署脚本
    ├── one-click-deploy.sh # 真正一键部署脚本
    └── quick-deploy.sh     # 远程快速部署脚本
```

## 🎯 核心特性

- ✅ **真正一键部署**: 自动安装所有基础环境，无需手动配置
- ✅ **双配置文件设计**: 部署配置和应用配置分离，职责清晰
- ✅ **部署配置为主**: `deploy-config.sh` 控制整个部署过程
- ✅ **应用配置为辅**: `.env` 文件配置应用运行时参数
- ✅ **无硬编码**: 所有端口、路径、阈值都通过环境变量配置
- ✅ **单机优化**: 针对单机环境优化的部署方案
- ✅ **简化配置**: 移除复杂功能，专注核心功能
- ✅ **支持多种部署**: Docker 和传统服务器部署

## 🔧 配置文件管理

### 🎯 配置优先级说明

#### **以 `deploy-config.sh` 为主**
- **作用**: 控制整个部署过程，包括系统安装、软件版本、目录结构等
- **优先级**: 最高，部署脚本优先读取此文件
- **修改方式**: 直接编辑此文件，或通过命令行参数覆盖

#### **以 `.env` 为辅**
- **作用**: 配置应用运行时的环境变量，如数据库连接、端口等
- **优先级**: 较低，主要用于应用启动后的配置
- **修改方式**: 部署完成后编辑此文件

### 配置中心 (`deploy-config.sh`) - 主要配置文件
**这是主要的配置文件，控制整个部署过程**：

```bash
# Git 仓库配置
DEFAULT_REPO_URL="https://github.com/lyfe2025/biubiustar-ultra"
DEFAULT_BRANCH="main"
PROJECT_NAME="biubiustar-ultra"

# 部署目录配置
DEPLOY_DIR="/opt/biubiustar"
TEMP_DIR="/tmp/biubiustar-deploy"

# 系统要求配置
MIN_MEMORY_GB=2
MIN_DISK_GB=20
SUPPORTED_OS=("ubuntu" "debian" "centos" "rhel" "rocky" "alma" "amzn")

# 软件版本配置
DOCKER_VERSION="20.10"
NODEJS_VERSION="18"
NGINX_VERSION="1.18"

# 端口配置
DEFAULT_APP_PORT=3000
DEFAULT_NGINX_HTTP_PORT=80
DEFAULT_NGINX_HTTPS_PORT=443

# 资源限制配置
DEFAULT_MEMORY_LIMIT=512
DEFAULT_CPU_LIMIT=1.0

# 功能开关配置
FEATURE_USER_REGISTRATION=true
FEATURE_USER_LOGIN=true
FEATURE_ADMIN_PANEL=true
# ... 更多配置
```

### 环境变量配置 (`.env`) - 辅助配置文件
**这是辅助配置文件，用于应用运行时**：

```bash
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# 端口配置
APP_PORT=3000
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443

# 性能配置
MEMORY_LIMIT=512
MAX_FILE_SIZE=100
```

## 🔄 配置文件关系图

```
┌─────────────────────────────────────────────────────────────┐
│                    部署配置优先级                            │
├─────────────────────────────────────────────────────────────┤
│  1️⃣ 命令行参数 (最高优先级)                                │
│     -r, -b, -d, -e, -m 等参数                            │
│                                                             │
│  2️⃣ deploy-config.sh (主要配置文件)                        │
│     - 部署过程控制                                         │
│     - 系统安装配置                                         │
│     - 软件版本管理                                         │
│     - 目录结构定义                                         │
│                                                             │
│  3️⃣ .env 文件 (应用运行时配置)                             │
│     - 数据库连接                                           │
│     - 应用端口                                             │
│     - 性能参数                                             │
│                                                             │
│  4️⃣ 内置默认值 (最低优先级)                                │
│     - 脚本中的硬编码值                                     │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 真正一键部署 (推荐)

> **⚠️ 重要提示**: 为了确保远程部署的可靠性，我们提供了专门用于远程部署的简化脚本 `one-click-deploy-remote.sh`，避免了复杂的配置文件依赖问题。

**新脚本的优势:**
- ✅ **无配置文件依赖**: 所有配置都硬编码在脚本中，避免路径问题
- ✅ **完整的系统检查**: 自动检测操作系统、内存、磁盘空间
- ✅ **智能软件安装**: 自动识别包管理器并安装必要软件
- ✅ **Docker自动安装**: 如果选择Docker模式，自动安装Docker和docker-compose
- ✅ **Node.js自动安装**: 自动安装Node.js 18.x版本
- ✅ **错误处理优化**: 更好的错误提示和用户引导

### 方式一：远程一键部署 (最简单) ⭐ 推荐
```bash
# 在全新服务器上执行这一条命令即可
sudo bash <(curl -sSL https://raw.githubusercontent.com/lyfe2025/biubiustar-ultra/main/deployment/scripts/one-click-deploy-remote.sh)
```

### 方式二：自定义配置部署
```bash
# 自定义仓库地址和部署目录
sudo bash <(curl -sSL https://raw.githubusercontent.com/lyfe2025/biubiustar-ultra/main/deployment/scripts/one-click-deploy-remote.sh) \
  -r https://github.com/your-username/your-repo \
  -d /home/user/project \
  -e prod \
  -m docker
```

### 方式三：本地脚本部署
```bash
# 1. 下载脚本
wget https://raw.githubusercontent.com/lyfe2025/biubiustar-ultra/main/deployment/scripts/one-click-deploy-remote.sh

# 2. 给执行权限
chmod +x one-click-deploy-remote.sh

# 3. 执行部署
sudo ./one-click-deploy-remote.sh
```

## ⚠️ 重要说明：一键部署的环境变量配置

### 环境变量配置流程
一键部署脚本会按以下顺序处理环境变量：

1. **自动创建 `.env` 文件**
   - 位置：`$DEPLOY_DIR/$PROJECT_NAME/.env`
   - 默认位置：`/opt/biubiustar/biubiustar-ultra/.env`
   - 来源：复制 `deployment/configs/env.example` 模板

2. **等待用户配置**
   - 脚本会暂停，等待你编辑 `.env` 文件
   - 必须配置 Supabase 参数才能继续

3. **验证配置**
   - 检查是否配置了必要的 Supabase 参数
   - 如果使用默认值，部署会失败

### 默认环境变量位置
```bash
# 部署目录 (可自定义)
DEPLOY_DIR="/opt/biubiustar"

# 项目目录
PROJECT_NAME="biubiustar-ultra"

# 环境变量文件位置
ENV_FILE="$DEPLOY_DIR/$PROJECT_NAME/.env"
# 默认: /opt/biubiustar/biubiustar-ultra/.env

# 环境变量模板位置
ENV_TEMPLATE="$DEPLOY_DIR/$PROJECT_NAME/deployment/configs/env.example"
# 默认: /opt/biubiustar/biubiustar-ultra/deployment/configs/env.example
```

### 环境变量配置示例
一键部署后，你需要编辑 `.env` 文件：

```bash
# 位置: /opt/biubiustar/biubiustar-ultra/.env

# =============================================================================
# 必需配置 (必须修改，不能使用默认值)
# =============================================================================
NODE_ENV=production
PORT=3000

# Supabase 配置 (必需)
VITE_SUPABASE_URL=https://your-project.supabase.co          # ⚠️ 修改为你的项目URL
VITE_SUPABASE_ANON_KEY=your_anon_key_here                  # ⚠️ 修改为你的匿名密钥
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here        # ⚠️ 修改为你的服务角色密钥

# =============================================================================
# 可选配置 (有默认值，可根据需要修改)
# =============================================================================
# 端口配置
APP_PORT=3000              # 应用端口
NGINX_HTTP_PORT=80         # Nginx HTTP 端口
NGINX_HTTPS_PORT=443       # Nginx HTTPS 端口

# 性能配置
MEMORY_LIMIT=512           # 内存限制 (MB)
MAX_FILE_SIZE=100          # 最大文件上传大小 (MB)

# 邮件服务 (可选)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 一键部署时的交互流程
```bash
$ sudo ./one-click-deploy.sh

[STEP] 配置环境变量...
[INFO] 创建环境变量配置文件...
[WARNING] 请编辑 .env 文件配置必要的参数
[INFO] 文件位置: /opt/biubiustar/biubiustar-ultra/.env

编辑完成后按回车继续，或按 Ctrl+C 退出...
# 此时脚本暂停，等待你编辑 .env 文件

# 编辑完成后按回车，脚本继续执行
[SUCCESS] 环境变量配置完成
```

## 🔧 一键部署功能

### 自动环境安装
- ✅ **基础软件包**: curl, wget, git, unzip 等
- ✅ **Docker**: 自动安装 Docker 和 Docker Compose
- ✅ **Node.js**: 自动安装 Node.js 18+ 和 PM2
- ✅ **Nginx**: 自动安装和配置 Nginx
- ✅ **防火墙**: 自动配置系统防火墙规则

### 自动代码管理
- ✅ **代码克隆**: 自动从 GitHub 克隆最新代码
- ✅ **分支管理**: 支持指定分支部署
- ✅ **代码更新**: 支持增量更新现有部署

### 智能配置
- ✅ **环境检测**: 自动识别操作系统类型
- ✅ **依赖检查**: 自动检查已安装的软件
- ✅ **权限管理**: 自动处理文件权限
- ✅ **服务配置**: 自动配置系统服务

## 📋 一键部署参数

### 基本参数
```bash
-r, --repo URL       # Git 仓库地址 (默认: https://github.com/lyfe2025/biubiustar-ultra)
-b, --branch BRANCH  # Git 分支 (默认: main)
-d, --dir DIR        # 部署目录 (默认: /opt/biubiustar)
-e, --env ENV        # 环境 (dev|staging|prod, 默认: prod)
-m, --mode MODE      # 部署模式 (docker|server, 默认: docker)
-s, --skip-env       # 跳过环境变量配置 (使用默认值)
-h, --help           # 显示帮助信息
```

### 使用示例
```bash
# 生产环境 Docker 部署
sudo ./one-click-deploy.sh -e prod -m docker

# 开发环境服务器部署
sudo ./one-click-deploy.sh -e dev -m server

# 自定义仓库和目录
sudo ./one-click-deploy.sh \
  -r https://github.com/user/repo \
  -b develop \
  -d /home/user/project \
  -e staging \
  -m docker
```

## 🎯 传统部署方式

### 1. 配置环境变量 (唯一需要配置的文件)
```bash
cp deployment/configs/env.example .env
nano .env  # 配置 Supabase 信息和其他参数
```

### 2. 执行部署
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
MAX_FILE_SIZE=100          # 最大文件上传大小 (MB)

# 备份配置
BACKUP_RETENTION_DAYS=7    # 备份保留天数
BACKUP_COMPRESSION_LEVEL=6 # 备份压缩级别

# 日志配置
LOG_MAX_SIZE=10m           # 日志文件最大大小
LOG_MAX_FILES=3            # 日志文件保留数量
```

## 📋 系统要求

- **操作系统**: Ubuntu 18.04+, Debian 9+, CentOS 7+, RHEL 7+, Rocky Linux 8+, AlmaLinux 8+, Amazon Linux 2
- **内存**: 至少 2GB 可用内存
- **磁盘**: 至少 20GB 可用空间
- **网络**: 需要访问 GitHub 和 Docker Hub
- **权限**: 需要 root 权限或 sudo 权限

## 🚨 注意事项

1. **真正一键部署**: 只需一条命令，自动处理所有环境安装和配置
2. **配置优先级明确**: `deploy-config.sh` 为主，`.env` 为辅
3. **环境变量必须配置**: 一键部署会暂停等待你配置 `.env` 文件，不能使用默认值
4. **统一配置文件**: 所有部署配置都在 `deploy-config.sh` 中，方便管理
5. **仓库地址可配置**: 默认使用官方仓库，可自定义为你的仓库
6. **所有服务自动适配**: 端口、路径、阈值等都会自动应用
7. **部署脚本需要执行权限**: 一键部署脚本会自动处理
8. **简化设计**: 移除了复杂的大文件处理，专注核心功能

## 🌟 一键部署优势

### 相比传统部署
- **无需手动安装**: 自动安装 Docker、Node.js、Nginx 等
- **无需克隆代码**: 自动从 GitHub 克隆最新代码
- **无需配置环境**: 自动检测系统并配置相应服务
- **无需管理权限**: 自动处理文件权限和服务配置

### 适用场景
- **全新服务器**: 购买新服务器后直接一键部署
- **快速测试**: 快速搭建测试环境
- **批量部署**: 在多台服务器上快速部署
- **环境迁移**: 快速迁移到新的服务器环境

## 🔧 自定义配置

### 修改部署配置 (主要配置)
如果需要修改部署相关的配置，编辑 `deployment/configs/deploy-config.sh` 文件：

```bash
# 修改默认仓库地址
DEFAULT_REPO_URL="https://github.com/your-username/your-repo"

# 修改默认部署目录
DEPLOY_DIR="/home/user/project"

# 修改系统要求
MIN_MEMORY_GB=4
MIN_DISK_GB=50

# 修改软件版本
NODEJS_VERSION="20"
DOCKER_VERSION="24.0"
```

### 修改应用配置 (辅助配置)
如果需要修改应用运行时的配置，编辑 `.env` 文件：

```bash
# 修改端口配置
APP_PORT=8080
NGINX_HTTP_PORT=8080

# 修改性能配置
MEMORY_LIMIT=1024
MAX_FILE_SIZE=200
```

## 📁 文件位置总结

### 一键部署后的文件结构
```bash
# 部署根目录 (默认: /opt/biubiustar)
DEPLOY_ROOT="/opt/biubiustar"

# 项目目录
PROJECT_DIR="$DEPLOY_ROOT/biubiustar-ultra"

# 环境变量文件位置
ENV_FILE="$PROJECT_DIR/.env"
# 默认: /opt/biubiustar/biubiustar-ultra/.env

# 环境变量模板位置
ENV_TEMPLATE="$PROJECT_DIR/deployment/configs/env.example"
# 默认: /opt/biubiustar/biubiustar-ultra/deployment/configs/env.example

# 部署配置中心位置 (主要配置文件)
DEPLOY_CONFIG="$PROJECT_DIR/deployment/configs/deploy-config.sh"
# 默认: /opt/biubiustar/biubiustar-ultra/deployment/configs/deploy-config.sh

# Docker 配置文件位置
DOCKER_COMPOSE="$PROJECT_DIR/deployment/docker-compose.yml"
# 默认: /opt/biubiustar/biubiustar-ultra/deployment/docker-compose.yml

# Nginx 配置文件位置
NGINX_CONFIG="$PROJECT_DIR/deployment/nginx/"
# 默认: /opt/biubiustar/biubiustar-ultra/deployment/nginx/
```

---

**🚀 开始部署**: 选择适合你的部署方式！

> 💡 **推荐**: 使用真正一键部署，只需一条命令搞定一切！
> 🔧 **自定义**: 支持自定义仓库地址、部署目录、环境等参数
> 📁 **配置集中**: 所有配置变量都集中在 `deploy-config.sh` 中，方便管理
> 🎯 **优先级明确**: `deploy-config.sh` 为主，`.env` 为辅
> ⚠️ **重要**: 一键部署会暂停等待你配置环境变量，不能使用默认值！

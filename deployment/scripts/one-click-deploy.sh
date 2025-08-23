#!/bin/bash

# Biubiustar Ultra 真正一键部署脚本
# 自动安装基础环境、克隆代码、配置并部署

set -e

# 加载配置文件
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../configs/deploy-config.sh"

if [[ -f "$CONFIG_FILE" ]]; then
    source "$CONFIG_FILE"
    log_info "配置文件加载成功: $CONFIG_FILE"
else
    log_error "配置文件不存在: $CONFIG_FILE"
    exit 1
fi

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

log_header() {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}================================${NC}"
}

# 显示帮助信息
show_help() {
    echo "Biubiustar Ultra 真正一键部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -r, --repo URL       Git 仓库地址 (默认: $DEFAULT_REPO_URL)"
    echo "  -b, --branch BRANCH  Git 分支 (默认: $DEFAULT_BRANCH)"
    echo "  -d, --dir DIR        部署目录 (默认: $DEPLOY_DIR)"
    echo "  -e, --env ENV        环境 (dev|staging|prod, 默认: $DEFAULT_ENVIRONMENT)"
    echo "  -m, --mode MODE      部署模式 (docker|server, 默认: $DEFAULT_DEPLOY_MODE)"
    echo "  -s, --skip-env       跳过环境变量配置 (使用默认值)"
    echo "  -h, --help           显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                                    # 使用默认配置一键部署"
    echo "  $0 -r https://github.com/user/repo   # 自定义仓库地址"
    echo "  $0 -d /home/user/project             # 自定义部署目录"
    echo "  $0 -e dev -m server                  # 开发环境服务器部署"
    echo ""
    echo "注意: 此脚本需要 root 权限或 sudo 权限"
}

# 默认值 (从配置文件读取)
REPO_URL="$DEFAULT_REPO_URL"
BRANCH="$DEFAULT_BRANCH"
DEPLOY_DIR="$DEPLOY_DIR"
ENVIRONMENT="$DEFAULT_ENVIRONMENT"
DEPLOY_MODE="$DEFAULT_DEPLOY_MODE"
SKIP_ENV_CONFIG="$SKIP_ENV_CONFIG_DEFAULT"

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--repo)
            REPO_URL="$2"
            shift 2
            ;;
        -b|--branch)
            BRANCH="$2"
            shift 2
            ;;
        -d|--dir)
            DEPLOY_DIR="$2"
            shift 2
            ;;
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -m|--mode)
            DEPLOY_MODE="$2"
            shift 2
            ;;
        -s|--skip-env)
            SKIP_ENV_CONFIG=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
done

# 验证参数
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    log_error "无效的环境: $ENVIRONMENT"
    exit 1
fi

if [[ ! "$DEPLOY_MODE" =~ ^(docker|server)$ ]]; then
    log_error "无效的部署模式: $DEPLOY_MODE"
    exit 1
fi

# 检查是否为 root 用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要 root 权限或 sudo 权限"
        log_info "请使用: sudo $0 [选项]"
        exit 1
    fi
}

# 检查系统类型
check_system() {
    log_step "检查系统环境..."
    
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        log_error "无法识别操作系统"
        exit 1
    fi
    
    log_info "操作系统: $OS $VER"
    
    # 检查是否为支持的发行版
    if [[ " ${SUPPORTED_OS[@]} " =~ " ${ID} " ]]; then
        log_success "支持的操作系统: $ID"
    else
        log_warning "未测试的操作系统: $ID，可能存在问题"
    fi
    
    # 检查系统资源
    check_system_resources
}

# 检查系统资源
check_system_resources() {
    log_info "检查系统资源..."
    
    # 检查内存
    MEMORY_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    MEMORY_GB=$((MEMORY_KB / 1024 / 1024))
    
    if [[ $MEMORY_GB -lt $MIN_MEMORY_GB ]]; then
        log_error "内存不足: 需要至少 ${MIN_MEMORY_GB}GB，当前 ${MEMORY_GB}GB"
        exit 1
    fi
    log_info "内存: ${MEMORY_GB}GB ✓"
    
    # 检查磁盘空间
    DISK_GB=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
    if [[ $DISK_GB -lt $MIN_DISK_GB ]]; then
        log_error "磁盘空间不足: 需要至少 ${MIN_DISK_GB}GB，当前 ${DISK_GB}GB"
        exit 1
    fi
    log_info "磁盘空间: ${DISK_GB}GB ✓"
}

# 安装基础软件包
install_packages() {
    log_step "安装基础软件包..."
    
    case $ID in
        ubuntu|debian)
            log_info "使用 apt 安装软件包..."
            apt update
            apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
            ;;
        centos|rhel|rocky|alma)
            log_info "使用 yum 安装软件包..."
            yum update -y
            yum install -y curl wget git unzip yum-utils
            ;;
        amzn)
            log_info "使用 yum 安装软件包 (Amazon Linux)..."
            yum update -y
            yum install -y curl wget git unzip
            ;;
        *)
            log_error "不支持的操作系统: $ID"
            exit 1
            ;;
    esac
    
    log_success "基础软件包安装完成"
}

# 安装 Docker
install_docker() {
    log_step "安装 Docker..."
    
    if command -v docker &> /dev/null; then
        log_info "Docker 已安装，版本: $(docker --version)"
        return
    fi
    
    case $ID in
        ubuntu|debian)
            log_info "安装 Docker (Ubuntu/Debian)..."
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
            apt update
            apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            ;;
        centos|rhel|rocky|alma)
            log_info "安装 Docker (CentOS/RHEL)..."
            yum install -y yum-utils
            yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            ;;
        amzn)
            log_info "安装 Docker (Amazon Linux)..."
            yum install -y docker
            ;;
    esac
    
    # 启动 Docker 服务
    systemctl start docker
    systemctl enable docker
    
    # 安装 Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_info "安装 Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    
    log_success "Docker 安装完成"
}

# 安装 Node.js
install_nodejs() {
    log_step "安装 Node.js..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_info "Node.js 已安装，版本: $NODE_VERSION"
        return
    fi
    
    case $ID in
        ubuntu|debian)
            log_info "安装 Node.js (Ubuntu/Debian)..."
            curl -fsSL https://deb.nodesource.com/setup_${NODEJS_VERSION}.x | bash -
            apt install -y nodejs
            ;;
        centos|rhel|rocky|alma)
            log_info "安装 Node.js (CentOS/RHEL)..."
            curl -fsSL https://rpm.nodesource.com/setup_${NODEJS_VERSION}.x | bash -
            yum install -y nodejs
            ;;
        amzn)
            log_info "安装 Node.js (Amazon Linux)..."
            curl -fsSL https://rpm.nodesource.com/setup_${NODEJS_VERSION}.x | bash -
            yum install -y nodejs
            ;;
    esac
    
    # 安装 PM2
    npm install -g pm2
    
    log_success "Node.js 安装完成"
}

# 安装 Nginx
install_nginx() {
    log_step "安装 Nginx..."
    
    if command -v nginx &> /dev/null; then
        log_info "Nginx 已安装，版本: $(nginx -v 2>&1)"
        return
    fi
    
    case $ID in
        ubuntu|debian)
            log_info "安装 Nginx (Ubuntu/Debian)..."
            apt install -y nginx
            ;;
        centos|rhel|rocky|alma)
            log_info "安装 Nginx (CentOS/RHEL)..."
            yum install -y nginx
            ;;
        amzn)
            log_info "安装 Nginx (Amazon Linux)..."
            yum install -y nginx
            ;;
    esac
    
    # 启动 Nginx 服务
    systemctl start nginx
    systemctl enable nginx
    
    log_success "Nginx 安装完成"
}

# 创建部署目录
create_deploy_directory() {
    log_step "创建部署目录..."
    
    mkdir -p "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
    
    log_info "部署目录: $DEPLOY_DIR"
    log_success "部署目录创建完成"
}

# 克隆代码
clone_code() {
    log_step "克隆项目代码..."
    
    if [[ -d "$PROJECT_NAME" ]]; then
        log_warning "项目目录已存在，更新代码..."
        cd "$PROJECT_NAME"
        git fetch origin
        git reset --hard origin/$BRANCH
    else
        log_info "克隆仓库: $REPO_URL"
        git clone -b "$BRANCH" "$REPO_URL" "$PROJECT_NAME"
        cd "$PROJECT_NAME"
    fi
    
    log_success "代码克隆/更新完成"
}

# 配置环境变量
configure_environment() {
    log_step "配置环境变量..."
    
    if [[ "$SKIP_ENV_CONFIG" == "true" ]]; then
        log_info "跳过环境变量配置，使用默认值"
        return
    fi
    
    cd "$DEPLOY_DIR/$PROJECT_NAME"
    
    if [[ ! -f ".env" ]]; then
        log_info "创建环境变量配置文件..."
        cp deployment/configs/env.example .env
        
        log_warning "请编辑 .env 文件配置必要的参数"
        log_info "文件位置: $DEPLOY_DIR/$PROJECT_NAME/.env"
        
        # 等待用户编辑
        read -p "编辑完成后按回车继续，或按 Ctrl+C 退出..."
        
        # 检查是否配置了必要的参数
        if ! grep -q "VITE_SUPABASE_URL" .env || grep -q "your-project.supabase.co" .env; then
            log_error "请先配置 Supabase 参数"
            exit 1
        fi
    else
        log_info "环境变量配置文件已存在"
    fi
    
    log_success "环境变量配置完成"
}

# 部署应用
deploy_application() {
    log_step "部署应用..."
    
    cd "$DEPLOY_DIR/$PROJECT_NAME"
    
    # 给部署脚本执行权限
    chmod +x deployment/scripts/deploy.sh
    
    # 执行部署
    log_info "开始部署，模式: $DEPLOY_MODE, 环境: $ENVIRONMENT"
    ./deployment/scripts/deploy.sh -m "$DEPLOY_MODE" -e "$ENVIRONMENT" -a deploy
    
    log_success "应用部署完成"
}

# 配置防火墙
configure_firewall() {
    log_step "配置防火墙..."
    
    case $ID in
        ubuntu|debian)
            if command -v ufw &> /dev/null; then
                log_info "配置 UFW 防火墙..."
                ufw allow $FIREWALL_SSH_PORT/tcp
                ufw allow $FIREWALL_HTTP_PORT/tcp
                ufw allow $FIREWALL_HTTPS_PORT/tcp
                ufw --force enable
            fi
            ;;
        centos|rhel|rocky|alma|amzn)
            if command -v firewall-cmd &> /dev/null; then
                log_info "配置 firewalld 防火墙..."
                firewall-cmd --permanent --add-service=ssh
                firewall-cmd --permanent --add-service=http
                firewall-cmd --permanent --add-service=https
                firewall-cmd --reload
            fi
            ;;
    esac
    
    log_success "防火墙配置完成"
}

# 显示部署结果
show_deployment_result() {
    log_header "部署完成！"
    
    echo ""
    echo "🎉 Biubiustar Ultra 部署成功！"
    echo ""
    echo "📁 部署信息:"
    echo "  - 部署目录: $DEPLOY_DIR/$PROJECT_NAME"
    echo "  - 部署模式: $DEPLOY_MODE"
    echo "  - 环境: $ENVIRONMENT"
    echo "  - 代码仓库: $REPO_URL"
    echo "  - 分支: $BRANCH"
    echo ""
    echo "🌐 访问地址:"
    echo "  - 应用: http://$(curl -s ifconfig.me 2>/dev/null || echo "localhost")"
    echo "  - 健康检查: http://$(curl -s ifconfig.me 2>/dev/null || echo "localhost")/health"
    echo ""
    echo "📋 常用命令:"
    echo "  - 查看状态: cd $DEPLOY_DIR/$PROJECT_NAME && ./deployment/scripts/deploy.sh -m $DEPLOY_MODE -a monitor"
    echo "  - 更新代码: cd $DEPLOY_DIR/$PROJECT_NAME && ./deployment/scripts/deploy.sh -m $DEPLOY_MODE -a update"
    echo "  - 查看日志: cd $DEPLOY_DIR/$PROJECT_NAME && ./deployment/scripts/deploy.sh -m $DEPLOY_MODE -a logs"
    echo "  - 创建备份: cd $DEPLOY_DIR/$PROJECT_NAME && ./deployment/scripts/deploy.sh -m $DEPLOY_MODE -a backup"
    echo ""
    echo "🔧 配置文件:"
    echo "  - 环境变量: $DEPLOY_DIR/$PROJECT_NAME/.env"
    echo "  - Docker 配置: $DEPLOY_DIR/$PROJECT_NAME/deployment/docker-compose.yml"
    echo "  - Nginx 配置: $DEPLOY_DIR/$PROJECT_NAME/deployment/nginx/"
    echo "  - 部署配置: $DEPLOY_DIR/$PROJECT_NAME/deployment/configs/deploy-config.sh"
    echo ""
    echo "📚 文档:"
    echo "  - 项目地址: $REPO_URL"
    echo "  - 部署说明: $DEPLOY_DIR/$PROJECT_NAME/deployment/README.md"
    echo ""
    echo "🚀 开始使用你的 Biubiustar Ultra 应用吧！"
}

# 主函数
main() {
    log_header "Biubiustar Ultra 真正一键部署"
    
    echo ""
    echo "🎯 部署配置:"
    echo "  - 仓库地址: $REPO_URL"
    echo "  - 分支: $BRANCH"
    echo "  - 部署目录: $DEPLOY_DIR"
    echo "  - 环境: $ENVIRONMENT"
    echo "  - 部署模式: $DEPLOY_MODE"
    echo "  - 跳过环境配置: $SKIP_ENV_CONFIG"
    echo ""
    
    # 确认部署
    read -p "确认开始部署？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "部署已取消"
        exit 0
    fi
    
    # 执行部署步骤
    check_root
    check_system
    install_packages
    install_docker
    install_nodejs
    install_nginx
    create_deploy_directory
    clone_code
    configure_environment
    deploy_application
    configure_firewall
    show_deployment_result
}

# 错误处理
trap 'log_error "部署过程中发生错误，退出码: $?"' ERR

# 执行主函数
main "$@"

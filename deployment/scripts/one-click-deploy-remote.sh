#!/bin/bash

# Biubiustar Ultra 远程一键部署脚本 (简化版本)
# 专门用于远程部署，避免复杂的配置文件依赖

set -e

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

# 默认配置值 (硬编码，避免配置文件依赖)
DEFAULT_REPO_URL="https://github.com/lyfe2025/biubiustar-ultra"
DEFAULT_BRANCH="main"
DEPLOY_DIR="/opt/biubiustar"
DEFAULT_ENVIRONMENT="prod"
DEFAULT_DEPLOY_MODE="docker"
SKIP_ENV_CONFIG_DEFAULT=false

# 显示帮助信息
show_help() {
    echo "Biubiustar Ultra 远程一键部署脚本 (简化版本)"
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

# 默认值
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

# 检查系统要求
check_system_requirements() {
    log_info "检查系统要求..."
    
    # 检查是否为root用户
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要 root 权限，请使用 sudo 运行"
        exit 1
    fi
    
    # 检查操作系统
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        log_info "检测到操作系统: $PRETTY_NAME"
    else
        log_warning "无法检测操作系统类型"
    fi
    
    # 检查内存
    MEMORY_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    MEMORY_GB=$((MEMORY_KB / 1024 / 1024))
    if [[ $MEMORY_GB -lt 2 ]]; then
        log_warning "系统内存不足，推荐至少 2GB 内存"
    else
        log_info "系统内存: ${MEMORY_GB}GB"
    fi
    
    # 检查磁盘空间
    DISK_GB=$(df / | awk 'NR==2 {print int($4/1024/1024)}')
    if [[ $DISK_GB -lt 20 ]]; then
        log_warning "磁盘空间不足，推荐至少 20GB 可用空间"
    else
        log_info "可用磁盘空间: ${DISK_GB}GB"
    fi
}

# 安装基础软件
install_base_software() {
    log_info "安装基础软件..."
    
    # 更新包管理器
    if command -v apt-get &> /dev/null; then
        log_info "使用 apt-get 更新系统..."
        apt-get update
        apt-get install -y curl wget git unzip
    elif command -v yum &> /dev/null; then
        log_info "使用 yum 更新系统..."
        yum update -y
        yum install -y curl wget git unzip
    elif command -v dnf &> /dev/null; then
        log_info "使用 dnf 更新系统..."
        dnf update -y
        dnf install -y curl wget git unzip
    else
        log_error "不支持的包管理器，请手动安装 curl, wget, git, unzip"
        exit 1
    fi
    
    # 安装Docker (如果选择docker模式)
    if [[ "$DEPLOY_MODE" == "docker" ]]; then
        log_info "安装 Docker..."
        if ! command -v docker &> /dev/null; then
            curl -fsSL https://get.docker.com -o get-docker.sh
            sh get-docker.sh
            systemctl enable docker
            systemctl start docker
            rm get-docker.sh
        else
            log_info "Docker 已安装"
        fi
    fi
    
    # 安装Node.js
    if ! command -v node &> /dev/null; then
        log_info "安装 Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    else
        log_info "Node.js 已安装: $(node --version)"
    fi
}

# 克隆代码仓库
clone_repository() {
    log_info "克隆代码仓库: $REPO_URL"
    
    # 创建部署目录
    mkdir -p "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
    
    # 克隆或更新代码
    if [[ -d "biubiustar-ultra" ]]; then
        log_info "项目目录已存在，更新代码..."
        cd biubiustar-ultra
        git fetch origin
        git checkout "$BRANCH"
        git pull origin "$BRANCH"
    else
        log_info "克隆新项目..."
        git clone -b "$BRANCH" "$REPO_URL"
        cd biubiustar-ultra
    fi
    
    log_success "代码仓库准备完成"
}

# 配置环境变量
configure_environment() {
    log_info "配置环境变量..."
    
    # 创建环境变量文件
    ENV_FILE=".env"
    ENV_TEMPLATE="deployment/configs/env.example"
    
    if [[ -f "$ENV_TEMPLATE" ]]; then
        cp "$ENV_TEMPLATE" "$ENV_FILE"
        log_info "环境变量模板已复制到 $ENV_FILE"
        log_warning "请编辑 $ENV_FILE 文件，配置必要的环境变量后继续"
        
        # 等待用户配置
        read -p "配置完成后按回车键继续..."
        
        # 检查是否配置了必要的变量
        if grep -q "your_supabase_url" "$ENV_FILE" || grep -q "your_anon_key" "$ENV_FILE"; then
            log_error "请先配置必要的环境变量，特别是 Supabase 相关配置"
            exit 1
        fi
        
        log_success "环境变量配置完成"
    else
        log_warning "环境变量模板不存在，请手动创建 $ENV_FILE 文件"
    fi
}

# 执行部署
execute_deployment() {
    log_info "执行部署..."
    
    if [[ "$DEPLOY_MODE" == "docker" ]]; then
        log_info "使用 Docker 模式部署..."
        
        # 检查docker-compose
        if ! command -v docker-compose &> /dev/null; then
            log_info "安装 docker-compose..."
            curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
        fi
        
        # 启动服务
        docker-compose up -d
        log_success "Docker 服务启动完成"
        
    elif [[ "$DEPLOY_MODE" == "server" ]]; then
        log_info "使用传统服务器模式部署..."
        
        # 安装依赖
        npm install
        
        # 构建项目
        npm run build
        
        log_success "服务器模式部署完成"
    fi
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    if [[ "$DEPLOY_MODE" == "docker" ]]; then
        # 检查服务状态
        docker-compose ps
        log_success "Docker 服务已启动"
    else
        # 启动应用
        npm start &
        log_success "应用服务已启动"
    fi
}

# 显示部署信息
show_deployment_info() {
    log_header "部署完成！"
    log_info "部署信息:"
    log_info "  环境: $ENVIRONMENT"
    log_info "  模式: $DEPLOY_MODE"
    log_info "  目录: $DEPLOY_DIR"
    log_info "  仓库: $REPO_URL"
    log_info "  分支: $BRANCH"
    
    if [[ "$DEPLOY_MODE" == "docker" ]]; then
        log_info "Docker 服务状态:"
        docker-compose ps
    fi
    
    log_info "访问地址: http://localhost:3000"
    log_info "管理后台: http://localhost:3000/admin"
}

# 主部署逻辑
main() {
    log_header "开始部署 Biubiustar Ultra"
    
    log_step "1. 检查系统环境"
    check_system_requirements
    
    log_step "2. 安装基础软件"
    install_base_software
    
    log_step "3. 克隆代码仓库"
    clone_repository
    
    log_step "4. 配置环境变量"
    if [[ "$SKIP_ENV_CONFIG" != "true" ]]; then
        configure_environment
    else
        log_info "跳过环境变量配置"
    fi
    
    log_step "5. 执行部署"
    execute_deployment
    
    log_step "6. 启动服务"
    start_services
    
    log_success "部署完成！"
    show_deployment_info
}

# 如果直接运行此脚本，则执行主函数
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

#!/bin/bash

# Biubiustar Ultra macOS 兼容一键部署脚本
# 专门针对 macOS 环境优化，兼容旧版 bash

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

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

# 默认配置
REPO_URL="https://github.com/lyfe2025/biubiustar-ultra"
BRANCH="main"
DEPLOY_DIR="/opt/biubiustar"
PROJECT_NAME="biubiustar-ultra"

# 显示帮助信息
show_help() {
    echo "Biubiustar Ultra macOS 兼容一键部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -r, --repo URL       Git 仓库地址 (默认: $REPO_URL)"
    echo "  -b, --branch BRANCH  Git 分支 (默认: $BRANCH)"
    echo "  -d, --dir DIR        部署目录 (默认: $DEPLOY_DIR)"
    echo "  -h, --help           显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                                    # 使用默认配置一键部署"
    echo "  $0 -r https://github.com/user/repo   # 自定义仓库地址"
    echo "  $0 -d /home/user/project             # 自定义部署目录"
    echo ""
    echo "注意: 此脚本需要 root 权限或 sudo 权限"
}

# 解析命令行参数 (兼容旧版bash)
parse_args() {
    while [ $# -gt 0 ]; do
        case "$1" in
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
}

# 检查是否为root用户
check_root() {
    if [ "$(id -u)" != "0" ]; then
        log_error "此脚本需要 root 权限，请使用 sudo 运行"
        exit 1
    fi
    log_success "权限检查通过"
}

# 检测操作系统
detect_os() {
    log_info "检测操作系统..."
    
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS_NAME="$ID"
        OS_VERSION="$VERSION_ID"
        OS_PRETTY="$PRETTY_NAME"
        log_info "检测到操作系统: $OS_PRETTY"
    elif [ -f /etc/redhat-release ]; then
        OS_NAME="rhel"
        OS_VERSION=$(cat /etc/redhat-release | grep -o '[0-9]\+\.[0-9]\+')
        OS_PRETTY="Red Hat Enterprise Linux $OS_VERSION"
        log_info "检测到操作系统: $OS_PRETTY"
    elif [ "$(uname)" = "Darwin" ]; then
        OS_NAME="macos"
        OS_VERSION=$(sw_vers -productVersion)
        OS_PRETTY="macOS $OS_VERSION"
        log_info "检测到操作系统: $OS_PRETTY"
    else
        log_warning "无法检测操作系统类型，将使用通用安装方法"
        OS_NAME="unknown"
    fi
}

# 检查系统资源
check_system_resources() {
    log_info "检查系统资源..."
    
    # 检查内存
    if [ -f /proc/meminfo ]; then
        MEMORY_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
        MEMORY_GB=$((MEMORY_KB / 1024 / 1024))
        log_info "系统内存: ${MEMORY_GB}GB"
        
        if [ $MEMORY_GB -lt 2 ]; then
            log_warning "系统内存不足，推荐至少 2GB 内存"
        fi
    elif [ "$(uname)" = "Darwin" ]; then
        MEMORY_GB=$(sysctl -n hw.memsize | awk '{print int($1/1024/1024/1024)}')
        log_info "系统内存: ${MEMORY_GB}GB"
        
        if [ $MEMORY_GB -lt 2 ]; then
            log_warning "系统内存不足，推荐至少 2GB 内存"
        fi
    fi
    
    # 检查磁盘空间
    if [ -f /proc/mounts ]; then
        DISK_GB=$(df / | awk 'NR==2 {print int($4/1024/1024)}')
        log_info "可用磁盘空间: ${DISK_GB}GB"
        
        if [ $DISK_GB -lt 20 ]; then
            log_warning "磁盘空间不足，推荐至少 20GB 可用空间"
        fi
    elif [ "$(uname)" = "Darwin" ]; then
        DISK_GB=$(df / | awk 'NR==2 {print int($4/1024/1024)}')
        log_info "可用磁盘空间: ${DISK_GB}GB"
        
        if [ $DISK_GB -lt 20 ]; then
            log_warning "磁盘空间不足，推荐至少 20GB 可用空间"
        fi
    fi
    
    # 检查CPU核心数
    if [ -f /proc/cpuinfo ]; then
        CPU_CORES=$(grep -c processor /proc/cpuinfo)
        log_info "CPU核心数: $CPU_CORES"
    elif [ "$(uname)" = "Darwin" ]; then
        CPU_CORES=$(sysctl -n hw.ncpu)
        log_info "CPU核心数: $CPU_CORES"
    fi
}

# 安装基础软件包
install_base_packages() {
    log_info "安装基础软件包..."
    
    case "$OS_NAME" in
        ubuntu|debian)
            log_info "使用 apt-get 安装软件包..."
            apt-get update
            apt-get install -y curl wget git unzip ca-certificates apt-transport-https software-properties-common
            ;;
        centos|rhel|rocky|alma)
            log_info "使用 yum 安装软件包..."
            yum update -y
            yum install -y curl wget git unzip ca-certificates
            ;;
        fedora)
            log_info "使用 dnf 安装软件包..."
            dnf update -y
            dnf install -y curl wget git unzip ca-certificates
            ;;
        macos)
            log_info "检测到 macOS，检查 Homebrew..."
            if ! command -v brew >/dev/null 2>&1; then
                log_info "安装 Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            log_info "使用 Homebrew 安装软件包..."
            brew install curl wget git
            log_success "macOS 软件包安装完成"
            return 0
            ;;
        *)
            log_warning "不支持的包管理器，请手动安装 curl, wget, git, unzip"
            ;;
    esac
    
    log_success "基础软件包安装完成"
}

# 安装Docker
install_docker() {
    log_info "检查Docker安装状态..."
    
    if command -v docker >/dev/null 2>&1; then
        DOCKER_VERSION=$(docker --version)
        log_info "Docker 已安装: $DOCKER_VERSION"
    else
        log_info "安装 Docker..."
        
        case "$OS_NAME" in
            ubuntu|debian)
                # 添加Docker官方GPG密钥
                curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
                
                # 添加Docker仓库
                echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
                
                apt-get update
                apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
                ;;
            centos|rhel|rocky|alma)
                yum install -y yum-utils
                yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
                yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
                ;;
            fedora)
                dnf install -y dnf-plugins-core
                dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
                dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
                ;;
            macos)
                log_info "在 macOS 上安装 Docker Desktop..."
                log_warning "请手动安装 Docker Desktop: https://www.docker.com/products/docker-desktop"
                log_info "安装完成后，请确保 Docker Desktop 正在运行"
                read -p "Docker Desktop 安装并运行后，按回车键继续..."
                ;;
            *)
                # 使用官方安装脚本
                curl -fsSL https://get.docker.com -o get-docker.sh
                sh get-docker.sh
                rm get-docker.sh
                ;;
        esac
        
        # 启动Docker服务 (非macOS)
        if [ "$OS_NAME" != "macos" ]; then
            systemctl enable docker
            systemctl start docker
        fi
        
        log_success "Docker 安装完成"
    fi
    
    # 检查Docker Compose
    if ! command -v docker-compose >/dev/null 2>&1; then
        log_info "安装 Docker Compose..."
        
        # 下载最新版本的docker-compose
        COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d'"' -f4)
        curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        
        log_success "Docker Compose 安装完成"
    fi
    
    # 验证Docker安装
    docker --version
    docker-compose --version
}

# 安装Node.js
install_nodejs() {
    log_info "检查Node.js安装状态..."
    
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        log_info "Node.js 已安装: $NODE_VERSION"
        
        # 检查版本是否满足要求
        NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_MAJOR" -lt 18 ]; then
            log_warning "Node.js版本过低，需要18.x或更高版本"
            log_info "重新安装Node.js 18.x..."
        else
            return 0
        fi
    fi
    
    log_info "安装 Node.js 18.x..."
    
    case "$OS_NAME" in
        ubuntu|debian)
            curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
            apt-get install -y nodejs
            ;;
        centos|rhel|rocky|alma)
            curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
            yum install -y nodejs
            ;;
        fedora)
            curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
            dnf install -y nodejs
            ;;
        macos)
            log_info "使用 Homebrew 安装 Node.js..."
            brew install node@18
            brew link node@18 --force
            ;;
        *)
            # 使用官方安装脚本
            curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
            apt-get install -y nodejs
            ;;
    esac
    
    log_success "Node.js 安装完成: $(node --version)"
}

# 创建部署目录
create_deploy_directory() {
    log_info "创建部署目录: $DEPLOY_DIR"
    
    mkdir -p "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
    
    log_success "部署目录创建完成"
}

# 克隆或更新代码仓库
clone_repository() {
    log_info "处理代码仓库: $REPO_URL"
    
    cd "$DEPLOY_DIR"
    
    if [ -d "$PROJECT_NAME" ]; then
        log_info "项目目录已存在，更新代码..."
        cd "$PROJECT_NAME"
        
        # 备份当前配置
        if [ -f ".env" ]; then
            cp .env ".env.backup.$(date +%Y%m%d_%H%M%S)"
            log_info "已备份现有环境变量配置"
        fi
        
        # 更新代码
        git fetch origin
        git checkout "$BRANCH"
        git pull origin "$BRANCH"
        log_success "代码更新完成"
    else
        log_info "克隆新项目..."
        git clone -b "$BRANCH" "$REPO_URL"
        cd "$PROJECT_NAME"
        log_success "代码克隆完成"
    fi
}

# 配置环境变量
setup_environment() {
    log_info "配置环境变量..."
    
    cd "$DEPLOY_DIR/$PROJECT_NAME"
    
    # 检查是否存在.env文件
    if [ -f ".env" ]; then
        log_info "发现现有.env文件，检查配置..."
        
        # 检查关键配置
        if grep -q "your_supabase_url\|your_anon_key\|your_service_role_key" .env; then
            log_warning "发现未配置的环境变量，需要重新配置"
            log_info "请编辑 .env 文件，配置以下必需变量："
            echo "  - VITE_SUPABASE_URL"
            echo "  - VITE_SUPABASE_ANON_KEY"
            echo "  - SUPABASE_SERVICE_ROLE_KEY"
            echo ""
            read -p "配置完成后按回车键继续..."
            
            # 再次检查配置
            if grep -q "your_supabase_url\|your_anon_key\|your_service_role_key" .env; then
                log_error "环境变量配置不完整，请检查配置后重试"
                exit 1
            fi
        fi
        
        log_success "环境变量配置检查通过"
    else
        log_info "创建环境变量配置文件..."
        
        # 复制模板文件
        if [ -f "deployment/configs/env.example" ]; then
            cp deployment/configs/env.example .env
            log_warning "已创建.env文件，请编辑并配置必要的环境变量"
            log_info "特别是以下必需配置："
            echo "  - VITE_SUPABASE_URL"
            echo "  - VITE_SUPABASE_ANON_KEY"
            echo "  - SUPABASE_SERVICE_ROLE_KEY"
            echo ""
            read -p "配置完成后按回车键继续..."
            
            # 检查配置
            if grep -q "your_supabase_url\|your_anon_key\|your_service_role_key" .env; then
                log_error "环境变量配置不完整，请检查配置后重试"
                exit 1
            fi
        else
            log_error "找不到环境变量模板文件 deployment/configs/env.example"
            exit 1
        fi
    fi
    
    log_success "环境变量配置完成"
}

# 构建和启动Docker服务
start_docker_services() {
    log_info "启动Docker服务..."
    
    cd "$DEPLOY_DIR/$PROJECT_NAME"
    
    # 检查docker-compose.yml文件
    if [ ! -f "deployment/docker-compose.yml" ]; then
        log_error "找不到docker-compose.yml文件"
        exit 1
    fi
    
    # 创建必要的目录
    mkdir -p uploads logs backups ssl
    
    # 构建并启动服务
    log_info "构建Docker镜像..."
    docker-compose -f deployment/docker-compose.yml build
    
    log_info "启动Docker服务..."
    docker-compose -f deployment/docker-compose.yml up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    # 检查服务状态
    log_info "检查服务状态..."
    docker-compose -f deployment/docker-compose.yml ps
    
    # 检查服务健康状态
    log_info "检查服务健康状态..."
    if docker-compose -f deployment/docker-compose.yml ps | grep -q "Up"; then
        log_success "Docker服务启动成功"
    else
        log_error "Docker服务启动失败"
        docker-compose -f deployment/docker-compose.yml logs
        exit 1
    fi
}

# 显示部署信息
show_deployment_info() {
    log_header "部署完成！"
    
    cd "$DEPLOY_DIR/$PROJECT_NAME"
    
    log_info "部署信息:"
    log_info "  项目目录: $DEPLOY_DIR/$PROJECT_NAME"
    log_info "  代码仓库: $REPO_URL"
    log_info "  代码分支: $BRANCH"
    log_info "  环境变量: $DEPLOY_DIR/$PROJECT_NAME/.env"
    
    log_info "服务状态:"
    docker-compose -f deployment/docker-compose.yml ps
    
    log_info "访问地址:"
    log_info "  应用: http://localhost:3000"
    log_info "  管理后台: http://localhost:3000/admin"
    log_info "  健康检查: http://localhost:3000/api/health"
    
    log_info "常用命令:"
    log_info "  查看日志: docker-compose -f deployment/docker-compose.yml logs -f"
    log_info "  停止服务: docker-compose -f deployment/docker-compose.yml down"
    log_info "  重启服务: docker-compose -f deployment/docker-compose.yml restart"
    log_info "  更新代码: cd $DEPLOY_DIR/$PROJECT_NAME && git pull origin $BRANCH"
    
    log_success "Biubiustar Ultra 部署完成！"
}

# 主函数
main() {
    log_header "开始部署 Biubiustar Ultra (macOS 兼容版)"
    
    log_step "1. 权限检查"
    check_root
    
    log_step "2. 系统检测"
    detect_os
    check_system_resources
    
    log_step "3. 安装基础软件"
    install_base_packages
    
    log_step "4. 安装Docker"
    install_docker
    
    log_step "5. 安装Node.js"
    install_nodejs
    
    log_step "6. 创建部署目录"
    create_deploy_directory
    
    log_step "7. 克隆代码仓库"
    clone_repository
    
    log_step "8. 配置环境变量"
    setup_environment
    
    log_step "9. 启动Docker服务"
    start_docker_services
    
    log_step "10. 部署完成"
    show_deployment_info
}

# 错误处理
trap 'log_error "部署过程中发生错误，请检查日志"; exit 1' ERR

# 解析命令行参数
parse_args "$@"

# 如果直接运行此脚本，则执行主函数
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main
fi

#!/bin/bash

# ========================================
# BiubiuStar Ultra - 环境检查脚本
# ========================================
# 功能：自动检查并安装必要的依赖
# 依赖：Git, Node.js, npm/pnpm
# 作者：BiubiuStar Ultra Team
# ========================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# 检查操作系统
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        if command -v apt-get &> /dev/null; then
            PACKAGE_MANAGER="apt"
        elif command -v yum &> /dev/null; then
            PACKAGE_MANAGER="yum"
        elif command -v dnf &> /dev/null; then
            PACKAGE_MANAGER="dnf"
        else
            log_error "不支持的Linux发行版"
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        PACKAGE_MANAGER="brew"
    else
        log_error "不支持的操作系统: $OSTYPE"
        exit 1
    fi
    log_info "检测到操作系统: $OS"
}

# 检查并安装Homebrew (macOS)
install_homebrew() {
    if [[ "$OS" == "macos" ]] && ! command -v brew &> /dev/null; then
        log_info "正在安装Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        if [ $? -eq 0 ]; then
            log_success "Homebrew安装成功"
        else
            log_error "Homebrew安装失败"
            exit 1
        fi
    fi
}

# 检查Git
check_git() {
    log_info "检查Git..."
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version | cut -d' ' -f3)
        log_success "Git已安装 (版本: $GIT_VERSION)"
        return 0
    else
        log_warning "Git未安装"
        return 1
    fi
}

# 安装Git
install_git() {
    log_info "正在安装Git..."
    case $PACKAGE_MANAGER in
        "brew")
            brew install git
            ;;
        "apt")
            sudo apt-get update && sudo apt-get install -y git
            ;;
        "yum")
            sudo yum install -y git
            ;;
        "dnf")
            sudo dnf install -y git
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        log_success "Git安装成功"
    else
        log_error "Git安装失败"
        exit 1
    fi
}

# 检查Node.js
check_node() {
    log_info "检查Node.js..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        
        if [ "$NODE_MAJOR_VERSION" -ge 18 ]; then
            log_success "Node.js已安装 (版本: $NODE_VERSION)"
            return 0
        else
            log_warning "Node.js版本过低 (当前: $NODE_VERSION, 需要: >= 18.x)"
            return 1
        fi
    else
        log_warning "Node.js未安装"
        return 1
    fi
}

# 安装Node.js
install_node() {
    log_info "正在安装Node.js..."
    
    # 优先使用nvm安装
    if command -v nvm &> /dev/null; then
        log_info "使用nvm安装Node.js LTS版本..."
        nvm install --lts
        nvm use --lts
    else
        # 使用包管理器安装
        case $PACKAGE_MANAGER in
            "brew")
                brew install node
                ;;
            "apt")
                # 使用NodeSource仓库安装最新LTS版本
                curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
                sudo apt-get install -y nodejs
                ;;
            "yum")
                # 使用NodeSource仓库
                curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
                sudo yum install -y nodejs
                ;;
            "dnf")
                # 使用NodeSource仓库
                curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
                sudo dnf install -y nodejs
                ;;
        esac
    fi
    
    if [ $? -eq 0 ]; then
        log_success "Node.js安装成功"
    else
        log_error "Node.js安装失败"
        exit 1
    fi
}

# 检查npm
check_npm() {
    log_info "检查npm..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        log_success "npm已安装 (版本: $NPM_VERSION)"
        return 0
    else
        log_warning "npm未安装"
        return 1
    fi
}

# 检查pnpm
check_pnpm() {
    log_info "检查pnpm..."
    if command -v pnpm &> /dev/null; then
        PNPM_VERSION=$(pnpm --version)
        log_success "pnpm已安装 (版本: $PNPM_VERSION)"
        return 0
    else
        log_warning "pnpm未安装"
        return 1
    fi
}

# 安装pnpm
install_pnpm() {
    log_info "正在安装pnpm..."
    npm install -g pnpm
    
    if [ $? -eq 0 ]; then
        log_success "pnpm安装成功"
    else
        log_error "pnpm安装失败"
        exit 1
    fi
}

# 检查Docker (可选)
check_docker() {
    log_info "检查Docker..."
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | sed 's/,//')
        log_success "Docker已安装 (版本: $DOCKER_VERSION)"
        
        # 检查Docker是否运行
        if docker info &> /dev/null; then
            log_success "Docker服务正在运行"
        else
            log_warning "Docker已安装但服务未运行，请启动Docker服务"
        fi
        return 0
    else
        log_warning "Docker未安装 (可选依赖)"
        return 1
    fi
}

# 安装Docker
install_docker() {
    log_info "正在安装Docker..."
    case $PACKAGE_MANAGER in
        "brew")
            log_info "请手动安装Docker Desktop for Mac"
            log_info "下载地址: https://www.docker.com/products/docker-desktop"
            ;;
        "apt")
            # 安装Docker CE
            sudo apt-get update
            sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
            echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io
            sudo systemctl start docker
            sudo systemctl enable docker
            ;;
        "yum")
            sudo yum install -y yum-utils
            sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            sudo yum install -y docker-ce docker-ce-cli containerd.io
            sudo systemctl start docker
            sudo systemctl enable docker
            ;;
        "dnf")
            sudo dnf -y install dnf-plugins-core
            sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
            sudo dnf install -y docker-ce docker-ce-cli containerd.io
            sudo systemctl start docker
            sudo systemctl enable docker
            ;;
    esac
}

# 检查网络连接
check_network() {
    log_info "检查网络连接..."
    if ping -c 1 github.com &> /dev/null; then
        log_success "网络连接正常"
        return 0
    else
        log_error "无法连接到GitHub，请检查网络连接"
        return 1
    fi
}

# 主函数
main() {
    echo "========================================"
    echo "BiubiuStar Ultra - 环境检查脚本"
    echo "========================================"
    echo ""
    
    # 检测操作系统
    detect_os
    
    # 安装Homebrew (macOS)
    if [[ "$OS" == "macos" ]]; then
        install_homebrew
    fi
    
    # 检查网络连接
    if ! check_network; then
        exit 1
    fi
    
    # 检查并安装Git
    if ! check_git; then
        install_git
    fi
    
    # 检查并安装Node.js
    if ! check_node; then
        install_node
    fi
    
    # 检查并安装npm
    if ! check_npm; then
        log_error "npm安装失败，请手动安装"
        exit 1
    fi
    
    # 检查并安装pnpm
    if ! check_pnpm; then
        install_pnpm
    fi
    
    # 检查Docker (可选)
    if ! check_docker; then
        read -p "是否安装Docker? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_docker
        else
            log_info "跳过Docker安装"
        fi
    fi
    
    echo ""
    echo "========================================"
    log_success "环境检查完成！"
    echo "========================================"
    echo ""
    
    # 显示版本信息
    echo "已安装的工具版本:"
    echo "- Git: $(git --version 2>/dev/null || echo '未安装')"
    echo "- Node.js: $(node --version 2>/dev/null || echo '未安装')"
    echo "- npm: $(npm --version 2>/dev/null || echo '未安装')"
    echo "- pnpm: $(pnpm --version 2>/dev/null || echo '未安装')"
    echo "- Docker: $(docker --version 2>/dev/null | cut -d' ' -f3 | sed 's/,//' || echo '未安装')"
    echo ""
    
    log_info "现在可以运行部署脚本: ./deploy.sh"
}

# 运行主函数
main "$@"
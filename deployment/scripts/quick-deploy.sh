#!/bin/bash

# Biubiustar Ultra 快速部署脚本
# 可以从远程下载并执行，实现真正的远程一键部署

set -e

# 加载配置文件 (如果存在)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../configs/deploy-config.sh"

if [[ -f "$CONFIG_FILE" ]]; then
    source "$CONFIG_FILE"
    log_info "配置文件加载成功: $CONFIG_FILE"
else
    # 如果配置文件不存在，使用默认值
    SCRIPT_BASE_URL="https://raw.githubusercontent.com/lyfe2025/biubiustar-ultra/main/deployment/scripts"
    ONE_CLICK_SCRIPT_URL="$SCRIPT_BASE_URL/one-click-deploy.sh"
    QUICK_DEPLOY_SCRIPT_URL="$SCRIPT_BASE_URL/quick-deploy.sh"
    TEMP_DIR="/tmp/biubiustar-deploy"
    
    # 颜色定义
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    CYAN='\033[0;36m'
    NC='\033[0m'
    
    log_warning "配置文件不存在，使用默认配置"
fi

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

log_header() {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}  Biubiustar Ultra 快速部署${NC}"
    echo -e "${CYAN}================================${NC}"
}

# 显示帮助信息
show_help() {
    echo "Biubiustar Ultra 快速部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -r, --repo URL       Git 仓库地址"
    echo "  -b, --branch BRANCH  Git 分支"
    echo "  -d, --dir DIR        部署目录"
    echo "  -e, --env ENV        环境 (dev|staging|prod)"
    echo "  -m, --mode MODE      部署模式 (docker|server)"
    echo "  -s, --skip-env       跳过环境变量配置"
    echo "  -h, --help           显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  curl -sSL $QUICK_DEPLOY_SCRIPT_URL | bash"
    echo "  curl -sSL $QUICK_DEPLOY_SCRIPT_URL | bash -s -- -e prod -m docker"
    echo ""
    echo "注意: 此脚本需要 root 权限或 sudo 权限"
}

# 检查系统要求
check_requirements() {
    log_info "检查系统要求..."
    
    # 检查是否为 root 用户
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要 root 权限或 sudo 权限"
        log_info "请使用: sudo $0 [选项] 或 sudo bash <(curl -sSL $QUICK_DEPLOY_SCRIPT_URL) [选项]"
        exit 1
    fi
    
    # 检查网络连接
    if ! ping -c 1 github.com &> /dev/null; then
        log_error "无法连接到 GitHub，请检查网络连接"
        exit 1
    fi
    
    log_success "系统要求检查通过"
}

# 下载部署脚本
download_script() {
    log_info "下载部署脚本..."
    
    # 创建临时目录
    mkdir -p "$TEMP_DIR"
    cd "$TEMP_DIR"
    
    # 下载脚本
    if curl -fsSL "$ONE_CLICK_SCRIPT_URL" -o "one-click-deploy.sh"; then
        log_success "部署脚本下载成功"
    else
        log_error "部署脚本下载失败"
        exit 1
    fi
    
    # 给脚本执行权限
    chmod +x "one-click-deploy.sh"
}

# 执行部署
execute_deployment() {
    log_info "开始执行部署..."
    
    # 执行部署脚本，传递所有参数
    if ./"one-click-deploy.sh" "$@"; then
        log_success "部署执行完成"
    else
        log_error "部署执行失败"
        exit 1
    fi
}

# 清理临时文件
cleanup() {
    log_info "清理临时文件..."
    rm -rf "$TEMP_DIR"
    log_success "清理完成"
}

# 主函数
main() {
    log_header
    
    # 显示帮助信息
    if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
        show_help
        exit 0
    fi
    
    echo ""
    echo "🚀 开始 Biubiustar Ultra 快速部署..."
    echo ""
    echo "📋 部署步骤:"
    echo "  1. 检查系统要求"
    echo "  2. 下载部署脚本"
    echo "  3. 执行部署"
    echo "  4. 清理临时文件"
    echo ""
    
    # 执行部署流程
    check_requirements
    download_script
    execute_deployment "$@"
    cleanup
    
    echo ""
    log_success "🎉 快速部署完成！"
    echo ""
    echo "💡 提示: 如果部署成功，你可以删除此临时脚本"
    echo "📚 更多信息请查看: https://github.com/lyfe2025/biubiustar-ultra"
}

# 错误处理
trap 'log_error "部署过程中发生错误，退出码: $?"; cleanup; exit 1' ERR

# 执行主函数
main "$@"

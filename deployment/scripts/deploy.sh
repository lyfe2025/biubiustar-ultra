#!/bin/bash

# Biubiustar Ultra 部署脚本
# 支持多种部署方式

set -e

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

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# 显示帮助信息
show_help() {
    echo "Biubiustar Ultra 部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -m, --mode MODE     部署模式 (vercel|docker|server)"
    echo "  -e, --env ENV       环境 (dev|staging|prod)"
    echo "  -h, --help          显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 -m docker -e prod    # Docker 生产环境部署"
    echo "  $0 -m vercel -e prod    # Vercel 生产环境部署"
    echo "  $0 -m server -e prod    # 传统服务器生产环境部署"
}

# 默认值
DEPLOY_MODE=""
ENVIRONMENT="prod"

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--mode)
            DEPLOY_MODE="$2"
            shift 2
            ;;
        -e|--env)
            ENVIRONMENT="$2"
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

# 验证参数
if [[ -z "$DEPLOY_MODE" ]]; then
    log_error "请指定部署模式"
    show_help
    exit 1
fi

if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    log_error "无效的环境: $ENVIRONMENT"
    exit 1
fi

# 主部署函数
deploy() {
    case $DEPLOY_MODE in
        "vercel")
            deploy_vercel
            ;;
        "docker")
            deploy_docker
            ;;
        "server")
            deploy_server
            ;;
        *)
            log_error "不支持的部署模式: $DEPLOY_MODE"
            exit 1
            ;;
    esac
}

# Vercel 部署
deploy_vercel() {
    log_info "开始 Vercel 部署..."
    
    check_command "vercel"
    
    # 检查环境变量
    if [[ ! -f ".env" ]]; then
        log_warning ".env 文件不存在，请确保已配置环境变量"
    fi
    
    # 构建项目
    log_info "构建项目..."
    npm run build
    
    # 部署到 Vercel
    log_info "部署到 Vercel..."
    if [[ "$ENVIRONMENT" == "prod" ]]; then
        vercel --prod
    else
        vercel
    fi
    
    log_success "Vercel 部署完成！"
}

# Docker 部署
deploy_docker() {
    log_info "开始 Docker 部署..."
    
    check_command "docker"
    check_command "docker-compose"
    
    # 检查配置文件
    if [[ ! -f "docker-compose.yml" ]]; then
        log_error "docker-compose.yml 文件不存在"
        exit 1
    fi
    
    # 创建必要的目录
    mkdir -p uploads logs nginx/ssl
    
    # 检查 SSL 证书
    if [[ ! -f "nginx/ssl/cert.pem" ]] || [[ ! -f "nginx/ssl/key.pem" ]]; then
        log_warning "SSL 证书不存在，将使用自签名证书进行测试"
        # 生成自签名证书用于测试
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=CN/ST=State/L=City/O=Organization/CN=localhost"
    fi
    
    # 停止现有容器
    log_info "停止现有容器..."
    docker-compose down || true
    
    # 构建并启动容器
    log_info "构建并启动容器..."
    docker-compose up -d --build
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    if docker-compose ps | grep -q "Up"; then
        log_success "Docker 部署完成！"
        log_info "服务状态:"
        docker-compose ps
    else
        log_error "Docker 部署失败"
        docker-compose logs
        exit 1
    fi
}

# 传统服务器部署
deploy_server() {
    log_info "开始传统服务器部署..."
    
    check_command "pm2"
    
    # 检查配置文件
    if [[ ! -f "ecosystem.config.js" ]]; then
        log_error "ecosystem.config.js 文件不存在"
        exit 1
    fi
    
    # 安装依赖
    log_info "安装依赖..."
    npm ci --only=production
    
    # 构建项目
    log_info "构建项目..."
    npm run build
    
    # 创建日志目录
    mkdir -p logs
    
    # 启动 PM2 服务
    log_info "启动 PM2 服务..."
    pm2 start ecosystem.config.js --env $ENVIRONMENT
    
    # 保存 PM2 配置
    pm2 save
    
    # 设置开机自启
    pm2 startup
    
    log_success "传统服务器部署完成！"
    log_info "PM2 状态:"
    pm2 status
}

# 环境检查
check_environment() {
    log_info "检查部署环境..."
    
    # 检查 Node.js 版本
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_info "Node.js 版本: $NODE_VERSION"
    else
        log_warning "Node.js 未安装"
    fi
    
    # 检查 npm 版本
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        log_info "npm 版本: $NPM_VERSION"
    else
        log_warning "npm 未安装"
    fi
    
    # 检查项目文件
    if [[ ! -f "package.json" ]]; then
        log_error "package.json 文件不存在，请在项目根目录运行此脚本"
        exit 1
    fi
    
    log_success "环境检查完成"
}

# 部署后验证
verify_deployment() {
    log_info "验证部署..."
    
    case $DEPLOY_MODE in
        "vercel")
            # Vercel 部署验证
            log_info "请访问 Vercel 提供的 URL 验证部署"
            ;;
        "docker")
            # Docker 部署验证
            if curl -f http://localhost/api/health &> /dev/null; then
                log_success "API 健康检查通过"
            else
                log_warning "API 健康检查失败，请检查服务状态"
            fi
            ;;
        "server")
            # 传统服务器部署验证
            if pm2 list | grep -q "online"; then
                log_success "PM2 服务运行正常"
            else
                log_warning "PM2 服务状态异常"
            fi
            ;;
    esac
}

# 主函数
main() {
    log_info "开始 Biubiustar Ultra 部署..."
    log_info "部署模式: $DEPLOY_MODE"
    log_info "目标环境: $ENVIRONMENT"
    
    # 环境检查
    check_environment
    
    # 执行部署
    deploy
    
    # 部署验证
    verify_deployment
    
    log_success "部署流程完成！"
}

# 错误处理
trap 'log_error "部署过程中发生错误，退出码: $?"' ERR

# 执行主函数
main "$@"

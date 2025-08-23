#!/bin/bash

# Biubiustar Ultra 部署脚本
# 专注于单机服务器部署方案，简化配置

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# 显示帮助信息
show_help() {
    echo "Biubiustar Ultra 单机部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -m, --mode MODE     部署模式 (docker|server)"
    echo "  -e, --env ENV       环境 (dev|staging|prod)"
    echo "  -a, --action ACTION 操作类型 (deploy|update|restart|stop|logs|backup|cleanup)"
    echo "  -h, --help          显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 -m docker -e prod -a deploy     # Docker 生产环境部署"
    echo "  $0 -m server -e prod -a deploy     # 传统服务器生产环境部署"
    echo "  $0 -m docker -a update             # 更新 Docker 服务"
    echo "  $0 -m docker -a backup             # 创建备份"
    echo "  $0 -m docker -a cleanup            # 清理环境"
}

# 默认值
DEPLOY_MODE=""
ENVIRONMENT="prod"
ACTION="deploy"

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
        -a|--action)
            ACTION="$2"
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

if [[ ! "$ACTION" =~ ^(deploy|update|restart|stop|logs|backup|monitor|cleanup)$ ]]; then
    log_error "无效的操作: $ACTION"
    exit 1
fi

# 加载环境变量
if [[ -f ".env" ]]; then
    export $(grep -v '^#' .env | xargs)
fi

# 设置默认值
export APP_PORT=${APP_PORT:-3000}
export NGINX_HTTP_PORT=${NGINX_HTTP_PORT:-80}
export NGINX_HTTPS_PORT=${NGINX_HTTPS_PORT:-443}
export HEALTH_CHECK_PORT=${HEALTH_CHECK_PORT:-3000}
export MEMORY_LIMIT=${MEMORY_LIMIT:-512}
export BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}
export BACKUP_COMPRESSION_LEVEL=${BACKUP_COMPRESSION_LEVEL:-6}
export LOG_MAX_SIZE=${LOG_MAX_SIZE:-10m}
export LOG_MAX_FILES=${LOG_MAX_FILES:-3}

# 主部署函数
deploy() {
    case $DEPLOY_MODE in
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

# Docker 部署
deploy_docker() {
    case $ACTION in
        "deploy")
            deploy_docker_full
            ;;
        "update")
            update_docker
            ;;
        "restart")
            restart_docker
            ;;
        "stop")
            stop_docker
            ;;
        "logs")
            show_docker_logs
            ;;
        "backup")
            create_backup
            ;;
        "monitor")
            show_docker_status
            ;;
        "cleanup")
            cleanup_docker
            ;;
        *)
            log_error "不支持的 Docker 操作: $ACTION"
            exit 1
            ;;
    esac
}

# 完整 Docker 部署
deploy_docker_full() {
    log_step "开始 Docker 完整部署..."
    
    check_command "docker"
    check_command "docker-compose"
    
    # 检查配置文件
    if [[ ! -f "docker-compose.yml" ]]; then
        log_error "docker-compose.yml 文件不存在"
        exit 1
    fi
    
    # 创建必要的目录
    log_info "创建必要的目录..."
    mkdir -p uploads logs backups nginx/ssl
    
    # 设置目录权限
    chmod 755 uploads logs backups
    chmod 700 nginx/ssl
    
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
    
    # 清理旧镜像和容器
    log_info "清理旧镜像和容器..."
    docker system prune -f
    
    # 构建并启动容器
    log_info "构建并启动容器..."
    docker-compose up -d --build
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 15
    
    # 检查服务状态
    if docker-compose ps | grep -q "Up"; then
        log_success "Docker 部署完成！"
        log_info "服务状态:"
        docker-compose ps
        
        # 显示访问信息
        log_info "服务访问信息:"
        log_info "  - 应用: http://localhost:${NGINX_HTTP_PORT}"
        log_info "  - API: http://localhost:${NGINX_HTTP_PORT}/api"
        log_info "  - 健康检查: http://localhost:${NGINX_HTTP_PORT}/health"
        log_info "  - 上传文件: http://localhost:${NGINX_HTTP_PORT}/uploads/"
        
        # 显示配置信息
        log_info "配置信息:"
        log_info "  - 应用端口: ${APP_PORT}"
        log_info "  - Nginx HTTP 端口: ${NGINX_HTTP_PORT}"
        log_info "  - 内存限制: ${MEMORY_LIMIT}MB"
    else
        log_error "Docker 部署失败"
        docker-compose logs
        exit 1
    fi
}

# 更新 Docker 服务
update_docker() {
    log_step "更新 Docker 服务..."
    
    # 拉取最新代码
    log_info "拉取最新代码..."
    git pull origin main
    
    # 重新构建并启动
    log_info "重新构建并启动服务..."
    docker-compose down
    docker-compose up -d --build
    
    log_success "Docker 服务更新完成！"
}

# 重启 Docker 服务
restart_docker() {
    log_step "重启 Docker 服务..."
    
    docker-compose restart
    log_success "Docker 服务重启完成！"
}

# 停止 Docker 服务
stop_docker() {
    log_step "停止 Docker 服务..."
    
    docker-compose down
    log_success "Docker 服务已停止！"
}

# 显示 Docker 日志
show_docker_logs() {
    log_step "显示 Docker 日志..."
    
    if [[ -n "$2" ]]; then
        docker-compose logs -f $2
    else
        docker-compose logs -f
    fi
}

# 创建备份
create_backup() {
    log_step "创建备份..."
    
    BACKUP_DIR="backups"
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    # 创建备份目录
    mkdir -p $BACKUP_DIR
    
    # 备份数据
    log_info "备份上传文件..."
    tar -czf "$BACKUP_DIR/uploads-$BACKUP_NAME" uploads/
    
    log_info "备份日志文件..."
    tar -czf "$BACKUP_DIR/logs-$BACKUP_NAME" logs/
    
    # 清理旧备份
    find $BACKUP_DIR -name "*-*.tar.gz" -mtime +${BACKUP_RETENTION_DAYS} -delete
    
    log_success "备份创建完成！"
    log_info "备份文件:"
    ls -lh $BACKUP_DIR/*.tar.gz
}

# 显示 Docker 状态
show_docker_status() {
    log_step "Docker 服务状态..."
    
    echo "=== 容器状态 ==="
    docker-compose ps
    
    echo -e "\n=== 资源使用 ==="
    docker stats --no-stream
    
    echo -e "\n=== 磁盘使用 ==="
    docker system df
    
    echo -e "\n=== 文件统计 ==="
    echo "上传目录大小: $(du -sh uploads/ 2>/dev/null || echo 'N/A')"
    echo "日志目录大小: $(du -sh logs/ 2>/dev/null || echo 'N/A')"
}

# 清理 Docker 环境
cleanup_docker() {
    log_step "清理 Docker 环境..."
    
    # 清理日志文件
    log_info "清理日志文件..."
    find logs/ -type f -mtime +30 -delete 2>/dev/null || true
    
    # 清理 Docker 系统
    log_info "清理 Docker 系统..."
    docker system prune -f
    
    # 清理未使用的镜像
    docker image prune -f
    
    # 清理未使用的卷
    docker volume prune -f
    
    log_success "清理完成！"
    
    # 显示清理后的状态
    show_docker_status
}

# 传统服务器部署
deploy_server() {
    log_step "开始传统服务器部署..."
    
    check_command "pm2"
    
    # 检查配置文件
    if [[ ! -f "ecosystem.config.js" ]]; then
        log_error "ecosystem.config.js 文件不存在"
        exit 1
    fi
    
    case $ACTION in
        "deploy")
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
            ;;
        "update")
            log_info "更新服务..."
            git pull origin main
            npm ci --only=production
            npm run build
            pm2 reload ecosystem.config.js --env $ENVIRONMENT
            log_success "服务更新完成！"
            ;;
        "restart")
            log_info "重启服务..."
            pm2 restart all
            log_success "服务重启完成！"
            ;;
        "stop")
            log_info "停止服务..."
            pm2 stop all
            log_success "服务已停止！"
            ;;
        "logs")
            log_info "显示日志..."
            pm2 logs
            ;;
        "cleanup")
            log_info "清理服务环境..."
            # 清理日志文件
            find logs/ -type f -mtime +30 -delete 2>/dev/null || true
            log_success "清理完成！"
            ;;
        *)
            log_error "不支持的服务器操作: $ACTION"
            exit 1
            ;;
    esac
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
    
    # 检查磁盘空间
    DISK_SPACE=$(df -h . | awk 'NR==2 {print $4}')
    log_info "可用磁盘空间: $DISK_SPACE"
    
    # 显示环境变量配置
    log_info "环境变量配置:"
    log_info "  - 应用端口: ${APP_PORT}"
    log_info "  - Nginx HTTP 端口: ${NGINX_HTTP_PORT}"
    log_info "  - Nginx HTTPS 端口: ${NGINX_HTTPS_PORT}"
    log_info "  - 内存限制: ${MEMORY_LIMIT}MB"
    
    log_success "环境检查完成"
}

# 部署后验证
verify_deployment() {
    log_info "验证部署..."
    
    case $DEPLOY_MODE in
        "docker")
            # Docker 部署验证
            if curl -f http://localhost:${NGINX_HTTP_PORT}/health &> /dev/null; then
                log_success "API 健康检查通过"
            else
                log_warning "API 健康检查失败，请检查服务状态"
            fi
            
            # 检查容器状态
            if docker-compose ps | grep -q "Up"; then
                log_success "所有容器运行正常"
            else
                log_warning "部分容器状态异常"
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
    log_info "开始 Biubiustar Ultra 单机部署..."
    log_info "部署模式: $DEPLOY_MODE"
    log_info "目标环境: $ENVIRONMENT"
    log_info "操作类型: $ACTION"
    
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

#!/bin/bash

# ========================================
# BiubiuStar Ultra - 一键部署脚本
# ========================================
# 功能：自动部署BiubiuStar Ultra项目
# 流程：环境检查 -> 项目克隆 -> 配置生成 -> 服务启动 -> 健康检查
# 作者：BiubiuStar Ultra Team
# ========================================

# 脚本配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="biubiustar-ultra"
GITHUB_REPO="https://github.com/lyfe2025/biubiustar-ultra"
DEPLOY_DIR="$HOME/biubiustar-deploy"
PROJECT_DIR="$DEPLOY_DIR/$PROJECT_NAME"

# 命令行参数
USE_LOCAL=false
SKIP_BUILD=false
SKIP_HEALTH_CHECK=false

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

log_highlight() {
    echo -e "${CYAN}[HIGHLIGHT]${NC} $1"
}

# 显示横幅
show_banner() {
    echo ""
    echo "========================================"
    echo "    BiubiuStar Ultra 一键部署脚本"
    echo "========================================"
    echo "项目地址: $GITHUB_REPO"
    echo "部署目录: $DEPLOY_DIR"
    echo "========================================"
    echo ""
}

# 检查是否以root用户运行
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_warning "检测到以root用户运行，建议使用普通用户"
        read -p "是否继续? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "部署已取消"
            exit 0
        fi
    fi
}

# 步骤1: 环境检查
step_check_environment() {
    log_step "步骤1: 环境检查"
    
    # 检查环境检查脚本是否存在
    if [[ -f "$SCRIPT_DIR/check-env.sh" ]]; then
        log_info "运行环境检查脚本..."
        chmod +x "$SCRIPT_DIR/check-env.sh"
        bash "$SCRIPT_DIR/check-env.sh"
        
        if [ $? -ne 0 ]; then
            log_error "环境检查失败，请解决环境问题后重试"
            exit 1
        fi
    else
        log_warning "环境检查脚本不存在，跳过自动环境检查"
        
        # 手动检查关键依赖
        log_info "手动检查关键依赖..."
        
        if ! command -v git &> /dev/null; then
            log_error "Git未安装，请先安装Git"
            exit 1
        fi
        
        if ! command -v node &> /dev/null; then
            log_error "Node.js未安装，请先安装Node.js (>= 18.x)"
            exit 1
        fi
        
        if ! command -v npm &> /dev/null; then
            log_error "npm未安装，请先安装npm"
            exit 1
        fi
        
        log_success "基本依赖检查通过"
    fi
    
    echo ""
}

# 步骤2: 项目克隆
step_clone_project() {
    log_step "步骤2: 项目克隆"
    
    # 创建部署目录
    if [[ ! -d "$DEPLOY_DIR" ]]; then
        log_info "创建部署目录: $DEPLOY_DIR"
        mkdir -p "$DEPLOY_DIR"
    fi
    
    # 检查项目是否已存在
    if [[ -d "$PROJECT_DIR" ]]; then
        log_warning "项目目录已存在: $PROJECT_DIR"
        read -p "是否删除现有项目并重新克隆? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log_info "删除现有项目目录..."
            rm -rf "$PROJECT_DIR"
        else
            log_info "使用现有项目目录，跳过克隆步骤"
            return 0
        fi
    fi
    
    # 克隆项目
    log_info "从GitHub克隆项目..."
    log_info "仓库地址: $GITHUB_REPO"
    
    cd "$DEPLOY_DIR"
    git clone "$GITHUB_REPO" "$PROJECT_NAME"
    
    if [ $? -ne 0 ]; then
        log_error "项目克隆失败，请检查网络连接和仓库地址"
        exit 1
    fi
    
    log_success "项目克隆成功"
    echo ""
}

# 步骤3: 配置生成
step_generate_config() {
    log_step "步骤3: 配置生成"
    
    cd "$PROJECT_DIR"
    
    # 检查是否存在.env文件
    if [[ -f ".env" ]]; then
        log_info "发现现有.env配置文件"
        read -p "是否使用现有配置? (Y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            log_info "备份现有配置文件..."
            cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
        else
            log_success "使用现有配置文件"
            return 0
        fi
    fi
    
    # 检查是否存在配置模板
    if [[ -f "$SCRIPT_DIR/env.template" ]]; then
        log_info "使用配置模板生成.env文件..."
        cp "$SCRIPT_DIR/env.template" .env
    elif [[ -f ".env.example" ]]; then
        log_info "使用项目示例配置生成.env文件..."
        cp .env.example .env
    else
        log_warning "未找到配置模板，创建基本配置文件..."
        cat > .env << EOF
# BiubiuStar Ultra 基本配置
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://localhost:5173

# Supabase 配置 (请填写实际值)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 前端 Supabase 配置
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 缓存配置
ENABLE_CACHE=true
CACHE_USER_TTL=300000
CACHE_CONTENT_TTL=120000

# 安全配置
SESSION_SECRET=your-random-session-secret-here
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
UPLOAD_MAX_SIZE=52428800

# 日志配置
LOG_LEVEL=info
EOF
    fi
    
    # 提示用户配置
    log_warning "请根据需要修改.env配置文件"
    log_info "重要配置项:"
    echo "  - SUPABASE_URL: Supabase项目URL"
    echo "  - SUPABASE_ANON_KEY: Supabase匿名密钥"
    echo "  - SUPABASE_SERVICE_ROLE_KEY: Supabase服务角色密钥"
    echo "  - JWT_SECRET: JWT密钥 (生产环境必须修改)"
    echo "  - SESSION_SECRET: 会话密钥 (生产环境必须修改)"
    echo ""
    
    read -p "是否现在编辑配置文件? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command -v nano &> /dev/null; then
            nano .env
        elif command -v vim &> /dev/null; then
            vim .env
        elif command -v vi &> /dev/null; then
            vi .env
        else
            log_warning "未找到文本编辑器，请手动编辑.env文件"
        fi
    fi
    
    log_success "配置文件生成完成"
    echo ""
}

# 步骤4: 依赖安装
step_install_dependencies() {
    log_step "步骤4: 依赖安装"
    
    cd "$PROJECT_DIR"
    
    # 检查包管理器
    if command -v pnpm &> /dev/null && [[ -f "pnpm-lock.yaml" ]]; then
        log_info "使用pnpm安装依赖..."
        pnpm install
    elif [[ -f "package-lock.json" ]]; then
        log_info "使用npm安装依赖..."
        npm install
    else
        log_info "使用npm安装依赖..."
        npm install
    fi
    
    if [ $? -ne 0 ]; then
        log_error "依赖安装失败"
        exit 1
    fi
    
    log_success "依赖安装完成"
    echo ""
}

# 步骤5: 构建项目
step_build_project() {
    log_step "步骤5: 构建项目"
    
    cd "$PROJECT_DIR"
    
    # 检查是否有构建脚本
    if grep -q '"build"' package.json; then
        log_info "构建项目..."
        
        if command -v pnpm &> /dev/null && [[ -f "pnpm-lock.yaml" ]]; then
            pnpm run build
        else
            npm run build
        fi
        
        if [ $? -ne 0 ]; then
            log_error "项目构建失败"
            exit 1
        fi
        
        log_success "项目构建完成"
    else
        log_info "未找到构建脚本，跳过构建步骤"
    fi
    
    echo ""
}

# 步骤6: 服务启动
step_start_services() {
    log_step "步骤6: 服务启动"
    
    cd "$PROJECT_DIR"
    
    # 检查是否存在project.sh脚本
    if [[ -f "project.sh" ]]; then
        log_info "发现project.sh脚本，使用项目管理脚本启动服务..."
        chmod +x project.sh
        
        # 使用project.sh启动项目
        ./project.sh start  # 直接启动项目
        
        if [ $? -eq 0 ]; then
            log_success "服务启动成功"
        else
            log_warning "使用project.sh启动失败，尝试直接启动..."
            step_start_services_direct
        fi
    else
        log_info "未找到project.sh脚本，直接启动服务..."
        step_start_services_direct
    fi
    
    echo ""
}

# 直接启动服务
step_start_services_direct() {
    log_info "直接启动服务..."
    
    # 检查包管理器和启动脚本
    if command -v pnpm &> /dev/null && [[ -f "pnpm-lock.yaml" ]]; then
        if grep -q '"dev"' package.json; then
            log_info "使用pnpm启动开发服务器..."
            pnpm run dev &
        elif grep -q '"start"' package.json; then
            log_info "使用pnpm启动生产服务器..."
            pnpm run start &
        fi
    else
        if grep -q '"dev"' package.json; then
            log_info "使用npm启动开发服务器..."
            npm run dev &
        elif grep -q '"start"' package.json; then
            log_info "使用npm启动生产服务器..."
            npm run start &
        fi
    fi
    
    # 等待服务启动
    sleep 5
    log_success "服务启动完成"
}

# 步骤7: 健康检查
step_health_check() {
    log_step "步骤7: 健康检查"
    
    # 检查健康检查脚本是否存在
    if [[ -f "$SCRIPT_DIR/health-check.sh" ]]; then
        log_info "运行健康检查脚本..."
        chmod +x "$SCRIPT_DIR/health-check.sh"
        bash "$SCRIPT_DIR/health-check.sh" "$PROJECT_DIR"
    else
        log_info "执行基本健康检查..."
        
        # 基本端口检查
        FRONTEND_PORT=5173
        BACKEND_PORT=3001
        
        # 检查前端端口
        if netstat -tuln 2>/dev/null | grep -q ":$FRONTEND_PORT " || ss -tuln 2>/dev/null | grep -q ":$FRONTEND_PORT "; then
            log_success "前端服务运行正常 (端口: $FRONTEND_PORT)"
        else
            log_warning "前端服务可能未启动 (端口: $FRONTEND_PORT)"
        fi
        
        # 检查后端端口
        if netstat -tuln 2>/dev/null | grep -q ":$BACKEND_PORT " || ss -tuln 2>/dev/null | grep -q ":$BACKEND_PORT "; then
            log_success "后端服务运行正常 (端口: $BACKEND_PORT)"
        else
            log_warning "后端服务可能未启动 (端口: $BACKEND_PORT)"
        fi
    fi
    
    echo ""
}

# 步骤8: 显示访问地址
step_show_access_info() {
    log_step "步骤8: 访问地址"
    
    # 获取本机IP地址
    LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
    
    echo "========================================"
    log_highlight "BiubiuStar Ultra 部署完成！"
    echo "========================================"
    echo ""
    echo "📱 前端访问地址:"
    echo "   本地访问: http://localhost:5173"
    if [[ -n "$LOCAL_IP" ]]; then
        echo "   局域网访问: http://$LOCAL_IP:5173"
    fi
    echo ""
    echo "🔧 后端API地址:"
    echo "   本地访问: http://localhost:3001"
    if [[ -n "$LOCAL_IP" ]]; then
        echo "   局域网访问: http://$LOCAL_IP:3001"
    fi
    echo ""
    echo "📁 项目目录: $PROJECT_DIR"
    echo "📝 配置文件: $PROJECT_DIR/.env"
    echo ""
    echo "🛠️  管理命令:"
    echo "   查看状态: cd $PROJECT_DIR && ./project.sh"
    echo "   停止服务: cd $PROJECT_DIR && ./project.sh (选择停止)"
    echo "   查看日志: cd $PROJECT_DIR && ./project.sh (选择查看日志)"
    echo ""
    echo "========================================"
    
    # 保存部署信息
    cat > "$DEPLOY_DIR/deployment-info.txt" << EOF
BiubiuStar Ultra 部署信息
部署时间: $(date)
项目目录: $PROJECT_DIR
前端地址: http://localhost:5173
后端地址: http://localhost:3001
EOF
    
    log_success "部署信息已保存到: $DEPLOY_DIR/deployment-info.txt"
    echo ""
}

# 清理函数
cleanup() {
    log_info "清理临时文件..."
    # 这里可以添加清理逻辑
}

# 错误处理
error_handler() {
    log_error "部署过程中发生错误，正在清理..."
    cleanup
    exit 1
}

# 显示帮助信息
show_help() {
    echo "BiubiuStar Ultra 一键部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --local              使用当前目录进行本地部署测试（跳过克隆步骤）"
    echo "  --skip-build         跳过项目构建步骤"
    echo "  --skip-health-check  跳过健康检查步骤"
    echo "  --help, -h           显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                   # 标准部署流程"
    echo "  $0 --local           # 本地测试部署"
    echo "  $0 --skip-build      # 跳过构建步骤"
    echo ""
    echo "项目地址: $GITHUB_REPO"
    echo ""
}

# 解析命令行参数
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --local)
                USE_LOCAL=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --skip-health-check)
                SKIP_HEALTH_CHECK=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# 设置错误处理
trap error_handler ERR

# 主函数
main() {
    # 解析命令行参数
    parse_args "$@"
    
    # 如果使用本地模式，设置项目目录为当前目录的父目录
    if [[ "$USE_LOCAL" == "true" ]]; then
        PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
        log_info "使用本地模式，项目目录: $PROJECT_DIR"
    fi
    
    # 显示横幅
    show_banner
    
    # 检查root用户
    check_root
    
    # 确认部署
    if [[ "$USE_LOCAL" == "true" ]]; then
        read -p "是否开始本地部署测试? (Y/n): " -n 1 -r
    else
        read -p "是否开始部署BiubiuStar Ultra? (Y/n): " -n 1 -r
    fi
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        log_info "部署已取消"
        exit 0
    fi
    
    echo ""
    log_info "开始部署流程..."
    echo ""
    
    # 执行部署步骤
    step_check_environment
    
    if [[ "$USE_LOCAL" != "true" ]]; then
        step_clone_project
    else
        log_step "步骤2: 项目克隆 (跳过 - 使用本地代码)"
        log_info "使用本地项目目录: $PROJECT_DIR"
        echo ""
    fi
    
    step_generate_config
    step_install_dependencies
    
    if [[ "$SKIP_BUILD" != "true" ]]; then
        step_build_project
    else
        log_step "步骤5: 项目构建 (跳过)"
        log_info "已跳过项目构建步骤"
        echo ""
    fi
    
    step_start_services
    
    if [[ "$SKIP_HEALTH_CHECK" != "true" ]]; then
        step_health_check
    else
        log_step "步骤7: 健康检查 (跳过)"
        log_info "已跳过健康检查步骤"
        echo ""
    fi
    
    step_show_access_info
    
    log_success "🎉 BiubiuStar Ultra 部署完成！"
}

# 运行主函数
main "$@"
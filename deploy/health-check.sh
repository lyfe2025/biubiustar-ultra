#!/bin/bash

# ========================================
# BiubiuStar Ultra - 健康检查脚本
# ========================================
# 功能：验证所有服务运行状态和连通性
# 参数：$1 - 项目目录路径 (可选)
# 作者：BiubiuStar Ultra Team
# ========================================

# 默认配置
PROJECT_DIR="$(pwd)"
FRONTEND_PORT=5173
BACKEND_PORT=3001
HEALTH_CHECK_TIMEOUT=30
RETRY_COUNT=3
RETRY_DELAY=5
GENERATE_REPORT=false
CONTINUOUS_MODE=false

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --project-dir)
            PROJECT_DIR="$2"
            shift 2
            ;;
        --timeout)
            HEALTH_CHECK_TIMEOUT="$2"
            shift 2
            ;;
        --report)
            GENERATE_REPORT=true
            shift
            ;;
        --continuous)
            CONTINUOUS_MODE=true
            shift
            ;;
        --help)
            echo "用法: $0 [选项]"
            echo "选项:"
            echo "  --project-dir DIR    指定项目目录 (默认: 当前目录)"
            echo "  --timeout SECONDS    设置检查超时时间 (默认: 30)"
            echo "  --report             生成详细报告"
            echo "  --continuous         持续监控模式"
            echo "  --help               显示帮助信息"
            exit 0
            ;;
        *)
            echo "未知参数: $1"
            echo "使用 --help 查看帮助信息"
            exit 1
            ;;
    esac
done

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

log_check() {
    echo -e "${CYAN}[CHECK]${NC} $1"
}

# 从.env文件读取配置
load_env_config() {
    if [[ -f "$PROJECT_DIR/.env" ]]; then
        log_info "加载环境配置..."
        
        # 读取端口配置
        if grep -q "^PORT=" "$PROJECT_DIR/.env"; then
            BACKEND_PORT=$(grep "^PORT=" "$PROJECT_DIR/.env" | cut -d'=' -f2 | cut -d'#' -f1 | tr -d '[:space:]')
        fi
        
        # 读取前端URL配置
        if grep -q "^FRONTEND_URL=" "$PROJECT_DIR/.env"; then
            FRONTEND_URL=$(grep "^FRONTEND_URL=" "$PROJECT_DIR/.env" | cut -d'=' -f2 | tr -d '[:space:]')
            # 从URL中提取端口
            if [[ $FRONTEND_URL =~ :([0-9]+) ]]; then
                FRONTEND_PORT=${BASH_REMATCH[1]}
            fi
        fi
        
        log_success "配置加载完成 (前端端口: $FRONTEND_PORT, 后端端口: $BACKEND_PORT)"
    else
        log_warning "未找到.env文件，使用默认配置"
    fi
}

# 检查端口是否被占用
check_port() {
    local port=$1
    local service_name=$2
    
    log_check "检查${service_name}端口 $port..."
    
    # 使用多种方法检查端口
    if command -v netstat &> /dev/null; then
        if netstat -tuln 2>/dev/null | grep -q ":$port "; then
            log_success "${service_name}端口 $port 正在监听"
            return 0
        fi
    elif command -v ss &> /dev/null; then
        if ss -tuln 2>/dev/null | grep -q ":$port "; then
            log_success "${service_name}端口 $port 正在监听"
            return 0
        fi
    elif command -v lsof &> /dev/null; then
        if lsof -i :$port &> /dev/null; then
            log_success "${service_name}端口 $port 正在监听"
            return 0
        fi
    fi
    
    log_error "${service_name}端口 $port 未在监听"
    return 1
}

# 检查HTTP服务响应
check_http_service() {
    local url=$1
    local service_name=$2
    local timeout=${3:-10}
    
    log_check "检查${service_name}HTTP响应: $url"
    
    for i in $(seq 1 $RETRY_COUNT); do
        if command -v curl &> /dev/null; then
            if curl -s --max-time $timeout --connect-timeout 5 "$url" > /dev/null 2>&1; then
                log_success "${service_name}HTTP服务响应正常"
                return 0
            fi
        elif command -v wget &> /dev/null; then
            if wget -q --timeout=$timeout --tries=1 "$url" -O /dev/null 2>/dev/null; then
                log_success "${service_name}HTTP服务响应正常"
                return 0
            fi
        else
            log_warning "未找到curl或wget，跳过HTTP响应检查"
            return 0
        fi
        
        if [ $i -lt $RETRY_COUNT ]; then
            log_warning "${service_name}HTTP服务第 $i 次检查失败，${RETRY_DELAY}秒后重试..."
            sleep $RETRY_DELAY
        fi
    done
    
    log_error "${service_name}HTTP服务无响应"
    return 1
}

# 检查API端点
check_api_endpoints() {
    local base_url="http://localhost:$BACKEND_PORT"
    
    log_check "检查API端点..."
    
    # 常见的API端点
    local endpoints=(
        "/api/health"
        "/api/status"
        "/health"
        "/status"
        "/"
    )
    
    local success_count=0
    
    for endpoint in "${endpoints[@]}"; do
        local url="$base_url$endpoint"
        
        if command -v curl &> /dev/null; then
            local response=$(curl -s --max-time 5 --connect-timeout 3 "$url" 2>/dev/null)
            local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 --connect-timeout 3 "$url" 2>/dev/null)
            
            if [[ $status_code =~ ^[2-3][0-9][0-9]$ ]]; then
                log_success "API端点 $endpoint 响应正常 (状态码: $status_code)"
                ((success_count++))
            else
                log_warning "API端点 $endpoint 响应异常 (状态码: $status_code)"
            fi
        fi
    done
    
    if [ $success_count -gt 0 ]; then
        log_success "API端点检查完成 ($success_count/${#endpoints[@]} 个端点正常)"
        return 0
    else
        log_error "所有API端点检查失败"
        return 1
    fi
}

# 检查进程状态
check_processes() {
    log_check "检查相关进程..."
    
    local node_processes=$(ps aux | grep -E "node|npm|pnpm" | grep -v grep | wc -l)
    
    if [ $node_processes -gt 0 ]; then
        log_success "发现 $node_processes 个Node.js相关进程"
        
        # 显示进程详情
        log_info "进程详情:"
        ps aux | grep -E "node|npm|pnpm" | grep -v grep | while read line; do
            echo "  $line"
        done
        
        return 0
    else
        log_error "未发现Node.js相关进程"
        return 1
    fi
}

# 检查磁盘空间
check_disk_space() {
    log_check "检查磁盘空间..."
    
    local disk_usage=$(df "$PROJECT_DIR" | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ $disk_usage -lt 90 ]; then
        log_success "磁盘空间充足 (已使用: ${disk_usage}%)"
        return 0
    elif [ $disk_usage -lt 95 ]; then
        log_warning "磁盘空间不足 (已使用: ${disk_usage}%)"
        return 0
    else
        log_error "磁盘空间严重不足 (已使用: ${disk_usage}%)"
        return 1
    fi
}

# 检查内存使用
check_memory_usage() {
    log_check "检查内存使用..."
    
    if command -v free &> /dev/null; then
        local mem_info=$(free -m | grep '^Mem:')
        local total_mem=$(echo $mem_info | awk '{print $2}')
        local used_mem=$(echo $mem_info | awk '{print $3}')
        local mem_usage=$((used_mem * 100 / total_mem))
        
        if [ $mem_usage -lt 80 ]; then
            log_success "内存使用正常 (已使用: ${mem_usage}%, ${used_mem}MB/${total_mem}MB)"
            return 0
        elif [ $mem_usage -lt 90 ]; then
            log_warning "内存使用较高 (已使用: ${mem_usage}%, ${used_mem}MB/${total_mem}MB)"
            return 0
        else
            log_error "内存使用过高 (已使用: ${mem_usage}%, ${used_mem}MB/${total_mem}MB)"
            return 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS内存检查
        local mem_pressure=$(memory_pressure | grep "System-wide memory free percentage" | awk '{print $5}' | sed 's/%//')
        if [ -n "$mem_pressure" ] && [ $mem_pressure -gt 20 ]; then
            log_success "内存使用正常 (可用: ${mem_pressure}%)"
            return 0
        else
            log_warning "内存使用较高"
            return 0
        fi
    else
        log_warning "无法检查内存使用情况"
        return 0
    fi
}

# 检查网络连接
check_network_connectivity() {
    log_check "检查网络连接..."
    
    # 检查本地回环
    if ping -c 1 127.0.0.1 &> /dev/null; then
        log_success "本地回环连接正常"
    else
        log_error "本地回环连接异常"
        return 1
    fi
    
    # 检查外网连接
    if ping -c 1 8.8.8.8 &> /dev/null; then
        log_success "外网连接正常"
    else
        log_warning "外网连接异常，可能影响某些功能"
    fi
    
    return 0
}

# 检查项目文件
check_project_files() {
    log_check "检查项目文件..."
    
    local required_files=(
        "package.json"
        ".env"
    )
    
    local optional_files=(
        "project.sh"
        "README.md"
        "src"
        "api"
    )
    
    # 检查必需文件
    for file in "${required_files[@]}"; do
        if [[ -f "$PROJECT_DIR/$file" ]] || [[ -d "$PROJECT_DIR/$file" ]]; then
            log_success "必需文件存在: $file"
        else
            log_error "必需文件缺失: $file"
            return 1
        fi
    done
    
    # 检查可选文件
    for file in "${optional_files[@]}"; do
        if [[ -f "$PROJECT_DIR/$file" ]] || [[ -d "$PROJECT_DIR/$file" ]]; then
            log_success "可选文件存在: $file"
        else
            log_warning "可选文件缺失: $file"
        fi
    done
    
    return 0
}

# 生成健康检查报告
generate_health_report() {
    local report_file="$PROJECT_DIR/health-check-report.txt"
    
    log_info "生成健康检查报告..."
    
    cat > "$report_file" << EOF
BiubiuStar Ultra 健康检查报告
生成时间: $(date)
项目目录: $PROJECT_DIR

=== 服务状态 ===
前端端口: $FRONTEND_PORT
后端端口: $BACKEND_PORT

=== 系统信息 ===
操作系统: $(uname -s)
系统版本: $(uname -r)
Node.js版本: $(node --version 2>/dev/null || echo '未安装')
npm版本: $(npm --version 2>/dev/null || echo '未安装')

=== 检查结果 ===
EOF
    
    # 添加检查结果到报告
    echo "详细检查结果请查看终端输出" >> "$report_file"
    
    log_success "健康检查报告已生成: $report_file"
}

# 主函数
main() {
    echo ""
    echo "========================================"
    echo "    BiubiuStar Ultra 健康检查"
    echo "========================================"
    echo "项目目录: $PROJECT_DIR"
    echo "========================================"
    echo ""
    
    # 检查项目目录
    if [[ ! -d "$PROJECT_DIR" ]]; then
        log_error "项目目录不存在: $PROJECT_DIR"
        exit 1
    fi
    
    cd "$PROJECT_DIR"
    
    # 加载环境配置
    load_env_config
    
    echo ""
    log_info "开始健康检查..."
    echo ""
    
    # 执行各项检查
    local check_results=()
    
    # 基础检查
    check_project_files && check_results+=("project_files:OK") || check_results+=("project_files:FAIL")
    check_disk_space && check_results+=("disk_space:OK") || check_results+=("disk_space:FAIL")
    check_memory_usage && check_results+=("memory:OK") || check_results+=("memory:FAIL")
    check_network_connectivity && check_results+=("network:OK") || check_results+=("network:FAIL")
    
    # 服务检查
    check_processes && check_results+=("processes:OK") || check_results+=("processes:FAIL")
    check_port $FRONTEND_PORT "前端" && check_results+=("frontend_port:OK") || check_results+=("frontend_port:FAIL")
    check_port $BACKEND_PORT "后端" && check_results+=("backend_port:OK") || check_results+=("backend_port:FAIL")
    
    # HTTP服务检查
    check_http_service "http://localhost:$FRONTEND_PORT" "前端" && check_results+=("frontend_http:OK") || check_results+=("frontend_http:FAIL")
    check_http_service "http://localhost:$BACKEND_PORT" "后端" && check_results+=("backend_http:OK") || check_results+=("backend_http:FAIL")
    
    # API检查
    check_api_endpoints && check_results+=("api_endpoints:OK") || check_results+=("api_endpoints:FAIL")
    
    echo ""
    echo "========================================"
    echo "           健康检查结果汇总"
    echo "========================================"
    
    local total_checks=${#check_results[@]}
    local passed_checks=0
    local failed_checks=0
    
    for result in "${check_results[@]}"; do
        local check_name=$(echo $result | cut -d':' -f1)
        local check_status=$(echo $result | cut -d':' -f2)
        
        if [[ $check_status == "OK" ]]; then
            echo -e "✅ $check_name: ${GREEN}通过${NC}"
            ((passed_checks++))
        else
            echo -e "❌ $check_name: ${RED}失败${NC}"
            ((failed_checks++))
        fi
    done
    
    echo ""
    echo "总检查项: $total_checks"
    echo -e "通过: ${GREEN}$passed_checks${NC}"
    echo -e "失败: ${RED}$failed_checks${NC}"
    
    # 生成报告
    generate_health_report
    
    echo ""
    
    # 返回结果
    if [ $failed_checks -eq 0 ]; then
        log_success "🎉 所有健康检查通过！服务运行正常"
        echo ""
        echo "📱 访问地址:"
        echo "   前端: http://localhost:$FRONTEND_PORT"
        echo "   后端: http://localhost:$BACKEND_PORT"
        exit 0
    elif [ $failed_checks -le 2 ]; then
        log_warning "⚠️  部分检查失败，但核心服务可能正常运行"
        exit 1
    else
        log_error "❌ 多项检查失败，请检查服务状态"
        exit 2
    fi
}

# 运行主函数
main "$@"
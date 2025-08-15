#!/bin/bash

# BiubiuStar Ultra 项目管理脚本
# 提供交互式菜单来管理项目的启动、停止等操作

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 加载 .env 文件中的配置
load_env_config() {
    if [ -f ".env" ]; then
        echo -e "${BLUE}从 .env 文件加载配置...${NC}"
        # 导出 .env 中的变量，忽略注释和空行
        export $(grep -v '^#' .env | grep -v '^$' | xargs)
    else
        echo -e "${YELLOW}未找到 .env 文件，使用默认配置${NC}"
    fi
}

# 加载配置
load_env_config

# 项目配置 - 从环境变量获取，如果不存在则使用默认值
PROJECT_NAME="BiubiuStar Ultra"
CLIENT_PORT=${VITE_PORT:-5173}
SERVER_PORT=${PORT:-3001}
PID_FILE=".project.pid"

# 显示当前配置
show_config() {
    echo -e "${BLUE}当前配置：${NC}"
    echo -e "  前端端口: ${GREEN}$CLIENT_PORT${NC}"
    echo -e "  后端端口: ${GREEN}$SERVER_PORT${NC}"
    echo ""
}

# 检查进程是否运行
check_process_running() {
    if [ -f "$PID_FILE" ]; then
        local pids=$(cat "$PID_FILE")
        for pid in $pids; do
            if ps -p $pid > /dev/null 2>&1; then
                return 0
            fi
        done
    fi
    return 1
}

# 检查端口是否被占用
check_port_in_use() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    fi
    return 1
}

# 获取端口占用的进程信息
get_port_process() {
    local port=$1
    lsof -Pi :$port -sTCP:LISTEN | grep -v PID
}

# 停止项目
stop_project() {
    echo -e "${YELLOW}正在停止项目...${NC}"
    
    # 停止记录的进程
    if [ -f "$PID_FILE" ]; then
        local pids=$(cat "$PID_FILE")
        for pid in $pids; do
            if ps -p $pid > /dev/null 2>&1; then
                echo -e "${BLUE}停止进程 PID: $pid${NC}"
                kill $pid 2>/dev/null
                sleep 1
                # 如果进程仍在运行，强制杀死
                if ps -p $pid > /dev/null 2>&1; then
                    kill -9 $pid 2>/dev/null
                fi
            fi
        done
        rm -f "$PID_FILE"
    fi
    
    # 检查并停止占用端口的进程
    for port in $CLIENT_PORT $SERVER_PORT; do
        if check_port_in_use $port; then
            echo -e "${YELLOW}端口 $port 仍被占用，尝试停止相关进程...${NC}"
            local process_info=$(get_port_process $port)
            if [ ! -z "$process_info" ]; then
                echo "$process_info"
                local pid=$(echo "$process_info" | awk '{print $2}' | head -1)
                if [ ! -z "$pid" ]; then
                    kill $pid 2>/dev/null
                    sleep 1
                    if ps -p $pid > /dev/null 2>&1; then
                        kill -9 $pid 2>/dev/null
                    fi
                fi
            fi
        fi
    done
    
    echo -e "${GREEN}项目已停止${NC}"
}

# 强制停止占用指定端口的进程
force_kill_port() {
    local port=$1
    local service_name=$2
    
    if check_port_in_use $port; then
        echo -e "${YELLOW}端口 $port 被占用，正在停止相关进程...${NC}"
        local process_info=$(get_port_process $port)
        if [ ! -z "$process_info" ]; then
            echo -e "${BLUE}发现占用端口 $port 的进程：${NC}"
            echo "$process_info"
            
            # 获取所有占用该端口的PID
            local pids=$(lsof -ti :$port)
            for pid in $pids; do
                if [ ! -z "$pid" ]; then
                    echo -e "${BLUE}停止进程 PID: $pid ($service_name)${NC}"
                    kill $pid 2>/dev/null
                    sleep 1
                    # 如果进程仍在运行，强制杀死
                    if ps -p $pid > /dev/null 2>&1; then
                        echo -e "${YELLOW}强制终止进程 PID: $pid${NC}"
                        kill -9 $pid 2>/dev/null
                    fi
                fi
            done
            
            # 再次检查端口是否已释放
            sleep 1
            if check_port_in_use $port; then
                echo -e "${RED}警告: 端口 $port 仍被占用${NC}"
                return 1
            else
                echo -e "${GREEN}端口 $port 已释放${NC}"
            fi
        fi
    fi
    return 0
}

# 启动项目
start_project() {
    echo -e "${YELLOW}正在启动项目...${NC}"
    show_config
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}检测到缺少依赖，正在安装...${NC}"
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}依赖安装失败${NC}"
            return 1
        fi
    fi
    
    # 自动处理端口冲突 - 强制停止占用端口的进程
    echo -e "${BLUE}检查并处理端口占用情况...${NC}"
    force_kill_port $CLIENT_PORT "前端服务"
    force_kill_port $SERVER_PORT "后端服务"
    
    # 再次确认端口状态
    local ports_clear=true
    for port in $CLIENT_PORT $SERVER_PORT; do
        if check_port_in_use $port; then
            echo -e "${RED}错误: 端口 $port 仍被占用，无法启动服务${NC}"
            get_port_process $port
            ports_clear=false
        fi
    done
    
    if [ "$ports_clear" = false ]; then
        echo -e "${RED}端口冲突未解决，启动失败${NC}"
        return 1
    fi
    
    # 启动项目
    echo -e "${BLUE}启动前端服务 (端口: $CLIENT_PORT)...${NC}"
    echo -e "${BLUE}启动后端服务 (端口: $SERVER_PORT)...${NC}"
    
    # 设置环境变量并启动服务
    VITE_PORT=$CLIENT_PORT PORT=$SERVER_PORT npm run dev &
    local main_pid=$!
    
    # 等待一下让进程启动
    sleep 5
    
    # 验证服务是否成功启动
    local startup_success=true
    for port in $CLIENT_PORT $SERVER_PORT; do
        if ! check_port_in_use $port; then
            echo -e "${RED}警告: 端口 $port 上的服务可能未成功启动${NC}"
            startup_success=false
        fi
    done
    
    if [ "$startup_success" = true ]; then
        # 获取所有相关进程ID
        local all_pids=$(pgrep -f "vite|nodemon|node.*server|tsx.*api" | tr '\n' ' ')
        echo "$all_pids" > "$PID_FILE"
        
        echo -e "${GREEN}项目启动成功！${NC}"
        echo -e "${BLUE}前端地址: http://localhost:$CLIENT_PORT${NC}"
        echo -e "${BLUE}后端地址: http://localhost:$SERVER_PORT${NC}"
        echo -e "${YELLOW}进程ID已保存到 $PID_FILE${NC}"
    else
        echo -e "${RED}项目启动可能有问题，请检查日志${NC}"
        return 1
    fi
}

# 重启项目
restart_project() {
    echo -e "${YELLOW}正在重启项目...${NC}"
    stop_project
    sleep 2
    start_project
}

# 查看项目状态
show_status() {
    echo -e "${BLUE}=== $PROJECT_NAME 状态 ===${NC}"
    
    # 显示当前配置
    show_config
    
    if check_process_running; then
        echo -e "${GREEN}✓ 项目正在运行${NC}"
        
        # 显示进程信息
        if [ -f "$PID_FILE" ]; then
            echo -e "${BLUE}运行中的进程：${NC}"
            local pids=$(cat "$PID_FILE")
            for pid in $pids; do
                if ps -p $pid > /dev/null 2>&1; then
                    local cmd=$(ps -p $pid -o comm= 2>/dev/null)
                    echo -e "  PID: $pid ($cmd)"
                fi
            done
        fi
        
        # 检查端口状态
        echo -e "${BLUE}端口状态：${NC}"
        local client_name="前端服务"
        local server_name="后端服务"
        
        if check_port_in_use $CLIENT_PORT; then
            echo -e "  ✓ 端口 $CLIENT_PORT ($client_name): ${GREEN}运行中${NC}"
        else
            echo -e "  ✗ 端口 $CLIENT_PORT ($client_name): ${RED}未运行${NC}"
        fi
        
        if check_port_in_use $SERVER_PORT; then
            echo -e "  ✓ 端口 $SERVER_PORT ($server_name): ${GREEN}运行中${NC}"
        else
            echo -e "  ✗ 端口 $SERVER_PORT ($server_name): ${RED}未运行${NC}"
        fi
        
        # 显示访问地址
        echo -e "${BLUE}访问地址：${NC}"
        echo -e "  前端: ${GREEN}http://localhost:$CLIENT_PORT${NC}"
        echo -e "  后端: ${GREEN}http://localhost:$SERVER_PORT${NC}"
    else
        echo -e "${RED}✗ 项目未运行${NC}"
        
        # 即使项目未运行，也检查端口是否被其他进程占用
        echo -e "${BLUE}端口占用检查：${NC}"
        for port in $CLIENT_PORT $SERVER_PORT; do
            if check_port_in_use $port; then
                local service_name="前端服务"
                if [ $port -eq $SERVER_PORT ]; then
                    service_name="后端服务"
                fi
                echo -e "  ⚠️  端口 $port ($service_name): ${YELLOW}被其他进程占用${NC}"
                get_port_process $port | head -1
            else
                echo -e "  ✓ 端口 $port: ${GREEN}可用${NC}"
            fi
        done
    fi
    
    echo ""
}

# 查看日志
show_logs() {
    echo -e "${BLUE}=== 项目日志 ===${NC}"
    echo -e "${YELLOW}提示: 按 Ctrl+C 退出日志查看${NC}"
    echo ""
    
    if check_process_running; then
        # 如果项目正在运行，显示实时日志
        npm run dev
    else
        echo -e "${RED}项目未运行，无法查看实时日志${NC}"
        echo -e "${YELLOW}请先启动项目${NC}"
    fi
}

# 创建 .env 文件
create_env_file() {
    echo -e "${YELLOW}创建 .env 配置文件...${NC}"
    
    if [ -f ".env" ]; then
        echo -e "${YELLOW}.env 文件已存在${NC}"
        read -p "是否覆盖现有的 .env 文件？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}操作已取消${NC}"
            return
        fi
    fi
    
    # 获取用户输入的端口配置
    echo -e "${BLUE}请输入端口配置：${NC}"
    read -p "前端端口 (默认: 5173): " input_client_port
    read -p "后端端口 (默认: 3001): " input_server_port
    
    # 使用默认值如果用户没有输入
    CLIENT_PORT_CONFIG=${input_client_port:-5173}
    SERVER_PORT_CONFIG=${input_server_port:-3001}
    
    # 创建 .env 文件
    cat > .env << EOF
# BiubiuStar Ultra 项目配置

# 前端端口 (Vite 开发服务器)
VITE_PORT=$CLIENT_PORT_CONFIG

# 后端端口 (Express 服务器)
PORT=$SERVER_PORT_CONFIG

# 数据库配置 (请根据实际情况填写)
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_supabase_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 开发环境配置
NODE_ENV=development

# 其他配置
# JWT_SECRET=your_jwt_secret
# SMTP_HOST=your_smtp_host
# SMTP_PORT=587
# SMTP_USER=your_email
# SMTP_PASS=your_password
EOF
    
    echo -e "${GREEN}.env 文件创建成功！${NC}"
    echo -e "${BLUE}配置信息：${NC}"
    echo -e "  前端端口: $CLIENT_PORT_CONFIG"
    echo -e "  后端端口: $SERVER_PORT_CONFIG"
    echo -e "${YELLOW}请根据需要编辑 .env 文件中的其他配置项${NC}"
    
    # 重新加载配置
    load_env_config
}

# 清理项目
clean_project() {
    echo -e "${YELLOW}正在清理项目...${NC}"
    
    # 停止项目
    stop_project
    
    # 清理构建文件
    echo -e "${BLUE}清理构建文件...${NC}"
    rm -rf dist/
    rm -rf .vite/
    
    # 清理依赖（可选）
    read -p "是否清理 node_modules？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}清理依赖文件...${NC}"
        rm -rf node_modules/
        echo -e "${YELLOW}下次启动时将自动重新安装依赖${NC}"
    fi
    
    # 清理PID文件
    rm -f "$PID_FILE"
    
    echo -e "${GREEN}项目清理完成${NC}"
}

# 显示菜单
show_menu() {
    clear
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}    $PROJECT_NAME 管理工具${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    show_status
    echo -e "${YELLOW}请选择操作：${NC}"
    echo "1. 启动项目"
    echo "2. 停止项目"
    echo "3. 重启项目"
    echo "4. 查看状态"
    echo "5. 查看日志"
    echo "6. 创建/编辑 .env 配置"
    echo "7. 清理项目"
    echo "8. 退出"
    echo ""
    echo -n "请输入选项 (1-8): "
}

# 主循环
main() {
    while true; do
        show_menu
        read -r choice
        
        case $choice in
            1)
                echo ""
                if check_process_running; then
                    echo -e "${YELLOW}项目已在运行，是否重启？(y/N): ${NC}"
                    read -n 1 -r
                    echo
                    if [[ $REPLY =~ ^[Yy]$ ]]; then
                        restart_project
                    fi
                else
                    start_project
                fi
                echo ""
                read -p "按回车键继续..."
                ;;
            2)
                echo ""
                stop_project
                echo ""
                read -p "按回车键继续..."
                ;;
            3)
                echo ""
                restart_project
                echo ""
                read -p "按回车键继续..."
                ;;
            4)
                echo ""
                show_status
                read -p "按回车键继续..."
                ;;
            5)
                echo ""
                show_logs
                ;;
            6)
                echo ""
                create_env_file
                echo ""
                read -p "按回车键继续..."
                ;;
            7)
                echo ""
                clean_project
                echo ""
                read -p "按回车键继续..."
                ;;
            8)
                echo -e "${GREEN}再见！${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}无效选项，请重新选择${NC}"
                sleep 1
                ;;
        esac
    done
}

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 请在项目根目录下运行此脚本${NC}"
    exit 1
fi

# 处理命令行参数
case "$1" in
    start)
        start_project
        ;;
    stop)
        stop_project
        ;;
    restart)
        restart_project
        ;;
    status)
        show_status
        ;;
    env)
        create_env_file
        ;;
    clean)
        clean_project
        ;;
    help|--help|-h)
        echo -e "${BLUE}$PROJECT_NAME 管理脚本${NC}"
        echo -e "${YELLOW}用法: $0 [命令]${NC}"
        echo ""
        echo -e "${BLUE}可用命令:${NC}"
        echo "  start      启动项目"
        echo "  stop       停止项目"
        echo "  restart    重启项目"
        echo "  status     查看状态"
        echo "  env        创建/编辑 .env 配置文件"
        echo "  clean      清理项目"
        echo "  help       显示此帮助信息"
        echo ""
        echo -e "${YELLOW}不带参数运行时将显示交互菜单${NC}"
        ;;
    *)
        # 没有参数时显示交互菜单
        main
        ;;
esac
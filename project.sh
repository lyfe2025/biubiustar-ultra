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

# IP黑名单管理
manage_ip_blacklist() {
    echo -e "${BLUE}=== IP黑名单管理 ===${NC}"
    echo ""
    echo -e "${YELLOW}请选择操作：${NC}"
    echo "1. 查看被限制的IP列表"
    echo "2. 解除指定IP限制"
    echo "3. 清理已过期的IP记录"
    echo "4. 检查频率限制状态"
    echo "5. 清除指定IP的频率限制"
    echo "6. 返回主菜单"
    echo ""
    echo -n "请输入选项 (1-6): "
    
    read -r ip_choice
    
    case $ip_choice in
        1)
            show_blocked_ips
            ;;
        2)
            unblock_ip
            ;;
        3)
            cleanup_expired_ips
            ;;
        4)
            check_rate_limit_status
            ;;
        5)
            clear_ip_rate_limit
            ;;
        6)
            return
            ;;
        *)
            echo -e "${RED}无效选项，请重新选择${NC}"
            sleep 1
            manage_ip_blacklist
            ;;
    esac
}

# 查看被限制的IP列表
show_blocked_ips() {
    echo -e "${BLUE}正在获取IP黑名单...${NC}"
    
    # 检查.env文件是否存在
    if [ ! -f ".env" ]; then
        echo -e "${RED}错误: .env文件不存在，请先创建配置文件${NC}"
        read -p "按回车键继续..."
        return
    fi
    
    # 直接通过Node.js连接Supabase查询IP黑名单（过滤已过期记录）
    response=$(node --input-type=module -e "
        import dotenv from 'dotenv';
        import { createClient } from '@supabase/supabase-js';
        
        dotenv.config({ silent: true });
        
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !supabaseServiceKey) {
            console.log(JSON.stringify({ error: 'Supabase配置缺失，请检查.env文件中的SUPABASE_URL和SUPABASE_SERVICE_ROLE_KEY' }));
            process.exit(1);
        }
        
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        (async () => {
            try {
                const currentTime = new Date().toISOString();
                
                // 查询所有IP黑名单记录
                const { data, error } = await supabase
                    .from('ip_blacklist')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50);
                
                if (error) {
                    console.log(JSON.stringify({ error: '查询IP黑名单失败: ' + error.message }));
                    return;
                }
                
                // 过滤掉已过期的记录（blocked_until不为null且小于当前时间）
                const activeBlacklist = (data || []).filter(item => {
                    if (!item.blocked_until) {
                        // 永久封禁
                        return true;
                    }
                    // 检查是否已过期
                    return new Date(item.blocked_until) > new Date(currentTime);
                });
                
                console.log(JSON.stringify({ success: true, data: activeBlacklist }));
            } catch (err) {
                console.log(JSON.stringify({ error: '数据库连接失败: ' + err.message }));
            }
        })();
    " 2>&1 | grep '^{')
    
    if [ $? -ne 0 ] || [ -z "$response" ]; then
        echo -e "${RED}错误: 无法查询IP黑名单，请检查Node.js环境和依赖${NC}"
        read -p "按回车键继续..."
        return
    fi
    
    # 检查响应是否包含错误
    if echo "$response" | grep -q '"error"'; then
        error_msg=$(echo "$response" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
        echo -e "${RED}查询失败: $error_msg${NC}"
        read -p "按回车键继续..."
        return
    fi
    
    # 解析并显示IP黑名单
    echo -e "${GREEN}当前被限制的IP列表：${NC}"
    echo -e "${BLUE}================================================${NC}"
    
    # 使用node来解析JSON并格式化输出
    node -e "
        try {
            const result = JSON.parse(process.argv[1]);
            if (result.data && result.data.length > 0) {
                result.data.forEach((item, index) => {
                    console.log(\`\${index + 1}. IP地址: \${item.ip_address}\`);
                    console.log(\`   封禁原因: \${item.reason || '未知'}\`);
                    console.log(\`   封禁时间: \${new Date(item.created_at).toLocaleString('zh-CN')}\`);
                    if (item.blocked_until) {
                        console.log(\`   解封时间: \${new Date(item.blocked_until).toLocaleString('zh-CN')}\`);
                    } else {
                        console.log(\`   解封时间: 永久封禁\`);
                    }
                    console.log('   ----------------------------------------');
                });
                console.log(\`\n总计: \${result.data.length} 个被限制的IP\`);
            } else {
                console.log('暂无被限制的IP地址');
            }
        } catch (e) {
            console.log('解析数据失败:', e.message);
        }
    " "$response" 2>/dev/null
    
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}数据解析失败，显示原始响应：${NC}"
        echo "$response"
    fi
    
    echo ""
    read -p "按回车键继续..."
    manage_ip_blacklist
}

# 解除指定IP限制
unblock_ip() {
    echo -e "${BLUE}解除IP限制${NC}"
    echo ""
    
    # 检查.env文件是否存在
    if [ ! -f ".env" ]; then
        echo -e "${RED}错误: .env文件不存在，请先创建配置文件${NC}"
        read -p "按回车键继续..."
        manage_ip_blacklist
        return
    fi
    
    # 首先显示当前被限制的IP列表供参考（过滤已过期记录）
    echo -e "${YELLOW}当前被限制的IP列表：${NC}"
    list_response=$(node --input-type=module -e "
        import dotenv from 'dotenv';
        import { createClient } from '@supabase/supabase-js';
        
        dotenv.config();
        
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !supabaseServiceKey) {
            console.log('配置缺失');
            process.exit(1);
        }
        
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        (async () => {
            try {
                const currentTime = new Date().toISOString();
                
                const { data, error } = await supabase
                    .from('ip_blacklist')
                    .select('ip_address, reason, blocked_until')
                    .order('created_at', { ascending: false })
                    .limit(20);
                
                if (error) {
                    console.log('查询失败');
                    return;
                }
                
                if (data && data.length > 0) {
                    // 过滤掉已过期的记录
                    const activeBlacklist = data.filter(item => {
                        if (!item.blocked_until) {
                            return true; // 永久封禁
                        }
                        return new Date(item.blocked_until) > new Date(currentTime);
                    });
                    
                    if (activeBlacklist.length > 0) {
                        activeBlacklist.slice(0, 10).forEach((item, index) => {
                            console.log(\`\${index + 1}. \${item.ip_address} (\${item.reason || '未知原因'})\`);
                        });
                    } else {
                        console.log('暂无被限制的IP地址');
                    }
                } else {
                    console.log('暂无被限制的IP地址');
                }
            } catch (err) {
                console.log('无法显示IP列表');
            }
        })();
    " 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}无法获取IP列表，请手动输入要解除限制的IP地址${NC}"
    fi
    
    echo ""
    echo -n "请输入要解除限制的IP地址 (或输入 'back' 返回): "
    read -r target_ip
    
    if [ "$target_ip" = "back" ] || [ -z "$target_ip" ]; then
        manage_ip_blacklist
        return
    fi
    
    # 验证IP地址格式（简单验证）
    if ! echo "$target_ip" | grep -E '^([0-9]{1,3}\.){3}[0-9]{1,3}$|^::1$|^[0-9a-fA-F:]+$' > /dev/null; then
        echo -e "${RED}错误: IP地址格式不正确${NC}"
        read -p "按回车键重试..."
        unblock_ip
        return
    fi
    
    echo -e "${YELLOW}正在解除IP $target_ip 的限制...${NC}"
    
    # 直接通过Node.js连接Supabase删除IP黑名单记录
    unblock_response=$(node --input-type=module -e "
        import dotenv from 'dotenv';
        import { createClient } from '@supabase/supabase-js';
        
        dotenv.config({ silent: true });
        
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !supabaseServiceKey) {
            console.log(JSON.stringify({ error: 'Supabase配置缺失' }));
            process.exit(1);
        }
        
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const targetIp = process.argv[1];
        
        (async () => {
            try {
                // 首先检查IP是否存在于黑名单中
                const { data: existingData, error: checkError } = await supabase
                    .from('ip_blacklist')
                    .select('*')
                    .eq('ip_address', targetIp)
                    .single();
                
                if (checkError && checkError.code !== 'PGRST116') {
                    console.log(JSON.stringify({ error: '检查IP状态失败: ' + checkError.message }));
                    return;
                }
                
                if (!existingData) {
                    console.log(JSON.stringify({ error: 'IP地址不在黑名单中' }));
                    return;
                }
                
                // 删除IP黑名单记录
                const { error: deleteError } = await supabase
                    .from('ip_blacklist')
                    .delete()
                    .eq('ip_address', targetIp);
                
                if (deleteError) {
                    console.log(JSON.stringify({ error: '删除IP黑名单失败: ' + deleteError.message }));
                    return;
                }
                
                // 记录安全日志
                await supabase
                    .from('security_logs')
                    .insert({
                        event_type: 'ip_unblocked',
                        ip_address: targetIp,
                        details: { reason: 'Manual unblock via script', original_reason: existingData.reason },
                        created_at: new Date().toISOString()
                    });
                
                // 记录活动日志
                await supabase
                    .from('activity_logs')
                    .insert({
                        event_type: 'ip_auto_unblocked',
                        ip_address: targetIp,
                        details: { reason: 'Manual unblock via script', original_reason: existingData.reason },
                        created_at: new Date().toISOString()
                    });
                
                console.log(JSON.stringify({ success: true, message: 'IP地址已成功解除限制' }));
            } catch (err) {
                console.log(JSON.stringify({ error: '操作失败: ' + err.message }));
            }
        })();
    " "$target_ip" 2>&1 | grep '^{')
    
    if [ $? -ne 0 ] || [ -z "$unblock_response" ]; then
        echo -e "${RED}错误: 无法执行解除限制操作，请检查Node.js环境和依赖${NC}"
        read -p "按回车键继续..."
        manage_ip_blacklist
        return
    fi
    
    # 检查响应结果
    if echo "$unblock_response" | grep -q '"success":true'; then
        echo -e "${GREEN}✓ IP地址 $target_ip 已成功解除限制${NC}"
    elif echo "$unblock_response" | grep -q '"error"'; then
        error_msg=$(echo "$unblock_response" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
        echo -e "${RED}解除限制失败: $error_msg${NC}"
    else
        echo -e "${YELLOW}操作完成，但响应格式异常：${NC}"
        echo "$unblock_response"
    fi
    
    echo ""
    read -p "按回车键继续..."
    manage_ip_blacklist
}

# 清理已过期的IP记录
cleanup_expired_ips() {
    echo -e "${YELLOW}正在清理已过期的IP记录...${NC}"
    
    # 使用Node.js脚本清理过期记录
    cleanup_response=$(node -e "
        const { createClient } = require('@supabase/supabase-js');
        
        (async () => {
            try {
                const supabaseUrl = process.env.SUPABASE_URL;
                const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
                
                if (!supabaseUrl || !supabaseKey) {
                    console.log(JSON.stringify({ error: 'Supabase配置缺失' }));
                    return;
                }
                
                const supabase = createClient(supabaseUrl, supabaseKey);
                const currentTime = new Date().toISOString();
                
                // 查询过期的记录
                const { data: expiredRecords, error: queryError } = await supabase
                    .from('ip_blacklist')
                    .select('*')
                    .not('blocked_until', 'is', null)
                    .lt('blocked_until', currentTime);
                
                if (queryError) {
                    console.log(JSON.stringify({ error: '查询过期记录失败: ' + queryError.message }));
                    return;
                }
                
                if (!expiredRecords || expiredRecords.length === 0) {
                    console.log(JSON.stringify({ success: true, message: '没有找到过期的IP记录', count: 0 }));
                    return;
                }
                
                // 删除过期记录
                const { error: deleteError } = await supabase
                    .from('ip_blacklist')
                    .delete()
                    .not('blocked_until', 'is', null)
                    .lt('blocked_until', currentTime);
                
                if (deleteError) {
                    console.log(JSON.stringify({ error: '删除过期记录失败: ' + deleteError.message }));
                    return;
                }
                
                // 记录清理操作到安全日志
                await supabase
                    .from('security_logs')
                    .insert({
                        event_type: 'ip_cleanup',
                        details: { 
                            reason: 'Automatic cleanup of expired IP records',
                            cleaned_count: expiredRecords.length,
                            cleaned_ips: expiredRecords.map(r => r.ip_address)
                        },
                        created_at: new Date().toISOString()
                    });
                
                console.log(JSON.stringify({ 
                    success: true, 
                    message: '已清理过期的IP记录', 
                    count: expiredRecords.length,
                    cleaned_ips: expiredRecords.map(r => r.ip_address)
                }));
            } catch (err) {
                console.log(JSON.stringify({ error: '清理操作失败: ' + err.message }));
            }
        })();
    " 2>&1 | grep '^{')
    
    if [ $? -ne 0 ] || [ -z "$cleanup_response" ]; then
        echo -e "${RED}错误: 无法执行清理操作，请检查Node.js环境和依赖${NC}"
        read -p "按回车键继续..."
        manage_ip_blacklist
        return
    fi
    
    # 检查响应结果
    if echo "$cleanup_response" | grep -q '"success":true'; then
        count=$(echo "$cleanup_response" | grep -o '"count":[0-9]*' | cut -d':' -f2)
        if [ "$count" = "0" ]; then
            echo -e "${GREEN}✓ 没有找到需要清理的过期IP记录${NC}"
        else
            echo -e "${GREEN}✓ 已成功清理 $count 条过期的IP记录${NC}"
            # 显示被清理的IP列表
            cleaned_ips=$(echo "$cleanup_response" | grep -o '"cleaned_ips":\[[^]]*\]' | sed 's/"cleaned_ips":\[//;s/\]//;s/"//g')
            if [ -n "$cleaned_ips" ]; then
                echo -e "${BLUE}已清理的IP地址: $cleaned_ips${NC}"
            fi
        fi
    elif echo "$cleanup_response" | grep -q '"error"'; then
        error_msg=$(echo "$cleanup_response" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
        echo -e "${RED}清理失败: $error_msg${NC}"
    else
        echo -e "${YELLOW}操作完成，但响应格式异常：${NC}"
        echo "$cleanup_response"
    fi
    
    echo ""
    read -p "按回车键继续..."
    manage_ip_blacklist
}

# 检查频率限制状态
check_rate_limit_status() {
    echo -e "${BLUE}=== 检查频率限制状态 ===${NC}"
    echo ""
    
    # 检查.env文件是否存在
    if [ ! -f ".env" ]; then
        echo -e "${RED}错误: .env文件不存在，请先创建配置文件${NC}"
        read -p "按回车键继续..."
        manage_ip_blacklist
        return
    fi
    
    echo -e "${YELLOW}正在检查频率限制状态...${NC}"
    echo -e "${BLUE}这将检查数据库中的IP限制记录和相关信息${NC}"
    echo ""
    
    # 运行检查脚本
    if [ -f "scripts/check-rate-limit.js" ]; then
        echo -e "${BLUE}运行频率限制检查脚本...${NC}"
        node scripts/check-rate-limit.js
    else
        echo -e "${RED}错误: 找不到 check-rate-limit.js 脚本${NC}"
        echo -e "${YELLOW}请确保脚本文件存在于 scripts/ 目录${NC}"
    fi
    
    echo ""
    read -p "按回车键继续..."
    manage_ip_blacklist
}

# 清除指定IP的频率限制
clear_ip_rate_limit() {
    echo -e "${BLUE}=== 清除IP频率限制 ===${NC}"
    echo ""
    
    # 检查.env文件是否存在
    if [ ! -f ".env" ]; then
        echo -e "${RED}错误: .env文件不存在，请先创建配置文件${NC}"
        read -p "按回车键继续..."
        manage_ip_blacklist
        return
    fi
    
    echo -e "${YELLOW}请输入要清除限制的IP地址:${NC}"
    echo -e "${BLUE}支持的格式: IPv4 (192.168.1.1), IPv6 (::1), 或 IPv6 地址${NC}"
    echo ""
    echo -n "IP地址: "
    read -r target_ip
    
    if [ -z "$target_ip" ]; then
        echo -e "${YELLOW}操作已取消${NC}"
        read -p "按回车键继续..."
        manage_ip_blacklist
        return
    fi
    
    # 验证IP地址格式
    if ! echo "$target_ip" | grep -E '^([0-9]{1,3}\.){3}[0-9]{1,3}$|^::1$|^[0-9a-fA-F:]+$' > /dev/null; then
        echo -e "${RED}错误: IP地址格式不正确${NC}"
        read -p "按回车键继续..."
        clear_ip_rate_limit
        return
    fi
    
    echo -e "${YELLOW}正在清除IP $target_ip 的频率限制...${NC}"
    
    # 运行清除脚本
    if [ -f "scripts/clear-rate-limit.js" ]; then
        echo -e "${BLUE}运行频率限制清除脚本...${NC}"
        echo "$target_ip" | node scripts/clear-rate-limit.js
    else
        echo -e "${RED}错误: 找不到 clear-rate-limit.js 脚本${NC}"
        echo -e "${YELLOW}请确保脚本文件存在于 scripts/ 目录${NC}"
    fi
    
    echo ""
    read -p "按回车键继续..."
    manage_ip_blacklist
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
    echo "8. IP黑名单管理"
    echo "9. 退出"
    echo ""
    echo -n "请输入选项 (1-9): "
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
                echo ""
                manage_ip_blacklist
                ;;
            9)
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
    ip)
        manage_ip_blacklist
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
        echo "  ip         IP黑名单管理"
        echo "  help       显示此帮助信息"
        echo ""
        echo -e "${YELLOW}不带参数运行时将显示交互菜单${NC}"
        ;;
    *)
        # 没有参数时显示交互菜单
        main
        ;;
esac
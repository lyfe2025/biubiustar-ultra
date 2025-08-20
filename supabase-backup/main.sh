#!/usr/bin/env bash

set -euo pipefail

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 脚本目录
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bin_dir="$script_dir/bin"
project_root="$(cd "$script_dir/.." && pwd)"   # 项目根目录
project_env_file="$project_root/.env"
local_env_file="$script_dir/.env"

# 检查必要的工具
check_requirements() {
    local missing_tools=()
    
    for tool in pg_dump pg_restore psql; do
        if ! command -v "$tool" >/dev/null 2>&1; then
            missing_tools+=("$tool")
        fi
    done
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        echo -e "${RED}错误：缺少必要的 PostgreSQL 工具：${missing_tools[*]}${NC}"
        echo -e "${YELLOW}请安装 PostgreSQL 客户端工具：${NC}"
        echo -e "  macOS: brew install libpq && brew link --force libpq"
        echo -e "  Ubuntu/Debian: sudo apt-get install postgresql-client"
        echo -e "  CentOS/RHEL: sudo yum install postgresql"
        exit 1
    fi
}

# 检查环境配置
check_env() {
    # 优先加载项目根目录 .env，其次加载本地覆盖 .env
    if [[ -f "$project_env_file" ]]; then
        set -a
        source "$project_env_file"
        set +a
    fi
    if [[ -f "$local_env_file" ]]; then
        set -a
        source "$local_env_file"
        set +a
    fi
    
    # 如果两者都不存在，则生成最小模板到本地 .env 并提示配置
    if [[ ! -f "$project_env_file" && ! -f "$local_env_file" ]]; then
        echo -e "${YELLOW}未找到环境配置文件: $project_env_file 或 $local_env_file${NC}"
        echo -e "${BLUE}正在创建最小环境配置模板到: $local_env_file ...${NC}"
        cp "$script_dir/env.example" "$local_env_file"
        echo -e "${GREEN}已创建模板，请编辑 $local_env_file 并填入数据库连接信息${NC}"
        echo -e "${YELLOW}配置完成后请重新运行此脚本${NC}"
        exit 1
    fi
    
    # 检查必要的环境变量
    if [[ -z "${SUPABASE_DB_URL:-}" ]] && [[ -z "${PGHOST:-}" ]]; then
        echo -e "${RED}错误：未配置数据库连接信息${NC}"
        echo -e "${YELLOW}请在项目根 .env 或 $local_env_file 中配置以下之一：${NC}"
        echo -e "  1. SUPABASE_DB_URL (推荐)"
        echo -e "  2. PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD"
        exit 1
    fi
}

# 显示主菜单
show_menu() {
    clear
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Supabase 数据库备份还原工具${NC}"
    echo -e "${BLUE}================================${NC}"
    echo
    echo -e "${GREEN}1.${NC} 创建数据库备份"
    echo -e "${GREEN}2.${NC} 还原数据库备份"
    echo -e "${GREEN}3.${NC} 查看现有备份"
    echo -e "${GREEN}4.${NC} 测试数据库连接"
    echo -e "${GREEN}5.${NC} 编辑环境配置"
    echo -e "${GREEN}6.${NC} 查看帮助信息"
    echo -e "${GREEN}0.${NC} 退出"
    echo
}

# 创建备份
create_backup() {
    echo -e "${BLUE}正在创建数据库备份...${NC}"
    echo
    
    if "$bin_dir/backup.sh"; then
        echo -e "${GREEN}备份创建成功！${NC}"
    else
        echo -e "${RED}备份创建失败！${NC}"
    fi
    
    echo
    read -p "按回车键继续..."
}

# 还原备份
restore_backup() {
    echo -e "${BLUE}选择要还原的备份文件：${NC}"
    echo
    
    # 获取备份文件列表
    backup_dir="$script_dir/backups"
    if [[ ! -d "$backup_dir" ]] || ! ls -1 "$backup_dir"/*.{dump,sql} >/dev/null 2>&1; then
        echo -e "${YELLOW}未找到可用的备份文件${NC}"
        echo
        read -p "按回车键继续..."
        return
    fi
    
    # 显示备份文件列表
    echo -e "${GREEN}可用的备份文件：${NC}"
    local files=()
    local i=1
    
    while IFS= read -r -d '' file; do
        files+=("$file")
        local size=$(ls -lh "$file" | awk '{print $5}')
        local date=$(ls -lT "$file" | awk '{print $6, $7, $8}')
        echo -e "  ${GREEN}$i.${NC} $(basename "$file") (${size}, ${date})"
        ((i++))
    done < <(find "$backup_dir" -maxdepth 1 -name "*.dump" -o -name "*.sql" -print0 | sort -z)
    
    echo
    read -p "请选择要还原的备份文件编号 (1-$((i-1))): " choice
    
    if [[ "$choice" =~ ^[0-9]+$ ]] && [[ "$choice" -ge 1 ]] && [[ "$choice" -le $((i-1)) ]]; then
        local selected_file="${files[$((choice-1))]}"
        echo -e "${YELLOW}警告：此操作将覆盖当前数据库！${NC}"
        echo -e "选择的文件: ${BLUE}$(basename "$selected_file")${NC}"
        echo
        read -p "确认继续？(输入 'yes' 确认): " confirm
        
        if [[ "$confirm" == "yes" ]]; then
            echo -e "${BLUE}正在还原数据库...${NC}"
            if "$bin_dir/restore.sh" "$selected_file"; then
                echo -e "${GREEN}数据库还原成功！${NC}"
            else
                echo -e "${RED}数据库还原失败！${NC}"
            fi
        else
            echo -e "${YELLOW}操作已取消${NC}"
        fi
    else
        echo -e "${RED}无效的选择${NC}"
    fi
    
    echo
    read -p "按回车键继续..."
}

# 查看备份
list_backups() {
    echo -e "${BLUE}现有备份文件：${NC}"
    echo
    
    if "$bin_dir/list_backups.sh"; then
        echo -e "${GREEN}备份列表获取成功！${NC}"
    else
        echo -e "${RED}获取备份列表失败！${NC}"
    fi
    
    echo
    read -p "按回车键继续..."
}

# 测试数据库连接
test_connection() {
    echo -e "${BLUE}正在测试数据库连接...${NC}"
    echo
    
    if [[ -n "${SUPABASE_DB_URL:-}" ]]; then
        if psql "$SUPABASE_DB_URL" -c "SELECT version();" >/dev/null 2>&1; then
            echo -e "${GREEN}✓ 数据库连接成功！${NC}"
            psql "$SUPABASE_DB_URL" -c "SELECT version();" | head -n 3
        else
            echo -e "${RED}✗ 数据库连接失败！${NC}"
        fi
    else
        if [[ -n "${PGHOST:-}" ]] && [[ -n "${PGPORT:-}" ]] && [[ -n "${PGDATABASE:-}" ]] && [[ -n "${PGUSER:-}" ]] && [[ -n "${PGPASSWORD:-}" ]]; then
            if PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "SELECT version();" >/dev/null 2>&1; then
                echo -e "${GREEN}✓ 数据库连接成功！${NC}"
                PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "SELECT version();" | head -n 3
            else
                echo -e "${RED}✗ 数据库连接失败！${NC}"
            fi
        else
            echo -e "${RED}✗ 环境变量配置不完整${NC}"
        fi
    fi
    
    echo
    read -p "按回车键继续..."
}

# 编辑环境配置
edit_config() {
    echo -e "${BLUE}正在打开环境配置文件...${NC}"
    echo
    
    # 首选项目根 .env，其次本地 .env（若不存在则创建模板）
    target_env="$project_env_file"
    if [[ ! -f "$project_env_file" ]]; then
        target_env="$local_env_file"
        if [[ ! -f "$local_env_file" ]]; then
            cp "$script_dir/env.example" "$local_env_file"
        fi
    fi
    
    if command -v code >/dev/null 2>&1; then
        code "$target_env"
    elif command -v nano >/dev/null 2>&1; then
        nano "$target_env"
    elif command -v vim >/dev/null 2>&1; then
        vim "$target_env"
    elif command -v vi >/dev/null 2>&1; then
        vi "$target_env"
    else
        echo -e "${YELLOW}未找到可用的编辑器，请手动编辑: $target_env${NC}"
    fi
    
    echo -e "${GREEN}配置已更新，请重新运行脚本以加载新配置${NC}"
    echo
    read -p "按回车键继续..."
}

# 显示帮助信息
show_help() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  帮助信息${NC}"
    echo -e "${BLUE}================================${NC}"
    echo
    echo -e "${GREEN}功能说明：${NC}"
    echo -e "  1. 创建数据库备份 - 生成完整的数据库备份文件"
    echo -e "  2. 还原数据库备份 - 从备份文件恢复数据库"
    echo -e "  3. 查看现有备份 - 列出所有可用的备份文件"
    echo -e "  4. 测试数据库连接 - 验证数据库连接是否正常"
    echo -e "  5. 编辑环境配置 - 修改数据库连接设置"
    echo -e "  6. 查看帮助信息 - 显示此帮助信息"
    echo
    echo -e "${GREEN}环境配置：${NC}"
    echo -e "  优先加载项目根: $project_env_file"
    echo -e "  可选覆盖文件: $local_env_file"
    echo -e "  支持两种配置方式："
    echo -e "    - SUPABASE_DB_URL: 完整的连接字符串"
    echo -e "    - PG* 变量: PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD"
    echo
    echo -e "${GREEN}注意事项：${NC}"
    echo -e "  - 还原操作会覆盖现有数据库，请谨慎操作"
    echo -e "  - 建议在还原前先创建备份"
    echo -e "  - 确保有足够的磁盘空间存储备份文件"
    echo
    read -p "按回车键继续..."
}

# 主程序
main() {
    # 检查工作目录
    if [[ ! -d "$bin_dir" ]]; then
        echo -e "${RED}错误：脚本目录结构不完整${NC}"
        exit 1
    fi
    
    # 检查依赖
    check_requirements
    
    # 检查环境配置
    check_env
    
    # 主循环
    while true; do
        show_menu
        read -p "请选择操作 (0-6): " choice
        
        case $choice in
            1)
                create_backup
                ;;
            2)
                restore_backup
                ;;
            3)
                list_backups
                ;;
            4)
                test_connection
                ;;
            5)
                edit_config
                ;;
            6)
                show_help
                ;;
            0)
                echo -e "${GREEN}感谢使用，再见！${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}无效选择，请重新输入${NC}"
                sleep 1
                ;;
        esac
    done
}

# 运行主程序
main "$@"

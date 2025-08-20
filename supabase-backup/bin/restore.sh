#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd "$script_dir/.." && pwd)"            # supabase-backup 目录
project_root="$(cd "$script_dir/../.." && pwd)"     # 项目根目录
project_env_file="$project_root/.env"
local_env_file="$root_dir/.env"
backup_dir="$root_dir/backups"

# 先加载项目根目录 .env，再加载本地覆盖 .env（若存在）
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

require_tool() {
	if ! command -v "$1" >/dev/null 2>&1; then
		echo "错误：未找到命令 $1。请先安装它。" >&2
		exit 1
	fi
}

require_tool pg_restore
require_tool psql

# 选择要恢复的文件
target_file="${1:-}"
if [[ -z "$target_file" ]]; then
	# 自动选择最新的 .dump 或 .sql
	if ls -1t "$backup_dir"/*.dump >/dev/null 2>&1; then
		target_file="$(ls -1t "$backup_dir"/*.dump | head -n1)"
	elif ls -1t "$backup_dir"/*.sql >/dev/null 2>&1; then
		target_file="$(ls -1t "$backup_dir"/*.sql | head -n1)"
	else
		echo "未找到可用于还原的备份文件 (*.dump 或 *.sql)" >&2
		exit 1
	fi
fi

if [[ ! -f "$target_file" ]]; then
	echo "指定的备份文件不存在: $target_file" >&2
	exit 1
fi

echo "开始从备份还原: $target_file"

# 计算并发度
detect_jobs() {
	if command -v nproc >/dev/null 2>&1; then
		echo "$(nproc)"
	else
		# macOS
		echo "$(sysctl -n hw.ncpu 2>/dev/null || echo 2)"
	fi
}

jobs="$(detect_jobs)"

ext="${target_file##*.}"
if [[ "$ext" == "dump" ]]; then
	if [[ -n "${SUPABASE_DB_URL:-}" ]]; then
		pg_restore \
			--clean --if-exists \
			--no-owner --no-privileges \
			--exit-on-error \
			--jobs "$jobs" \
			-d "$SUPABASE_DB_URL" \
			"$target_file"
	else
		: "${PGHOST:?未设置 PGHOST 且未提供 SUPABASE_DB_URL}"
		: "${PGPORT:?未设置 PGPORT 且未提供 SUPABASE_DB_URL}"
		: "${PGDATABASE:?未设置 PGDATABASE 且未提供 SUPABASE_DB_URL}"
		: "${PGUSER:?未设置 PGUSER 且未提供 SUPABASE_DB_URL}"
		: "${PGPASSWORD:?未设置 PGPASSWORD 且未提供 SUPABASE_DB_URL}"
		PGPASSWORD="$PGPASSWORD" pg_restore \
			--clean --if-exists \
			--no-owner --no-privileges \
			--exit-on-error \
			--jobs "$jobs" \
			-h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" \
			"$target_file"
	fi
elif [[ "$ext" == "sql" ]]; then
	if [[ -n "${SUPABASE_DB_URL:-}" ]]; then
		psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$target_file"
	else
		: "${PGHOST:?未设置 PGHOST 且未提供 SUPABASE_DB_URL}"
		: "${PGPORT:?未设置 PGPORT 且未提供 SUPABASE_DB_URL}"
		: "${PGDATABASE:?未设置 PGDATABASE 且未提供 SUPABASE_DB_URL}"
		: "${PGUSER:?未设置 PGUSER 且未提供 SUPABASE_DB_URL}"
		: "${PGPASSWORD:?未设置 PGPASSWORD 且未提供 SUPABASE_DB_URL}"
		PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 -f "$target_file"
	fi
else
	echo "不支持的文件类型: $target_file" >&2
	exit 1
fi

echo "还原完成。"


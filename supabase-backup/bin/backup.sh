#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd "$script_dir/.." && pwd)"            # supabase-backup 目录
project_root="$(cd "$script_dir/../.." && pwd)"     # 项目根目录
project_env_file="$project_root/.env"
local_env_file="$root_dir/.env"
backup_dir="$root_dir/backups"
mkdir -p "$backup_dir"

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

require_tool pg_dump

timestamp="$(date +%Y%m%d_%H%M%S)"
outfile="$backup_dir/${timestamp}_full.dump"

echo "开始备份到: $outfile"

if [[ -n "${SUPABASE_DB_URL:-}" ]]; then
	# 使用连接字符串
	pg_dump \
		--format=custom \
		--compress=9 \
		--no-owner \
		--no-privileges \
		--verbose \
		"$SUPABASE_DB_URL" \
		-f "$outfile"
else
	# 使用 PG* 变量
	: "${PGHOST:?未设置 PGHOST 且未提供 SUPABASE_DB_URL}"
	: "${PGPORT:?未设置 PGPORT 且未提供 SUPABASE_DB_URL}"
	: "${PGDATABASE:?未设置 PGDATABASE 且未提供 SUPABASE_DB_URL}"
	: "${PGUSER:?未设置 PGUSER 且未提供 SUPABASE_DB_URL}"
	: "${PGPASSWORD:?未设置 PGPASSWORD 且未提供 SUPABASE_DB_URL}"
	PGPASSWORD="$PGPASSWORD" pg_dump \
		-h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" \
		--format=custom \
		--compress=9 \
		--no-owner \
		--no-privileges \
		--verbose \
		-f "$outfile"
fi

echo "备份完成: $outfile"


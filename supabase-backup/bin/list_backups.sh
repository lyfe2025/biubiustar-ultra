#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd "$script_dir/.." && pwd)"
backup_dir="$root_dir/backups"

mkdir -p "$backup_dir"

echo "备份目录: $backup_dir"

if ls -1t "$backup_dir"/*.{dump,sql} >/dev/null 2>&1; then
	ls -lhT "$backup_dir"/*.{dump,sql}
else
	echo "暂无备份文件"
fi


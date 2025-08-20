### Supabase 数据库 备份与还原工具

本目录用于对 Supabase 的 PostgreSQL 数据库进行完整备份与还原。

包含内容：
- `main.sh`: **统一入口脚本** - 交互式菜单操作（推荐使用）
- `bin/backup.sh`: 生成全量备份（自定义格式 `.dump`，压缩级别 9）
- `bin/restore.sh`: 从 `.dump` 文件执行还原（支持清理旧对象）
- `bin/list_backups.sh`: 快速查看已有备份
- `backups/`: 备份文件存放位置（已在本目录下单独 `.gitignore` 忽略）

#### 先决条件
- 安装 PostgreSQL 客户端工具（包含 `pg_dump`、`pg_restore`、`psql`）
  - macOS（推荐）：
    - 使用 Homebrew 安装：`brew install libpq`
    - 将工具加入 PATH：`brew link --force libpq`
- 确保你拥有可连接 Supabase 数据库的凭证（连接字符串或单独的主机/端口/库/用户/密码）。

#### 配置环境变量
- 推荐：直接使用项目根目录的 `.env` 文件（脚本会优先加载）
- 可选：使用 `supabase-backup/.env` 作为覆盖（仅需包含数据库连接相关变量）

最小配置（任选其一）：
- 方式 A：提供完整连接字符串（推荐）
  - `SUPABASE_DB_URL=postgres://postgres:YOUR_PASSWORD@db.YOUR-PROJECT-REF.supabase.co:5432/postgres?sslmode=require`
- 方式 B：提供 PG 环境变量（无需 URL）
  - `PGHOST`、`PGPORT`、`PGDATABASE`、`PGUSER`、`PGPASSWORD`、`PGSSLMODE`

加载顺序：项目根 `.env` → 本地 `supabase-backup/.env`（覆盖同名变量）

#### 使用方法

##### 🎯 推荐方式：使用统一入口脚本
```bash
# 运行交互式菜单
supabase-backup/main.sh
```

主菜单提供以下功能：
- **1. 创建数据库备份** - 生成完整的数据库备份文件
- **2. 还原数据库备份** - 从备份文件恢复数据库（带确认提示）
- **3. 查看现有备份** - 列出所有可用的备份文件
- **4. 测试数据库连接** - 验证数据库连接是否正常
- **5. 编辑环境配置** - 修改数据库连接设置
- **6. 查看帮助信息** - 显示详细的使用说明
- **0. 退出** - 退出程序

##### 🔧 直接使用脚本（高级用户）
- 备份（生成到 `supabase-backup/backups/` 子目录）：
  ```bash
  supabase-backup/bin/backup.sh
  ```

- 列出备份：
  ```bash
  supabase-backup/bin/list_backups.sh
  ```

- 还原（指定备份文件路径，或不传参数自动选择最新备份）：
  ```bash
  # 还原最新
  supabase-backup/bin/restore.sh

  # 或指定文件
  supabase-backup/bin/restore.sh supabase-backup/backups/20250101_120000/full.dump
  ```

#### 环境配置说明
环境配置文件 `supabase-backup/.env` 支持多种配置选项：

- **基础配置**：数据库连接信息
- **备份配置**：压缩级别、保留天数、文件命名格式
- **高级配置**：所有者信息、权限信息、并发设置
- **通知配置**：邮件、Webhook、Slack 通知
- **日志配置**：日志级别、详细程度、文件路径
- **安全配置**：备份加密、完整性验证

#### 常见问题
- 找不到 `pg_dump`/`pg_restore`：请按上述方式安装 `libpq` 并 `brew link --force libpq`。
- 连接失败：
  - 确保连接字符串/密码正确
  - Supabase 远端需要 `sslmode=require`（连接字符串中已包含）
  - 若使用 `PG*` 变量，请确保六个变量都正确设置
- 权限问题：确保脚本有执行权限 `chmod +x supabase-backup/main.sh`

#### 安全提醒
- 还原操作会覆盖现有数据库，请谨慎操作
- 建议在还原前先创建备份
- 确保备份文件存储在安全位置
- 定期清理过期的备份文件以节省磁盘空间

提示：还原操作会尝试清理已存在对象（`--clean --if-exists`），请谨慎在生产库执行。



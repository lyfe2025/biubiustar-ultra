#!/bin/bash

# Biubiustar Ultra 部署配置文件
# 所有配置变量都集中在这里，方便管理和修改

# =============================================================================
# Git 仓库配置
# =============================================================================
DEFAULT_REPO_URL="https://github.com/lyfe2025/biubiustar-ultra"
DEFAULT_BRANCH="main"
PROJECT_NAME="biubiustar-ultra"

# =============================================================================
# 部署目录配置
# =============================================================================
DEPLOY_DIR="/opt/biubiustar"
TEMP_DIR="/tmp/biubiustar-deploy"

# =============================================================================
# 默认部署配置
# =============================================================================
DEFAULT_ENVIRONMENT="prod"
DEFAULT_DEPLOY_MODE="docker"
SKIP_ENV_CONFIG_DEFAULT=false

# =============================================================================
# 系统要求配置
# =============================================================================
MIN_MEMORY_GB=2
MIN_DISK_GB=20
SUPPORTED_OS=("ubuntu" "debian" "centos" "rhel" "rocky" "alma" "amzn")

# =============================================================================
# 软件版本配置
# =============================================================================
DOCKER_VERSION="20.10"
NODEJS_VERSION="18"
NGINX_VERSION="1.18"

# =============================================================================
# 端口配置
# =============================================================================
DEFAULT_APP_PORT=3000
DEFAULT_NGINX_HTTP_PORT=80
DEFAULT_NGINX_HTTPS_PORT=443
DEFAULT_HEALTH_CHECK_PORT=3000

# =============================================================================
# 资源限制配置
# =============================================================================
DEFAULT_MEMORY_LIMIT=512
DEFAULT_CPU_LIMIT=1.0
DEFAULT_CPU_RESERVATION=0.5

# =============================================================================
# 健康检查配置
# =============================================================================
DEFAULT_HEALTH_CHECK_INTERVAL=30
DEFAULT_HEALTH_CHECK_TIMEOUT=10
DEFAULT_HEALTH_CHECK_RETRIES=3
DEFAULT_HEALTH_CHECK_START_PERIOD=40

# =============================================================================
# 日志配置
# =============================================================================
DEFAULT_LOG_MAX_SIZE="10m"
DEFAULT_LOG_MAX_FILES=3

# =============================================================================
# 备份配置
# =============================================================================
DEFAULT_BACKUP_RETENTION_DAYS=7
DEFAULT_BACKUP_COMPRESSION_LEVEL=6

# =============================================================================
# 文件上传配置
# =============================================================================
DEFAULT_MAX_FILE_SIZE=100

# =============================================================================
# 安全配置
# =============================================================================
DEFAULT_JWT_SECRET="your_jwt_secret_here"
DEFAULT_BCRYPT_ROUNDS=12
DEFAULT_MAX_LOGIN_ATTEMPTS=5
DEFAULT_LOGIN_LOCKOUT_TIME=900

# =============================================================================
# 邮件服务配置
# =============================================================================
DEFAULT_SMTP_HOST="smtp.gmail.com"
DEFAULT_SMTP_PORT=587
DEFAULT_SMTP_USER="your_email@gmail.com"
DEFAULT_SMTP_PASS="your_app_password"

# =============================================================================
# 网络配置
# =============================================================================
DOCKER_NETWORK_SUBNET="172.20.0.0/16"
DOCKER_NETWORK_NAME="biubiustar-network"

# =============================================================================
# 防火墙配置
# =============================================================================
FIREWALL_SSH_PORT=22
FIREWALL_HTTP_PORT=80
FIREWALL_HTTPS_PORT=443

# =============================================================================
# 脚本下载配置
# =============================================================================
SCRIPT_BASE_URL="https://raw.githubusercontent.com/lyfe2025/biubiustar-ultra/main/deployment/scripts"
ONE_CLICK_SCRIPT_URL="$SCRIPT_BASE_URL/one-click-deploy.sh"
QUICK_DEPLOY_SCRIPT_URL="$SCRIPT_BASE_URL/quick-deploy.sh"

# =============================================================================
# 颜色配置
# =============================================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# =============================================================================
# 日志级别配置
# =============================================================================
LOG_LEVEL="info"
DEBUG_MODE=false
VERBOSE_MODE=false

# =============================================================================
# 超时配置
# =============================================================================
DOWNLOAD_TIMEOUT=300
INSTALL_TIMEOUT=600
DEPLOY_TIMEOUT=900

# =============================================================================
# 错误处理配置
# =============================================================================
MAX_RETRIES=3
RETRY_DELAY=5

# =============================================================================
# 验证配置
# =============================================================================
VALIDATE_SSL=true
CHECK_DEPENDENCIES=true
VERIFY_DOWNLOADS=true

# =============================================================================
# 清理配置
# =============================================================================
CLEANUP_TEMP_FILES=true
CLEANUP_OLD_BACKUPS=true
CLEANUP_DOCKER_IMAGES=true

# =============================================================================
# 监控配置
# =============================================================================
ENABLE_MONITORING=false
MONITORING_INTERVAL=60
MONITORING_RETENTION_DAYS=30

# =============================================================================
# 通知配置
# =============================================================================
ENABLE_NOTIFICATIONS=false
NOTIFICATION_EMAIL=""
NOTIFICATION_WEBHOOK=""

# =============================================================================
# 开发模式配置
# =============================================================================
DEV_MODE=false
SKIP_TESTS=false
SKIP_BUILD=false
SKIP_DEPLOY=false

# =============================================================================
# 回滚配置
# =============================================================================
ENABLE_ROLLBACK=false
ROLLBACK_VERSIONS=3
ROLLBACK_ON_FAILURE=true

# =============================================================================
# 性能配置
# =============================================================================
OPTIMIZE_FOR_PERFORMANCE=true
ENABLE_CACHING=true
ENABLE_COMPRESSION=true
ENABLE_LOGGING=true

# =============================================================================
# 安全配置
# =============================================================================
ENABLE_SECURITY_SCAN=false
SECURITY_SCAN_LEVEL="medium"
BLOCK_SUSPICIOUS_IPS=true
RATE_LIMITING=true

# =============================================================================
# 备份策略配置
# =============================================================================
BACKUP_STRATEGY="incremental"
BACKUP_SCHEDULE="daily"
BACKUP_ENCRYPTION=false
BACKUP_VERIFICATION=true

# =============================================================================
# 日志轮转配置
# =============================================================================
LOG_ROTATION_ENABLED=true
LOG_ROTATION_SIZE="100M"
LOG_ROTATION_COUNT=5
LOG_ROTATION_COMPRESSION=true

# =============================================================================
# 健康检查配置
# =============================================================================
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_ENDPOINTS=("/health" "/api/health" "/status")
HEALTH_CHECK_TIMEOUT=10
HEALTH_CHECK_RETRIES=3

# =============================================================================
# 负载均衡配置
# =============================================================================
LOAD_BALANCING_ENABLED=false
LOAD_BALANCER_TYPE="nginx"
LOAD_BALANCER_ALGORITHM="round_robin"
LOAD_BALANCER_HEALTH_CHECK=true

# =============================================================================
# 缓存配置
# =============================================================================
CACHE_ENABLED=true
CACHE_TYPE="memory"
CACHE_SIZE="512M"
CACHE_TTL=3600
CACHE_CLEANUP_INTERVAL=300

# =============================================================================
# 数据库配置
# =============================================================================
DATABASE_TYPE="supabase"
DATABASE_HOST=""
DATABASE_PORT=""
DATABASE_NAME=""
DATABASE_USER=""
DATABASE_PASSWORD=""
DATABASE_SSL=true

# =============================================================================
# Redis 配置 (如果需要)
# =============================================================================
REDIS_ENABLED=false
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_DATABASE=0

# =============================================================================
# 邮件服务配置
# =============================================================================
EMAIL_SERVICE_ENABLED=false
EMAIL_SERVICE_TYPE="smtp"
EMAIL_FROM="noreply@biubiustar.com"
EMAIL_REPLY_TO="support@biubiustar.com"

# =============================================================================
# 文件存储配置
# =============================================================================
FILE_STORAGE_TYPE="local"
FILE_STORAGE_PATH="/var/www/uploads"
FILE_STORAGE_MAX_SIZE="100M"
FILE_STORAGE_ALLOWED_TYPES=("jpg" "jpeg" "png" "gif" "webp" "mp4" "pdf")

# =============================================================================
# SSL 配置
# =============================================================================
SSL_ENABLED=true
SSL_PROVIDER="letsencrypt"
SSL_EMAIL="admin@biubiustar.com"
SSL_RENEWAL_DAYS=30
SSL_FORCE_HTTPS=true

# =============================================================================
# CDN 配置
# =============================================================================
CDN_ENABLED=false
CDN_PROVIDER="cloudflare"
CDN_DOMAIN=""
CDN_API_KEY=""

# =============================================================================
# 监控和告警配置
# =============================================================================
MONITORING_ENABLED=false
MONITORING_PROVIDER="prometheus"
ALERTING_ENABLED=false
ALERTING_PROVIDER="email"

# =============================================================================
# 开发工具配置
# =============================================================================
DEV_TOOLS_ENABLED=false
DEBUG_MODE_ENABLED=false
PROFILING_ENABLED=false
TESTING_ENABLED=false

# =============================================================================
# 国际化配置
# =============================================================================
DEFAULT_LANGUAGE="en"
SUPPORTED_LANGUAGES=("en" "vi" "zh-CN" "zh-TW")
LANGUAGE_DETECTION=true
FALLBACK_LANGUAGE="en"

# =============================================================================
# 时区配置
# =============================================================================
DEFAULT_TIMEZONE="UTC"
TIMEZONE_DETECTION=true
DATE_FORMAT="YYYY-MM-DD"
TIME_FORMAT="HH:mm:ss"

# =============================================================================
# 主题配置
# =============================================================================
DEFAULT_THEME="light"
SUPPORTED_THEMES=("light" "dark" "auto")
THEME_DETECTION=true
CUSTOM_THEME_ENABLED=false

# =============================================================================
# 功能开关配置
# =============================================================================
FEATURE_USER_REGISTRATION=true
FEATURE_USER_LOGIN=true
FEATURE_SOCIAL_LOGIN=false
FEATURE_TWO_FACTOR_AUTH=false
FEATURE_EMAIL_VERIFICATION=true
FEATURE_PASSWORD_RESET=true
FEATURE_USER_PROFILES=true
FEATURE_POST_CREATION=true
FEATURE_COMMENTS=true
FEATURE_LIKES=true
FEATURE_FOLLOWING=true
FEATURE_ACTIVITIES=true
FEATURE_NOTIFICATIONS=true
FEATURE_SEARCH=true
FEATURE_ANALYTICS=false
FEATURE_ADMIN_PANEL=true

# =============================================================================
# 导出所有配置变量
# =============================================================================
export DEFAULT_REPO_URL DEFAULT_BRANCH PROJECT_NAME DEPLOY_DIR TEMP_DIR
export DEFAULT_ENVIRONMENT DEFAULT_DEPLOY_MODE SKIP_ENV_CONFIG_DEFAULT
export MIN_MEMORY_GB MIN_DISK_GB SUPPORTED_OS
export DOCKER_VERSION NODEJS_VERSION NGINX_VERSION
export DEFAULT_APP_PORT DEFAULT_NGINX_HTTP_PORT DEFAULT_NGINX_HTTPS_PORT DEFAULT_HEALTH_CHECK_PORT
export DEFAULT_MEMORY_LIMIT DEFAULT_CPU_LIMIT DEFAULT_CPU_RESERVATION
export DEFAULT_HEALTH_CHECK_INTERVAL DEFAULT_HEALTH_CHECK_TIMEOUT DEFAULT_HEALTH_CHECK_RETRIES DEFAULT_HEALTH_CHECK_START_PERIOD
export DEFAULT_LOG_MAX_SIZE DEFAULT_LOG_MAX_FILES
export DEFAULT_BACKUP_RETENTION_DAYS DEFAULT_BACKUP_COMPRESSION_LEVEL
export DEFAULT_MAX_FILE_SIZE
export DEFAULT_JWT_SECRET DEFAULT_BCRYPT_ROUNDS DEFAULT_MAX_LOGIN_ATTEMPTS DEFAULT_LOGIN_LOCKOUT_TIME
export DEFAULT_SMTP_HOST DEFAULT_SMTP_PORT DEFAULT_SMTP_USER DEFAULT_SMTP_PASS
export DOCKER_NETWORK_SUBNET DOCKER_NETWORK_NAME
export FIREWALL_SSH_PORT FIREWALL_HTTP_PORT FIREWALL_HTTPS_PORT
export SCRIPT_BASE_URL ONE_CLICK_SCRIPT_URL QUICK_DEPLOY_SCRIPT_URL
export RED GREEN YELLOW BLUE PURPLE CYAN NC
export LOG_LEVEL DEBUG_MODE VERBOSE_MODE
export DOWNLOAD_TIMEOUT INSTALL_TIMEOUT DEPLOY_TIMEOUT
export MAX_RETRIES RETRY_DELAY
export VALIDATE_SSL CHECK_DEPENDENCIES VERIFY_DOWNLOADS
export CLEANUP_TEMP_FILES CLEANUP_OLD_BACKUPS CLEANUP_DOCKER_IMAGES
export ENABLE_MONITORING MONITORING_INTERVAL MONITORING_RETENTION_DAYS
export ENABLE_NOTIFICATIONS NOTIFICATION_EMAIL NOTIFICATION_WEBHOOK
export DEV_MODE SKIP_TESTS SKIP_BUILD SKIP_DEPLOY
export ENABLE_ROLLBACK ROLLBACK_VERSIONS ROLLBACK_ON_FAILURE
export OPTIMIZE_FOR_PERFORMANCE ENABLE_CACHING ENABLE_COMPRESSION ENABLE_LOGGING
export ENABLE_SECURITY_SCAN SECURITY_SCAN_LEVEL BLOCK_SUSPICIOUS_IPS RATE_LIMITING
export BACKUP_STRATEGY BACKUP_SCHEDULE BACKUP_ENCRYPTION BACKUP_VERIFICATION
export LOG_ROTATION_ENABLED LOG_ROTATION_SIZE LOG_ROTATION_COUNT LOG_ROTATION_COMPRESSION
export HEALTH_CHECK_ENABLED HEALTH_CHECK_ENDPOINTS HEALTH_CHECK_TIMEOUT HEALTH_CHECK_RETRIES
export LOAD_BALANCING_ENABLED LOAD_BALANCER_TYPE LOAD_BALANCER_ALGORITHM LOAD_BALANCER_HEALTH_CHECK
export CACHE_ENABLED CACHE_TYPE CACHE_SIZE CACHE_TTL CACHE_CLEANUP_INTERVAL
export DATABASE_TYPE DATABASE_HOST DATABASE_PORT DATABASE_NAME DATABASE_USER DATABASE_PASSWORD DATABASE_SSL
export REDIS_ENABLED REDIS_HOST REDIS_PORT REDIS_PASSWORD REDIS_DATABASE
export EMAIL_SERVICE_ENABLED EMAIL_SERVICE_TYPE EMAIL_FROM EMAIL_REPLY_TO
export FILE_STORAGE_TYPE FILE_STORAGE_PATH FILE_STORAGE_MAX_SIZE FILE_STORAGE_ALLOWED_TYPES
export SSL_ENABLED SSL_PROVIDER SSL_EMAIL SSL_RENEWAL_DAYS SSL_FORCE_HTTPS
export CDN_ENABLED CDN_PROVIDER CDN_DOMAIN CDN_API_KEY
export MONITORING_ENABLED MONITORING_PROVIDER ALERTING_ENABLED ALERTING_PROVIDER
export DEV_TOOLS_ENABLED DEBUG_MODE_ENABLED PROFILING_ENABLED TESTING_ENABLED
export DEFAULT_LANGUAGE SUPPORTED_LANGUAGES LANGUAGE_DETECTION FALLBACK_LANGUAGE
export DEFAULT_TIMEZONE TIMEZONE_DETECTION DATE_FORMAT TIME_FORMAT
export DEFAULT_THEME SUPPORTED_THEMES THEME_DETECTION CUSTOM_THEME_ENABLED
export FEATURE_USER_REGISTRATION FEATURE_USER_LOGIN FEATURE_SOCIAL_LOGIN FEATURE_TWO_FACTOR_AUTH
export FEATURE_EMAIL_VERIFICATION FEATURE_PASSWORD_RESET FEATURE_USER_PROFILES
export FEATURE_POST_CREATION FEATURE_COMMENTS FEATURE_LIKES FEATURE_FOLLOWING
export FEATURE_ACTIVITIES FEATURE_NOTIFICATIONS FEATURE_SEARCH FEATURE_ANALYTICS FEATURE_ADMIN_PANEL

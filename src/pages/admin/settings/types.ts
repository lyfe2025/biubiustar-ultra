// 系统设置相关类型定义
export interface SystemSettings {
  // 基本设置
  site_name: string
  site_description: string
  site_logo?: string
  site_favicon?: string
  
  // 用户设置
  allow_registration: boolean
  require_email_verification: boolean
  default_user_role: 'user' | 'moderator'
  max_posts_per_day: number
  max_file_size_mb: number
  
  // 内容设置
  enable_content_moderation: boolean
  auto_approve_posts: boolean
  enable_comments: boolean
  enable_likes: boolean
  enable_shares: boolean
  
  // 邮件设置
  smtp_host: string
  smtp_port: number
  smtp_username: string
  smtp_password: string
  smtp_encryption: 'none' | 'tls' | 'ssl'
  from_email: string
  from_name: string
  
  // 存储设置
  storage_provider: 'local' | 'supabase' | 's3'
  max_storage_size_gb: number
  allowed_file_types: string[]
  
  // 安全设置
  enable_rate_limiting: boolean
  max_login_attempts: number
  session_timeout_hours: number
  enable_two_factor: boolean
  
  // 通知设置
  enable_push_notifications: boolean
  enable_email_notifications: boolean
  enable_sms_notifications: boolean
  
  // 主题设置
  primary_color: string
  secondary_color: string
  enable_dark_mode: boolean
  custom_css?: string
  
  // 语言设置
  default_language: 'zh' | 'en' | 'vi'
  supported_languages: string[]
  
  // 缓存设置
  enable_redis_cache: boolean
  cache_ttl_minutes: number
  
  // 备份设置
  enable_auto_backup: boolean
  backup_frequency: 'daily' | 'weekly' | 'monthly'
  backup_retention_days: number
}

export interface SettingsSectionProps {
  settings: SystemSettings | null
  loading: boolean
  onUpdate: (updates: Partial<SystemSettings>) => void
}

export interface BasicSettingsData {
  site_name: string
  site_description: string
  site_logo?: string
  site_favicon?: string
}

export interface UserSettingsData {
  allow_registration: boolean
  require_email_verification: boolean
  default_user_role: 'user' | 'moderator'
  max_posts_per_day: number
  max_file_size_mb: number
}

export interface ContentSettingsData {
  enable_content_moderation: boolean
  auto_approve_posts: boolean
  enable_comments: boolean
  enable_likes: boolean
  enable_shares: boolean
}

export interface EmailSettingsData {
  smtp_host: string
  smtp_port: number
  smtp_username: string
  smtp_password: string
  smtp_encryption: 'none' | 'tls' | 'ssl'
  from_email: string
  from_name: string
}

export interface SecuritySettingsData {
  enable_rate_limiting: boolean
  max_login_attempts: number
  session_timeout_hours: number
  enable_two_factor: boolean
}

export interface ThemeSettingsData {
  primary_color: string
  secondary_color: string
  enable_dark_mode: boolean
  custom_css?: string
}

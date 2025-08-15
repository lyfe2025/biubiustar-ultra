// 系统设置相关类型定义
export interface SystemSettings {
  [key: string]: { value: any; type: string; description: string; is_public: boolean }
}

export interface SettingsSectionProps {
  settings: SystemSettings | null
  loading: boolean
  onUpdate: (updates: Record<string, any>) => void
  onSaveComplete?: () => void // 保存完成后的回调
}

export interface BasicSettingsData {
  site_name: string
  site_description: string
  site_logo?: string
  site_favicon?: string
  contact_email: string
  site_domain: string
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

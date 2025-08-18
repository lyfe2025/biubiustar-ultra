/**
 * Settings Service
 * 处理前台系统设置相关的API调用
 */

export interface SystemSettings {
  // 基本设置
  'basic.siteName': string
  'basic.siteDescription': string
  'basic.siteDescriptionZh': string
  'basic.siteDescriptionZhTw': string
  'basic.siteDescriptionEn': string
  'basic.siteDescriptionVi': string
  'basic.siteLogo': string
  'basic.siteFavicon': string
  'basic.contactEmail': string
  'basic.siteDomain': string
  'basic.timezone': string

  // 语言设置
  'language.defaultLanguage': string
  'language.supportedLanguages': string[]
  'language.enableMultiLanguage': boolean

  // 用户设置
  'user.allowRegistration': boolean
  'user.requireEmailVerification': boolean
  'user.defaultRole': string
  'user.maxLoginAttempts': number
  'user.sessionTimeout': number

  // 内容设置
  'content.requireApproval': boolean
  'content.allowComments': boolean
  'content.maxFileSize': number
  'content.allowedFileTypes': string[]

  // 安全设置
  'security.passwordMinLength': number
  'security.requireSpecialChars': boolean
  'security.enableTwoFactor': boolean
  'security.sessionTimeout': number

  // 通知设置
  'notification.emailNotifications': boolean
  'notification.systemNotifications': boolean
  'notification.marketingEmails': boolean

  // 缓存设置
  'cache.enableCache': boolean
  'cache.cacheTimeout': number
  'cache.cacheStrategy': string
}

class SettingsService {
  private baseUrl: string
  private cache: Map<string, { data: Partial<SystemSettings>; timestamp: number }> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5分钟缓存

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || ''
  }

  /**
   * 获取公开的系统设置
   */
  async getPublicSettings(): Promise<Partial<SystemSettings>> {
    const cacheKey = 'public_settings'
    const cached = this.cache.get(cacheKey)
    
    // 检查缓存
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const response = await fetch(this.baseUrl ? `${this.baseUrl}/api/settings/public` : '/api/settings/public', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const settings = await response.json()
      
      // 缓存结果
      this.cache.set(cacheKey, {
        data: settings,
        timestamp: Date.now()
      })

      return settings
    } catch (error) {
      console.error('Failed to fetch public settings:', error)
      // 返回默认设置
      return this.getDefaultSettings()
    }
  }

  /**
   * 获取特定设置项
   */
  async getSetting<T = unknown>(key: keyof SystemSettings): Promise<T | null> {
    const settings = await this.getPublicSettings()
    return settings[key] as T || null
  }

  /**
   * 批量获取设置项
   */
  async getSettings<T = unknown>(keys: (keyof SystemSettings)[]): Promise<Partial<Record<keyof SystemSettings, T>>> {
    const settings = await this.getPublicSettings()
    const result: Partial<Record<keyof SystemSettings, T>> = {}
    
    keys.forEach(key => {
      if (settings[key] !== undefined) {
        result[key] = settings[key] as T
      }
    })
    
    return result
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 获取默认设置（当API调用失败时使用）
   */
  private getDefaultSettings(): Partial<SystemSettings> {
    return {
      'basic.siteName': 'BiuBiuStar',
      'basic.siteDescription': '一个现代化的社交平台',
      'basic.siteDescriptionZh': '一个现代化的社交平台',
      'basic.siteDescriptionZhTw': '一個現代化的社交平台',
      'basic.siteDescriptionEn': 'A modern social platform',
      'basic.siteDescriptionVi': 'Một nền tảng xã hội hiện đại',
      'basic.contactEmail': 'contact@biubiustar.com',
      'basic.siteDomain': 'biubiustar.com',
      'basic.timezone': 'Asia/Shanghai',
      'language.defaultLanguage': 'zh-CN',
      'language.supportedLanguages': ['zh-CN', 'zh-TW', 'en', 'vi'],
      'language.enableMultiLanguage': true,
      'user.allowRegistration': true,
      'user.requireEmailVerification': false,
      'user.defaultRole': 'user',
      'user.maxLoginAttempts': 5,
      'user.sessionTimeout': 24 * 60 * 60 * 1000, // 24小时
      'content.requireApproval': false,
      'content.allowComments': true,
      'content.maxFileSize': 10 * 1024 * 1024, // 10MB
      'content.allowedFileTypes': ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
      'security.passwordMinLength': 8,
      'security.requireSpecialChars': false,
      'security.enableTwoFactor': false,
      'security.sessionTimeout': 24 * 60 * 60 * 1000, // 24小时
      'notification.emailNotifications': true,
      'notification.systemNotifications': true,
      'notification.marketingEmails': false,
      'cache.enableCache': true,
      'cache.cacheTimeout': 5 * 60 * 1000, // 5分钟
      'cache.cacheStrategy': 'memory'
    }
  }
}

// 创建单例实例
export const settingsService = new SettingsService()

// 在全局对象上暴露清除缓存方法，供管理后台使用
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).clearSettingsCache = () => {
    console.log('清除前台设置缓存')
    settingsService.clearCache()
  }
}

export default settingsService
import { useState, useEffect, useCallback } from 'react'
import { settingsService, SystemSettings } from '../services/SettingsService'

interface UseSettingsReturn {
  settings: Partial<SystemSettings>
  loading: boolean
  error: string | null
  getSetting: <T = any>(key: keyof SystemSettings) => T | null
  getSettings: <T = any>(keys: (keyof SystemSettings)[]) => Partial<Record<keyof SystemSettings, T>>
  refreshSettings: () => Promise<void>
}

/**
 * 系统设置Hook
 * 提供前台组件访问系统设置的能力
 */
export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<Partial<SystemSettings>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const publicSettings = await settingsService.getPublicSettings()
      setSettings(publicSettings)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载设置失败')
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const getSetting = useCallback(<T = any>(key: keyof SystemSettings): T | null => {
    return (settings[key] as T) || null
  }, [settings])

  const getSettings = useCallback(<T = any>(keys: (keyof SystemSettings)[]): Partial<Record<keyof SystemSettings, T>> => {
    const result: Partial<Record<keyof SystemSettings, T>> = {}
    keys.forEach(key => {
      if (settings[key] !== undefined) {
        result[key] = settings[key] as T
      }
    })
    return result
  }, [settings])

  const refreshSettings = useCallback(async () => {
    settingsService.clearCache()
    await loadSettings()
  }, [loadSettings])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return {
    settings,
    loading,
    error,
    getSetting,
    getSettings,
    refreshSettings
  }
}

/**
 * 获取特定设置项的Hook
 */
export function useSetting<T = any>(key: keyof SystemSettings, defaultValue?: T): {
  value: T | null
  loading: boolean
  error: string | null
} {
  const { settings, loading, error } = useSettings()
  
  const value = (settings[key] as T) || defaultValue || null
  
  return {
    value,
    loading,
    error
  }
}

/**
 * 网站基本信息Hook
 */
export function useSiteInfo() {
  const { getSettings, loading, error } = useSettings()
  
  const siteInfo = getSettings([
    'basic.siteName',
    'basic.siteDescription',
    'basic.siteLogo',
    'basic.siteFavicon',
    'basic.contactEmail'
  ])
  
  return {
    siteName: siteInfo['basic.siteName'] as string || 'BiuBiuStar',
    siteDescription: siteInfo['basic.siteDescription'] as string || '一个现代化的社交平台',
    siteLogo: siteInfo['basic.siteLogo'] as string || '',
    siteIcon: siteInfo['basic.siteFavicon'] as string || '',
    contactEmail: siteInfo['basic.contactEmail'] as string || 'contact@biubiustar.com',
    loading,
    error
  }
}

/**
 * 用户设置Hook
 */
export function useUserSettings() {
  const { getSettings, loading, error } = useSettings()
  
  const userSettings = getSettings([
    'user.allowRegistration',
    'user.requireEmailVerification',
    'user.defaultRole',
    'user.maxLoginAttempts',
    'user.sessionTimeout'
  ])
  
  return {
    allowRegistration: userSettings['user.allowRegistration'] as boolean ?? true,
    requireEmailVerification: userSettings['user.requireEmailVerification'] as boolean ?? false,
    defaultRole: userSettings['user.defaultRole'] as string || 'user',
    maxLoginAttempts: userSettings['user.maxLoginAttempts'] as number || 5,
    sessionTimeout: userSettings['user.sessionTimeout'] as number || 24 * 60 * 60 * 1000,
    loading,
    error
  }
}

/**
 * 内容设置Hook
 */
export function useContentSettings() {
  const { getSettings, loading, error } = useSettings()
  
  const contentSettings = getSettings([
    'content.requireApproval',
    'content.allowComments',
    'content.maxFileSize',
    'content.allowedFileTypes'
  ])
  
  return {
    requireApproval: contentSettings['content.requireApproval'] as boolean ?? false,
    allowComments: contentSettings['content.allowComments'] as boolean ?? true,
    maxFileSize: contentSettings['content.maxFileSize'] as number || 10 * 1024 * 1024,
    allowedFileTypes: contentSettings['content.allowedFileTypes'] as string[] || ['jpg', 'jpeg', 'png', 'gif'],
    loading,
    error
  }
}

/**
 * 安全设置Hook
 */
export function useSecuritySettings() {
  const { getSettings, loading, error } = useSettings()
  
  const securitySettings = getSettings([
    'security.passwordMinLength',
    'security.requireSpecialChars',
    'security.enableTwoFactor',
    'security.sessionTimeout'
  ])
  
  return {
    passwordMinLength: securitySettings['security.passwordMinLength'] as number || 8,
    requireSpecialChars: securitySettings['security.requireSpecialChars'] as boolean ?? false,
    enableTwoFactor: securitySettings['security.enableTwoFactor'] as boolean ?? false,
    sessionTimeout: securitySettings['security.sessionTimeout'] as number || 24 * 60 * 60 * 1000,
    loading,
    error
  }
}
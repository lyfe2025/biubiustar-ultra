import React, { useState } from 'react'
import { Shield, Lock, Clock, Key } from 'lucide-react'
import { useLanguage } from '../../../contexts/language'
import { SettingsSectionProps, SecuritySettingsData } from './types'

const SecuritySettings: React.FC<SettingsSectionProps> = ({ settings, loading, onUpdate }) => {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<SecuritySettingsData>({
    enable_rate_limiting: settings?.enable_rate_limiting?.value || true,
    max_login_attempts: settings?.max_login_attempts?.value || 5,
    session_timeout_hours: settings?.session_timeout_hours?.value || 24,
    enable_two_factor: settings?.enable_two_factor?.value || false
  })

  // 同步settings变化到formData
  React.useEffect(() => {
    if (settings) {
      setFormData({
        enable_rate_limiting: settings.enable_rate_limiting?.value || true,
        max_login_attempts: settings.max_login_attempts?.value || 5,
        session_timeout_hours: settings.session_timeout_hours?.value || 24,
        enable_two_factor: settings.enable_two_factor?.value || false
      })
    }
  }, [settings])

  const handleChange = <K extends keyof SecuritySettingsData>(
    field: K,
    value: SecuritySettingsData[K]
  ) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    // 移除自动保存，改为手动保存
    // onUpdate(newData)
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {t('admin.settings.security.title')}
        </h3>
      </div>

      {/* 访问限制 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900">
            <Shield className="w-4 h-4 inline mr-2" />
            {t('admin.settings.security.enableRateLimit')}
          </label>
          <p className="text-sm text-gray-500 mt-1">
            {t('admin.settings.security.enableRateLimitDescription')}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.enable_rate_limiting}
            onChange={(e) => handleChange('enable_rate_limiting', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {/* 登录尝试次数 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Lock className="w-4 h-4 inline mr-2" />
          {t('admin.settings.security.maxLoginAttempts')}
        </label>
        <input
          type="number"
          min="3"
          max="20"
          value={formData.max_login_attempts}
          onChange={(e) => handleChange('max_login_attempts', parseInt(e.target.value) || 5)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <p className="mt-1 text-sm text-gray-500">
          {t('admin.settings.security.maxLoginAttemptsDescription')}
        </p>
      </div>

      {/* 会话超时 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Clock className="w-4 h-4 inline mr-2" />
          {t('admin.settings.security.sessionTimeout')}
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="1"
            max="168"
            value={formData.session_timeout_hours}
            onChange={(e) => handleChange('session_timeout_hours', parseInt(e.target.value) || 24)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <span className="text-sm text-gray-500">{t('admin.settings.security.hours')}</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {t('admin.settings.security.sessionTimeoutDescription')}
        </p>
      </div>

      {/* 双因子认证 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900">
            <Key className="w-4 h-4 inline mr-2" />
            {t('admin.settings.security.enableTwoFactor')}
          </label>
          <p className="text-sm text-gray-500 mt-1">
            {t('admin.settings.security.enableTwoFactorDescription')}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.enable_two_factor}
            onChange={(e) => handleChange('enable_two_factor', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {/* 安全建议 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          {t('admin.settings.security.recommendations')}
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• {t('admin.settings.security.recommendation1')}</li>
          <li>• {t('admin.settings.security.recommendation2')}</li>
          <li>• {t('admin.settings.security.recommendation3')}</li>
          <li>• {t('admin.settings.security.recommendation4')}</li>
        </ul>
      </div>
    </div>
  )
}

export default SecuritySettings

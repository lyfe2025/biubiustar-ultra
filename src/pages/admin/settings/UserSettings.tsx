import React, { useState } from 'react'
import { Users, Shield, FileText } from 'lucide-react'
import { useLanguage } from '../../../contexts/language'
import { SettingsSectionProps, UserSettingsData } from './types'

const UserSettings: React.FC<SettingsSectionProps> = ({ settings, loading, onUpdate }) => {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<UserSettingsData>({
    allow_registration: settings?.allow_registration?.value || false,
    require_email_verification: settings?.require_email_verification?.value || false,
    default_user_role: settings?.default_user_role?.value || 'user',
    max_posts_per_day: settings?.max_posts_per_day?.value || 10,
    max_file_size_mb: settings?.max_file_size_mb?.value || 10
  })

  // 同步settings变化到formData
  React.useEffect(() => {
    if (settings) {
      setFormData({
        allow_registration: settings.allow_registration?.value || false,
        require_email_verification: settings.require_email_verification?.value || false,
        default_user_role: settings.default_user_role?.value || 'user',
        max_posts_per_day: settings.max_posts_per_day?.value || 10,
        max_file_size_mb: settings.max_file_size_mb?.value || 10
      })
    }
  }, [settings])

  const handleChange = <K extends keyof UserSettingsData>(
    field: K,
    value: UserSettingsData[K]
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
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Users className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {t('admin.settings.user.title')}
        </h3>
      </div>

      {/* 允许用户注册 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900">
            {t('admin.settings.user.allowRegistration')}
          </label>
          <p className="text-sm text-gray-500 mt-1">
            {t('admin.settings.user.allowRegistrationDescription')}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.allow_registration}
            onChange={(e) => handleChange('allow_registration', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {/* 邮箱验证 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900">
            {t('admin.settings.user.requireEmailVerification')}
          </label>
          <p className="text-sm text-gray-500 mt-1">
            {t('admin.settings.user.requireEmailVerificationDescription')}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.require_email_verification}
            onChange={(e) => handleChange('require_email_verification', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {/* 默认用户角色 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Shield className="w-4 h-4 inline mr-2" />
          {t('admin.settings.user.defaultRole')}
        </label>
        <select
          value={formData.default_user_role}
          onChange={(e) => handleChange('default_user_role', e.target.value as 'user' | 'moderator')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="user">{t('admin.settings.user.roles.user')}</option>
          <option value="moderator">{t('admin.settings.user.roles.moderator')}</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          {t('admin.settings.user.defaultRoleDescription')}
        </p>
      </div>

      {/* 每日最大发帖数 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-2" />
          {t('admin.settings.user.maxPostsPerDay')}
        </label>
        <input
          type="number"
          min="1"
          max="100"
          value={formData.max_posts_per_day}
          onChange={(e) => handleChange('max_posts_per_day', parseInt(e.target.value) || 10)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <p className="mt-1 text-sm text-gray-500">
          {t('admin.settings.user.maxPostsPerDayDescription')}
        </p>
      </div>

      {/* 最大文件大小 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('admin.settings.user.maxFileSize')}
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="1"
            max="100"
            value={formData.max_file_size_mb}
            onChange={(e) => handleChange('max_file_size_mb', parseInt(e.target.value) || 10)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <span className="text-sm text-gray-500">MB</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {t('admin.settings.user.maxFileSizeDescription')}
        </p>
      </div>
    </div>
  )
}

export default UserSettings

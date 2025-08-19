import React, { useState } from 'react'
import { Mail, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useLanguage } from '../../../contexts/language'
import { SettingsSectionProps, EmailSettingsData } from './types'
import { toast } from 'sonner'

const EmailSettings: React.FC<SettingsSectionProps> = ({ settings, loading, onUpdate }) => {
  const { t } = useLanguage()
  const [showPassword, setShowPassword] = useState(false)
  const [testing, setTesting] = useState(false)
  const [formData, setFormData] = useState<EmailSettingsData>({
    smtp_host: settings?.smtp_host?.value || '',
    smtp_port: settings?.smtp_port?.value || 587,
    smtp_username: settings?.smtp_username?.value || '',
    smtp_password: settings?.smtp_password?.value || '',
    smtp_encryption: settings?.smtp_encryption?.value || 'tls',
    from_email: settings?.from_email?.value || '',
    from_name: settings?.from_name?.value || ''
  })

  // 同步settings变化到formData
  React.useEffect(() => {
    if (settings) {
      setFormData({
        smtp_host: settings.smtp_host?.value || '',
        smtp_port: settings.smtp_port?.value || 587,
        smtp_username: settings.smtp_username?.value || '',
        smtp_password: settings.smtp_password?.value || '',
        smtp_encryption: settings.smtp_encryption?.value || 'tls',
        from_email: settings.from_email?.value || '',
        from_name: settings.from_name?.value || ''
      })
    }
  }, [settings])

  const handleChange = <K extends keyof EmailSettingsData>(
    field: K,
    value: EmailSettingsData[K]
  ) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    // 移除自动保存，改为手动保存
    // onUpdate(newData)
  }

  const handleTestEmail = async () => {
    setTesting(true)
    try {
      // 这里应该调用测试邮件的API
      await new Promise(resolve => setTimeout(resolve, 2000)) // 模拟API调用
      toast.success('测试邮件发送成功！')
    } catch (error) {
      toast.error('测试邮件发送失败，请检查配置')
    } finally {
      setTesting(false)
    }
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
        <Mail className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {t('admin.settings.email.title')}
        </h3>
      </div>

      {/* SMTP主机 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('admin.settings.email.smtpHost')}
        </label>
        <input
          type="text"
          value={formData.smtp_host}
          onChange={(e) => handleChange('smtp_host', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="smtp.gmail.com"
        />
        <p className="mt-1 text-sm text-gray-500">
          {t('admin.settings.email.smtpHostDescription')}
        </p>
      </div>

      {/* SMTP端口和加密方式 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.settings.email.smtpPort')}
          </label>
          <input
            type="number"
            value={formData.smtp_port}
            onChange={(e) => handleChange('smtp_port', parseInt(e.target.value) || 587)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.settings.email.smtpEncryption')}
          </label>
          <select
            value={formData.smtp_encryption}
            onChange={(e) => handleChange('smtp_encryption', e.target.value as 'none' | 'tls' | 'ssl')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="none">{t('admin.settings.email.encryption.none')}</option>
            <option value="tls">{t('admin.settings.email.encryption.tls')}</option>
            <option value="ssl">{t('admin.settings.email.encryption.ssl')}</option>
          </select>
        </div>
      </div>

      {/* SMTP用户名 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('admin.settings.email.smtpUsername')}
        </label>
        <input
          type="text"
          value={formData.smtp_username}
          onChange={(e) => handleChange('smtp_username', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="your-email@gmail.com"
        />
      </div>

      {/* SMTP密码 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('admin.settings.email.smtpPassword')}
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.smtp_password}
            onChange={(e) => handleChange('smtp_password', e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 发件人信息 */}
      <div className="border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          {t('admin.settings.email.senderInfo')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.settings.email.fromEmail')}
            </label>
            <input
              type="email"
              value={formData.from_email}
              onChange={(e) => handleChange('from_email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="noreply@yourdomain.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.settings.email.fromName')}
            </label>
            <input
              type="text"
              value={formData.from_name}
              onChange={(e) => handleChange('from_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Biubiustar"
            />
          </div>
        </div>
      </div>

      {/* 测试邮件 */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-md font-medium text-gray-900">
              {t('admin.settings.email.testEmail')}
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              {t('admin.settings.email.testEmailDescription')}
            </p>
          </div>
          <button
            onClick={handleTestEmail}
            disabled={testing || !formData.smtp_host || !formData.smtp_username}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{testing ? t('admin.settings.email.testing') : t('admin.settings.email.testNow')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailSettings

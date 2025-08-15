import React, { useState } from 'react'
import { Globe, Upload, Image } from 'lucide-react'
import { useLanguage } from '../../../contexts/language'
import { SettingsSectionProps, BasicSettingsData } from './types'

const BasicSettings: React.FC<SettingsSectionProps> = ({ settings, loading, onUpdate }) => {
  const { t } = useLanguage()
  
  // 默认数据
  const defaultData: BasicSettingsData = {
    site_name: 'BiuBiuStar',
    site_description: '一个现代化的社交平台，连接世界各地的用户',
    site_logo: '/logo-tubiao.svg',
    site_favicon: '/favicon.svg'
  }
  
  const [formData, setFormData] = useState<BasicSettingsData>({
    site_name: settings?.['basic.siteName']?.value || defaultData.site_name,
    site_description: settings?.['basic.siteDescription']?.value || defaultData.site_description,
    site_logo: settings?.['basic.siteLogo']?.value || defaultData.site_logo,
    site_favicon: settings?.['basic.siteFavicon']?.value || defaultData.site_favicon
  })

  // 同步settings变化到formData
  React.useEffect(() => {
    if (settings) {
      setFormData({
        site_name: settings['basic.siteName']?.value || defaultData.site_name,
        site_description: settings['basic.siteDescription']?.value || defaultData.site_description,
        site_logo: settings['basic.siteLogo']?.value || defaultData.site_logo,
        site_favicon: settings['basic.siteFavicon']?.value || defaultData.site_favicon
      })
    }
  }, [settings])

  const handleChange = (field: keyof BasicSettingsData, value: string | undefined) => {
    // 确保值不为undefined，使用默认值
    const safeValue = value || defaultData[field]
    const newData = { ...formData, [field]: safeValue }
    setFormData(newData)
    
    // 通知父组件更新待保存的数据（不立即保存到数据库）
    const settingsToSave = {
      'basic.siteName': field === 'site_name' ? safeValue : formData.site_name,
      'basic.siteDescription': field === 'site_description' ? safeValue : formData.site_description,
      'basic.siteLogo': field === 'site_logo' ? safeValue : formData.site_logo,
      'basic.siteFavicon': field === 'site_favicon' ? safeValue : formData.site_favicon
    }
    onUpdate(settingsToSave)
  }

  const handleFileUpload = async (field: 'site_logo' | 'site_favicon', file: File) => {
    try {
      // 文件大小检查（限制为5MB）
      if (file.size > 5 * 1024 * 1024) {
        alert('文件大小不能超过5MB')
        return
      }

      // 文件类型检查
      if (!file.type.startsWith('image/')) {
        alert('只能上传图片文件')
        return
      }

      // 转换为base64数据URL
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        handleChange(field, dataUrl)
      }
      reader.onerror = () => {
        alert('文件读取失败')
      }
      reader.readAsDataURL(file)

    } catch (error) {
      console.error('文件上传失败:', error)
      alert('文件上传失败')
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Globe className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {t('admin.settings.basic.title')}
        </h3>
      </div>

      {/* 站点名称 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('admin.settings.basic.siteName')}
        </label>
        <input
          type="text"
          value={formData.site_name}
          onChange={(e) => handleChange('site_name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder={t('admin.settings.basic.siteNamePlaceholder')}
        />
        <p className="mt-1 text-sm text-gray-500">
          {t('admin.settings.basic.siteNameDescription')}
        </p>
      </div>

      {/* 站点描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('admin.settings.basic.siteDescription')}
        </label>
        <textarea
          value={formData.site_description}
          onChange={(e) => handleChange('site_description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder={t('admin.settings.basic.siteDescriptionPlaceholder')}
        />
        <p className="mt-1 text-sm text-gray-500">
          {t('admin.settings.basic.siteDescriptionDescription')}
        </p>
      </div>

      {/* 站点Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('admin.settings.basic.siteLogo')}
        </label>
        <div className="flex items-center space-x-4">
          {formData.site_logo && (
            <img 
              src={formData.site_logo} 
              alt="Site Logo" 
              className="w-16 h-16 object-contain border border-gray-300 rounded-lg"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) handleFileUpload('site_logo', file)
                  }
                  input.click()
                }}
              >
                <Upload className="w-4 h-4" />
                <span>{t('admin.settings.basic.uploadLogo')}</span>
              </button>
              {formData.site_logo && formData.site_logo !== defaultData.site_logo && (
                <button
                  type="button"
                  onClick={() => handleChange('site_logo', defaultData.site_logo)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  {t('admin.settings.basic.removeLogo')}
                </button>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {t('admin.settings.basic.logoDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* 站点图标 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('admin.settings.basic.siteFavicon')}
        </label>
        <div className="flex items-center space-x-4">
          {formData.site_favicon && (
            <img 
              src={formData.site_favicon} 
              alt="Site Favicon" 
              className="w-8 h-8 object-contain border border-gray-300 rounded"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = '.ico,.png,.gif,.jpg,.jpeg'
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) handleFileUpload('site_favicon', file)
                  }
                  input.click()
                }}
              >
                <Image className="w-4 h-4" />
                <span>{t('admin.settings.basic.uploadFavicon')}</span>
              </button>
              {formData.site_favicon && formData.site_favicon !== defaultData.site_favicon && (
                <button
                  type="button"
                  onClick={() => handleChange('site_favicon', defaultData.site_favicon)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  {t('admin.settings.basic.removeFavicon')}
                </button>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {t('admin.settings.basic.faviconDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BasicSettings

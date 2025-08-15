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
  
  const [uploading, setUploading] = useState<{
    site_logo: boolean
    site_favicon: boolean
  }>({
    site_logo: false,
    site_favicon: false
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
      // 设置上传状态
      setUploading(prev => ({ ...prev, [field]: true }))

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

      // 获取认证token
      const token = localStorage.getItem('adminToken') || 
                   (localStorage.getItem('supabase.auth.token') && 
                    JSON.parse(localStorage.getItem('supabase.auth.token')!).access_token)

      if (!token) {
        alert('未找到认证信息，请重新登录')
        return
      }

      // 创建FormData，包含文件和类型信息
      const uploadFormData = new FormData()
      uploadFormData.append('image', file)
      uploadFormData.append('type', field === 'site_logo' ? 'logo' : 'favicon')

      // 上传站点资源到专用端点
      const response = await fetch('/api/admin/upload/site-asset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      })

      const result = await response.json()

      if (response.ok) {
        // 使用固定的文件路径（自动覆盖旧文件）
        handleChange(field, result.data.path)
        console.log(`站点${result.data.type}上传成功:`, result.data)
        
        // 图片上传成功后，自动保存到数据库，确保前台能立即获取最新设置
        try {
          const settingsToSave = {
            'basic.siteName': formData.site_name,
            'basic.siteDescription': formData.site_description,
            'basic.siteLogo': field === 'site_logo' ? result.data.path : formData.site_logo,
            'basic.siteFavicon': field === 'site_favicon' ? result.data.path : formData.site_favicon
          }
          
          console.log('自动保存图片设置到数据库:', settingsToSave)
          // 直接保存到数据库，不等待全局保存按钮
          await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(settingsToSave)
          })
          
          console.log('图片设置已自动保存到数据库')
        } catch (saveError) {
          console.warn('自动保存图片设置失败，但图片已上传成功:', saveError)
        }
        
        // 添加时间戳参数避免浏览器缓存
        const pathWithTimestamp = `${result.data.path}?t=${Date.now()}`
        
        // 立即更新预览显示
        setTimeout(() => {
          const imgElements = document.querySelectorAll(`img[src*="${result.data.path.split('?')[0]}"]`)
          imgElements.forEach(img => {
            (img as HTMLImageElement).src = pathWithTimestamp
          })
        }, 100)
        
        // 清空前台设置缓存，强制重新获取最新数据
        setTimeout(() => {
          // 触发前台设置缓存清理
          if (typeof (window as any).clearSettingsCache === 'function') {
            (window as any).clearSettingsCache()
            console.log('已清除前台设置缓存，前台将自动获取最新图片')
          } else {
            console.log('图片上传完成，前台将在缓存过期后获取最新设置')
          }
        }, 500)
        
      } else {
        throw new Error(result.error || '上传失败')
      }

    } catch (error) {
      console.error('文件上传失败:', error)
      alert(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      // 清除上传状态
      setUploading(prev => ({ ...prev, [field]: false }))
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
                disabled={uploading.site_logo}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => {
                  if (uploading.site_logo) return
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
                <Upload className={`w-4 h-4 ${uploading.site_logo ? 'animate-spin' : ''}`} />
                <span>
                  {uploading.site_logo ? '上传中...' : t('admin.settings.basic.uploadLogo')}
                </span>
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
                disabled={uploading.site_favicon}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => {
                  if (uploading.site_favicon) return
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
                <Image className={`w-4 h-4 ${uploading.site_favicon ? 'animate-spin' : ''}`} />
                <span>
                  {uploading.site_favicon ? '上传中...' : t('admin.settings.basic.uploadFavicon')}
                </span>
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

import React, { useState } from 'react'
import { Globe, Upload, Image } from 'lucide-react'
import { useLanguage } from '../../../contexts/language'
import { toast } from 'sonner'
import { SettingsSectionProps, BasicSettingsData } from './types'

const BasicSettings = React.forwardRef<{ resetEditingState: () => void }, SettingsSectionProps>(({ settings, loading, onUpdate, onSaveComplete }, ref) => {
  const { t } = useLanguage()
  
  // 默认数据 - 仅用于初始化空值，不应覆盖数据库中的实际值
  const defaultData: BasicSettingsData = {
    site_name: '',
    site_description: '',
    site_description_zh: '',
    site_description_zh_tw: '',
    site_description_en: '',
    site_description_vi: '',
    site_logo: '',
    site_favicon: '',
    contact_email: '',
    site_domain: '',
    default_language: 'zh'
  }
  
  // 表单数据状态
  const [formData, setFormData] = useState<BasicSettingsData>(defaultData)
  const [uploading, setUploading] = useState<{ site_logo: boolean; site_favicon: boolean }>({
    site_logo: false,
    site_favicon: false
  })
  // 编辑状态标记，防止保存后settings更新时覆盖用户输入
  const [isEditing, setIsEditing] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)

  // 重置编辑状态的方法
  const resetEditingState = () => {
    setIsEditing(false)
  }

  // 暴露重置方法给父组件
  React.useImperativeHandle(ref, () => ({
    resetEditingState
  }), [])

  // 同步父组件传递的设置到本地表单数据
  React.useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      const newFormData = {
        site_name: settings['basic.siteName']?.value ?? '',
        site_description: settings['basic.siteDescription']?.value ?? '',
        site_description_zh: settings['basic.siteDescriptionZh']?.value ?? '',
        site_description_zh_tw: settings['basic.siteDescriptionZhTw']?.value ?? '',
        site_description_en: settings['basic.siteDescriptionEn']?.value ?? '',
        site_description_vi: settings['basic.siteDescriptionVi']?.value ?? '',
        site_logo: settings['basic.siteLogo']?.value ?? '',
        site_favicon: settings['basic.siteFavicon']?.value ?? '',
        contact_email: settings['basic.contactEmail']?.value ?? '',
        site_domain: settings['basic.siteDomain']?.value ?? '',
        default_language: (settings['basic.defaultLanguage']?.value as 'zh' | 'zh-TW' | 'en' | 'vi') ?? 'zh'
      }
      
      // 检查是否有实际数据（不是全部为空）
      const hasData = Object.values(newFormData).some(value => value !== '' && value !== null && value !== undefined)
      
      if (hasData || !hasInitialized) {
        setFormData(newFormData)
        setHasInitialized(true)
        // 只有在非编辑状态下才重置编辑状态
        if (!isEditing) {
          setIsEditing(false)
        }
      }
      
      if (initialLoad) {
        setInitialLoad(false)
      }
    }
  }, [settings, hasInitialized, isEditing])

  // 如果数据为空且不是加载状态，尝试重新获取数据
  React.useEffect(() => {
    if (!loading && !hasInitialized && (!settings || Object.keys(settings).length === 0)) {
      // 延迟一点时间，给父组件机会重新获取数据
      const timer = setTimeout(() => {
        if (!settings || Object.keys(settings).length === 0) {
          console.log('基本设置数据为空，可能需要刷新')
        }
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [loading, settings, hasInitialized])

  const handleChange = (field: keyof BasicSettingsData, value: string | undefined) => {
    // 标记为编辑状态，防止useEffect重置表单数据
    setIsEditing(true)
    
    // 确保值不为undefined，但允许空字符串
    const safeValue = value ?? ''
    const newData = { ...formData, [field]: safeValue }
    setFormData(newData)
    
    // 通知父组件更新待保存的数据（不立即保存到数据库）
    const settingsToSave = {
      'basic.siteName': field === 'site_name' ? safeValue : formData.site_name,
      'basic.siteDescription': field === 'site_description' ? safeValue : formData.site_description,
      'basic.siteDescriptionZh': field === 'site_description_zh' ? safeValue : formData.site_description_zh,
      'basic.siteDescriptionZhTw': field === 'site_description_zh_tw' ? safeValue : formData.site_description_zh_tw,
      'basic.siteDescriptionEn': field === 'site_description_en' ? safeValue : formData.site_description_en,
      'basic.siteDescriptionVi': field === 'site_description_vi' ? safeValue : formData.site_description_vi,
      'basic.siteLogo': field === 'site_logo' ? safeValue : formData.site_logo,
      'basic.siteFavicon': field === 'site_favicon' ? safeValue : formData.site_favicon,
      'basic.contactEmail': field === 'contact_email' ? safeValue : formData.contact_email,
      'basic.siteDomain': field === 'site_domain' ? safeValue : formData.site_domain,
      'basic.defaultLanguage': field === 'default_language' ? safeValue : formData.default_language
    }
    onUpdate(settingsToSave)
  }

  const handleFileUpload = async (field: 'site_logo' | 'site_favicon', file: File) => {
    try {
      // 设置上传状态
      setUploading(prev => ({ ...prev, [field]: true }))

      // 文件大小检查（限制为5MB）
      if (file.size > 5 * 1024 * 1024) {
        toast.error('文件大小不能超过5MB')
        return
      }

      // 文件类型检查
      if (!file.type.startsWith('image/')) {
        toast.error('只能上传图片文件')
        return
      }

      // 获取认证token
      const token = localStorage.getItem('adminToken') || 
                   (localStorage.getItem('supabase.auth.token') && 
                    JSON.parse(localStorage.getItem('supabase.auth.token')!).access_token)

      if (!token) {
        toast.error('未找到认证信息，请重新登录')
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
          // 验证后端返回的类型与前端期望一致
          const expectedType = field === 'site_logo' ? 'logo' : 'favicon'
          const actualType = result.data.type
          
          if (actualType !== expectedType) {
            console.warn(`类型不匹配! 期望: ${expectedType}, 实际: ${actualType}`)
          }
          
          // 只构建需要更新的字段，避免意外覆盖其他字段
          const settingsToSave: Record<string, any> = {
            'basic.siteName': formData.site_name,
            'basic.siteDescription': formData.site_description,
            'basic.siteDescriptionZh': formData.site_description_zh,
            'basic.siteDescriptionZhTw': formData.site_description_zh_tw,
            'basic.siteDescriptionEn': formData.site_description_en,
            'basic.siteDescriptionVi': formData.site_description_vi,
          }
          
          // 严格按照上传字段类型更新对应设置
          if (field === 'site_logo' && actualType === 'logo') {
            settingsToSave['basic.siteLogo'] = result.data.path
            console.log(`更新站点Logo: ${result.data.path}`)
          } else if (field === 'site_favicon' && actualType === 'favicon') {
            settingsToSave['basic.siteFavicon'] = result.data.path
            console.log(`更新站点Favicon: ${result.data.path}`)
          } else {
            console.error('字段类型不匹配，取消自动保存以防止错误覆盖')
            throw new Error(`字段类型不匹配: 上传字段=${field}, 后端类型=${actualType}`)
          }
          
          // 保持其他字段不变
          if (formData.site_logo && field !== 'site_logo') {
            settingsToSave['basic.siteLogo'] = formData.site_logo
          }
          if (formData.site_favicon && field !== 'site_favicon') {
            settingsToSave['basic.siteFavicon'] = formData.site_favicon
          }
          
          console.log('自动保存图片设置到数据库:', settingsToSave)
          // 直接保存到数据库，不等待全局保存按钮
          const saveResponse = await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(settingsToSave)
          })
          
          if (!saveResponse.ok) {
            throw new Error('保存到数据库失败')
          }
          
          console.log('图片设置已自动保存到数据库')
        } catch (saveError) {
          console.error('自动保存图片设置失败:', saveError)
          toast.error(`图片上传成功，但自动保存失败: ${saveError instanceof Error ? saveError.message : '未知错误'}`)
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
      toast.error(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
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

  // 检查是否有数据
  const hasData = settings && Object.keys(settings).length > 0
  const hasBasicData = hasData && Object.keys(settings).some(key => key.startsWith('basic.'))

  // 如果没有数据，显示提示
  if (!hasData || !hasBasicData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-6">
          <Globe className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t('admin.settings.basic.title')}
          </h3>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                数据加载提示
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>当前没有加载到基本设置数据。可能的原因：</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>数据库中没有基本设置数据</li>
                  <li>API接口返回数据为空</li>
                  <li>缓存机制问题</li>
                </ul>
                <p className="mt-2">
                  建议点击页面顶部的"刷新缓存"按钮来重新获取数据。
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 调试信息 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">调试信息</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>Settings 对象: {hasData ? '存在' : '不存在'}</p>
            <p>Settings 键数量: {hasData ? Object.keys(settings).length : 0}</p>
            <p>基本设置键数量: {hasBasicData ? Object.keys(settings).filter(key => key.startsWith('basic.')).length : 0}</p>
            <p>当前时间: {new Date().toLocaleString()}</p>
          </div>
        </div>
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

        {/* 默认语言 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.settings.basic.defaultLanguage')}
          </label>
          <select
            value={formData.default_language}
            onChange={(e) => handleChange('default_language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="zh">{t('admin.settings.basic.languages.zh')}</option>
            <option value="zh-TW">{t('admin.settings.basic.languages.zh-TW')}</option>
            <option value="en">{t('admin.settings.basic.languages.en')}</option>
            <option value="vi">{t('admin.settings.basic.languages.vi')}</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            {t('admin.settings.basic.defaultLanguageDescription')}
          </p>
        </div>

        {/* 站点描述 - 多语言 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.settings.basic.siteDescription')}
          </label>
          
          {/* 简体中文 */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t('common.languages.zh')}
            </label>
            <textarea
              value={formData.site_description_zh}
              onChange={(e) => handleChange('site_description_zh', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={t('admin.settings.basic.siteDescriptionZhPlaceholder')}
            />
          </div>

          {/* 繁体中文 */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t('common.languages.zhTw')}
            </label>
            <textarea
              value={formData.site_description_zh_tw}
              onChange={(e) => handleChange('site_description_zh_tw', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={t('admin.settings.basic.siteDescriptionZhTwPlaceholder')}
            />
          </div>

          {/* 英文 */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t('common.languages.en')}
            </label>
            <textarea
              value={formData.site_description_en}
              onChange={(e) => handleChange('site_description_en', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={t('admin.settings.basic.siteDescriptionEnPlaceholder')}
            />
          </div>

          {/* 越南语 */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t('common.languages.vi')}
            </label>
            <textarea
              value={formData.site_description_vi}
              onChange={(e) => handleChange('site_description_vi', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={t('admin.settings.basic.siteDescriptionViPlaceholder')}
            />
          </div>

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

      {/* 联系邮箱 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('admin.settings.basic.contactEmail')}
        </label>
        <input
          type="email"
          value={formData.contact_email}
          onChange={(e) => handleChange('contact_email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder={t('admin.settings.basic.contactEmailPlaceholder')}
        />
        <p className="mt-1 text-sm text-gray-500">
          {t('admin.settings.basic.contactEmailDescription')}
        </p>
      </div>

      {/* 站点域名 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('admin.settings.basic.siteDomain')}
        </label>
        <input
          type="text"
          value={formData.site_domain}
          onChange={(e) => handleChange('site_domain', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder={t('admin.settings.basic.siteDomainPlaceholder')}
        />
        <p className="mt-1 text-sm text-gray-500">
          {t('admin.settings.basic.siteDomainDescription')}
        </p>
      </div>
    </div>
  )
})

BasicSettings.displayName = 'BasicSettings'

export default BasicSettings

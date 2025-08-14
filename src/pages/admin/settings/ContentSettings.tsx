import React, { useState } from 'react'
import { FileText, Eye, Heart, MessageSquare, Share } from 'lucide-react'
import { useLanguage } from '../../../contexts/language'
import { SettingsSectionProps, ContentSettingsData } from './types'

const ContentSettings: React.FC<SettingsSectionProps> = ({ settings, loading, onUpdate }) => {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<ContentSettingsData>({
    enable_content_moderation: settings?.enable_content_moderation || false,
    auto_approve_posts: settings?.auto_approve_posts || false,
    enable_comments: settings?.enable_comments || true,
    enable_likes: settings?.enable_likes || true,
    enable_shares: settings?.enable_shares || true
  })

  // 同步settings变化到formData
  React.useEffect(() => {
    if (settings) {
      setFormData({
        enable_content_moderation: settings.enable_content_moderation,
        auto_approve_posts: settings.auto_approve_posts,
        enable_comments: settings.enable_comments,
        enable_likes: settings.enable_likes,
        enable_shares: settings.enable_shares
      })
    }
  }, [settings])

  const handleChange = <K extends keyof ContentSettingsData>(
    field: K,
    value: ContentSettingsData[K]
  ) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onUpdate(newData)
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
        <FileText className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {t('admin.settings.content.title')}
        </h3>
      </div>

      {/* 内容审核 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900">
            <Eye className="w-4 h-4 inline mr-2" />
            {t('admin.settings.content.enableModeration')}
          </label>
          <p className="text-sm text-gray-500 mt-1">
            {t('admin.settings.content.enableModerationDescription')}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.enable_content_moderation}
            onChange={(e) => handleChange('enable_content_moderation', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {/* 自动审核 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900">
            {t('admin.settings.content.autoApprove')}
          </label>
          <p className="text-sm text-gray-500 mt-1">
            {t('admin.settings.content.autoApproveDescription')}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.auto_approve_posts}
            onChange={(e) => handleChange('auto_approve_posts', e.target.checked)}
            disabled={!formData.enable_content_moderation}
            className="sr-only peer disabled:opacity-50"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 peer-disabled:opacity-50"></div>
        </label>
      </div>

      <div className="border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          {t('admin.settings.content.interactionFeatures')}
        </h4>
        <div className="space-y-4">
          {/* 评论功能 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                {t('admin.settings.content.enableComments')}
              </label>
              <p className="text-sm text-gray-500 mt-1">
                {t('admin.settings.content.enableCommentsDescription')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enable_comments}
                onChange={(e) => handleChange('enable_comments', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* 点赞功能 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900">
                <Heart className="w-4 h-4 inline mr-2" />
                {t('admin.settings.content.enableLikes')}
              </label>
              <p className="text-sm text-gray-500 mt-1">
                {t('admin.settings.content.enableLikesDescription')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enable_likes}
                onChange={(e) => handleChange('enable_likes', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* 分享功能 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900">
                <Share className="w-4 h-4 inline mr-2" />
                {t('admin.settings.content.enableShares')}
              </label>
              <p className="text-sm text-gray-500 mt-1">
                {t('admin.settings.content.enableSharesDescription')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enable_shares}
                onChange={(e) => handleChange('enable_shares', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContentSettings

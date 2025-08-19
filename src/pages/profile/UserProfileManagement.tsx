import React, { useState, useEffect } from 'react'
import { User, Camera, MapPin, Globe, FileText, Save, X, Edit3 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useLanguage } from '../../contexts/language'
import { formatJoinDate } from '../../utils/dateFormatter'
import { UserProfile, UserProfileManagementProps } from './types'
import { useAuth } from '../../contexts/AuthContext'
import { generateDefaultAvatarUrl, isDefaultAvatar, getUserDefaultAvatarUrl } from '@/utils/avatarGenerator'



const UserProfileManagement: React.FC<UserProfileManagementProps> = ({
  profile,
  isLoading,
  isEditingProfile,
  editForm,
  onEditFormChange,
  onSaveProfile,
  onCancelEdit,
  onStartEdit,
  onAvatarUpload,
  avatarPreview
}) => {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const [dragActive, setDragActive] = useState(false)

  // 生成默认个人资料数据
  const generateDefaultProfileData = (): UserProfile => {
    const defaultName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || t('profile.basic.username')
    return {
      id: user?.id || '',
      username: user?.user_metadata?.username || user?.email?.split('@')[0] || '',
      email: user?.email || '',
      full_name: defaultName,
      bio: '',
      avatar_url: '',
      location: '',
      website: '',
      created_at: user?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      followers_count: 0,
      following_count: 0
    }
  }

  // 获取显示用的个人资料数据（如果没有profile则使用默认数据）
  const displayProfile = profile || generateDefaultProfileData()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onAvatarUpload(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      onAvatarUpload(files[0])
    }
  }

  const generateDefaultAvatar = (name: string) => {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
    
    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-4xl">
        {initials || 'U'}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  // 有个人资料时的管理界面
  return (
    <div className="space-y-6">
      {/* 个人资料卡片 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* 头部区域 */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-32 relative">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          {!isEditingProfile && (
            <button
              onClick={onStartEdit}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all duration-200"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* 内容区域 */}
        <div className="p-6 -mt-16 relative">
          {/* 头像区域 */}
          <div className="flex items-start space-x-6 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
                <img
                  src={
                    avatarPreview ||
                    (displayProfile.avatar_url && !isDefaultAvatar(displayProfile.avatar_url) 
                      ? displayProfile.avatar_url 
                      : getUserDefaultAvatarUrl(displayProfile.full_name || displayProfile.username || 'User', displayProfile.avatar_url)
                    )
                  }
                  alt={displayProfile.full_name || 'User'}
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditingProfile && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            <div className="flex-1 pt-16">
              {isEditingProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('profile.basic.username')}
                    </label>
                    <input
                      type="text"
                      value={editForm.full_name || ''}
                      onChange={(e) => onEditFormChange('full_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={t('profile.placeholders.enterName')}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {displayProfile?.full_name || displayProfile?.username || user?.email?.split('@')[0] || t('profile.basic.username')}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {displayProfile.bio || t('profile.placeholders.noBio')}
                  </p>
                  {user?.email && (
                    <p className="text-sm text-gray-500 mt-1">
                      @{displayProfile?.username || user?.email?.split('@')[0] || t('profile.placeholders.unknown')}
                    </p>
                  )}
                  {user?.created_at && (
                    <p className="text-xs text-gray-400 mt-2">
                      {t('profile.time.joinedOn').replace('{date}', formatJoinDate(user.created_at, language))}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 详细信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 个人简介 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                {t('profile.basic.bio')}
              </label>
              {isEditingProfile ? (
                <textarea
                  value={editForm.bio || ''}
                  onChange={(e) => onEditFormChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder={t('profile.placeholders.introduceYourself')}
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg min-h-[100px]">
                  {displayProfile.bio || t('profile.basic.bio')}
                </p>
              )}
            </div>

            {/* 位置和网站 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {t('profile.basic.location')}
                </label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={editForm.location || ''}
                    onChange={(e) => onEditFormChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={t('profile.placeholders.yourLocation')}
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {displayProfile.location || t('profile.placeholders.noLocation')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  {t('profile.basic.website')}
                </label>
                {isEditingProfile ? (
                  <input
                    type="url"
                    value={editForm.website || ''}
                    onChange={(e) => onEditFormChange('website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={t('profile.placeholders.yourWebsite')}
                  />
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    {displayProfile.website ? (
                      <a
                        href={displayProfile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 hover:underline"
                      >
                        {displayProfile.website}
                      </a>
                    ) : (
                      <span className="text-gray-900">{t('profile.placeholders.noWebsite')}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          {isEditingProfile && (
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={onCancelEdit}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>{t('profile.actions.cancel')}</span>
              </button>
              <button
                onClick={onSaveProfile}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{t('profile.actions.save')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 个人资料统计 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.profileCompleteness.title')}</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{t('profile.profileCompleteness.basicInfo')}</span>
            <span className={cn(
              "text-sm font-medium",
              displayProfile.full_name && displayProfile.bio ? "text-green-600" : "text-orange-600"
            )}>
              {displayProfile.full_name && displayProfile.bio ? t('profile.profileCompleteness.completed') : t('profile.profileCompleteness.incomplete')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{t('profile.profileCompleteness.avatar')}</span>
            <span className={cn(
              "text-sm font-medium",
              displayProfile.avatar_url ? "text-green-600" : "text-orange-600"
            )}>
              {displayProfile.avatar_url ? t('profile.profileCompleteness.completed') : t('profile.profileCompleteness.notSet')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{t('profile.profileCompleteness.location')}</span>
            <span className={cn(
              "text-sm font-medium",
              displayProfile.location ? "text-green-600" : "text-gray-400"
            )}>
              {displayProfile.location ? t('profile.profileCompleteness.completed') : t('profile.profileCompleteness.optional')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{t('profile.profileCompleteness.website')}</span>
            <span className={cn(
              "text-sm font-medium",
              displayProfile.website ? "text-green-600" : "text-gray-400"
            )}>
              {displayProfile.website ? t('profile.profileCompleteness.completed') : t('profile.profileCompleteness.optional')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfileManagement
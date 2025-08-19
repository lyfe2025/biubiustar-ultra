import React from 'react'
import { User, Edit3, Camera, MapPin, Globe, Calendar, Save, X } from 'lucide-react'
import { format } from 'date-fns'
import { useLanguage } from '../../contexts/language'
import { generateDefaultAvatarUrl, isDefaultAvatar } from '../../utils/avatarGenerator'
import { UserProfileCardProps } from './types'

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  profile,
  isLoading,
  isEditingProfile,
  editForm,
  onEditFormChange,
  onSaveProfile,
  onCancelEdit,
  onStartEdit,
  onAvatarUpload
}) => {
  const { t } = useLanguage()

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-start space-x-4">
            <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-gray-300 rounded w-1/3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <User className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">{t('profile.noProfile')}</h3>
        <p className="mt-2 text-sm text-gray-500">{t('profile.createProfile')}</p>
      </div>
    )
  }



  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{t('profile.userProfile')}</h2>
        {!isEditingProfile && (
          <button
            onClick={onStartEdit}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700"
          >
            <Edit3 className="w-4 h-4" />
            <span>{t('profile.edit')}</span>
          </button>
        )}
      </div>

      <div className="flex items-start space-x-6">
        {/* 头像 */}
        <div className="relative">
          {profile.avatar_url && !isDefaultAvatar(profile.avatar_url) ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
            <img
              src={generateDefaultAvatarUrl(profile.username)}
              alt={profile.username}
              className="w-24 h-24 rounded-full border-4 border-white shadow-md"
            />
          )}
          
          {isEditingProfile && (
            <button
              className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) onAvatarUpload(file)
                }
                input.click()
              }}
              title={t('profile.changeAvatar')}
            >
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 用户信息 */}
        <div className="flex-1 space-y-4">
          {isEditingProfile ? (
            // 编辑模式
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.fullName')}
                </label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => onEditFormChange('full_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.bio')}
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => onEditFormChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.location')}
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => onEditFormChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.website')}
                </label>
                <input
                  type="url"
                  value={editForm.website}
                  onChange={(e) => onEditFormChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={onCancelEdit}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>{t('common.cancel')}</span>
                </button>
                <button
                  onClick={onSaveProfile}
                  className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{t('common.save')}</span>
                </button>
              </div>
            </div>
          ) : (
            // 显示模式
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{profile.full_name || profile.username}</h3>
                <p className="text-gray-600">@{profile.username}</p>
              </div>

              {profile.bio && (
                <p className="text-gray-700">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {profile.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}

                {profile.website && (
                  <div className="flex items-center space-x-1">
                    <Globe className="w-4 h-4" />
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}

                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{t('profile.joinedOn').replace('{date}', format(new Date(profile.created_at), 'PPP'))}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfileCard

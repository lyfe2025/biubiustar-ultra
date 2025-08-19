import React from 'react'
import { Edit, MapPin, Globe, Calendar } from 'lucide-react'
import { formatJoinDate } from '../../utils/dateFormatter'
import { useLanguage } from '../../contexts/language'
import { generateDefaultAvatarUrl, isDefaultAvatar, getUserDefaultAvatarUrl } from '../../utils/avatarGenerator'
import { UserProfileCardProps } from './types'
import type { UserProfile } from './types'
import { useAuth } from '../../contexts/AuthContext'

// 生成基于用户注册信息的默认个人资料数据
const generateDefaultProfile = (user: any): UserProfile | null => {
  if (!user) return null;
  
  return {
    id: user?.id || '',
    email: user?.email || '',
    username: user?.user_metadata?.username || user?.email?.split('@')[0] || '',
    full_name: user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email?.split('@')[0] || '',
    bio: '',
    location: '',
    website: '',
    avatar_url: user?.user_metadata?.avatar_url || '',
    created_at: user?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    followers_count: 0,
    following_count: 0
  };
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  profile,
  isLoading,
  onStartEdit
}) => {
  const { t, language } = useLanguage()
  const { user } = useAuth()
   
  // 如果没有profile，使用默认数据
  const displayProfile = profile || generateDefaultProfile(user)

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col items-center animate-pulse">
          <div className="w-24 h-24 bg-gray-300 rounded-full mb-4"></div>
          <div className="space-y-3 w-full max-w-sm">
            <div className="h-6 bg-gray-300 rounded mx-auto w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded mx-auto w-1/2"></div>
            <div className="h-16 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // 注意：现在总是显示个人资料，不再显示创建提示

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* 头部渐变背景区域 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-32 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>
      
      {/* 内容区域 */}
      <div className="p-6 -mt-16 relative">
        {/* 头像区域 - 居中显示 */}
        <div className="flex flex-col items-center">
          <div className="mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img
                  src={displayProfile?.avatar_url && !isDefaultAvatar(displayProfile.avatar_url) 
                    ? displayProfile.avatar_url 
                    : getUserDefaultAvatarUrl(displayProfile?.username || t('profile.basic.username'), displayProfile?.avatar_url)
                  }
                  alt={displayProfile?.full_name || displayProfile?.username || t('profile.basic.username')}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 用户信息区域 - 居中对齐 */}
          <div className="w-full text-center">
          {/* 基本信息 */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {displayProfile?.full_name || displayProfile?.username || t('profile.basic.username')}
            </h2>
            <p className="text-purple-600 font-medium">
              @{displayProfile?.username || t('profile.placeholders.unknown')}
            </p>
          </div>

          {/* 个人简介 */}
          {displayProfile?.bio && (
            <div className="mb-6">
              <p className="text-gray-700 text-sm leading-relaxed">
                {displayProfile.bio}
              </p>
            </div>
          )}

          {/* 详细信息 */}
          <div className="space-y-3">
            {displayProfile?.location && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{displayProfile.location}</span>
              </div>
            )}

            {displayProfile?.website && (
              <div className="flex items-center justify-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-gray-600" />
                <a
                  href={displayProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800 hover:underline"
                >
                  {displayProfile.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}

            {displayProfile?.created_at && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {t('profile.time.joinedOn').replace('{date}', formatJoinDate(displayProfile.created_at, language))}
                </span>
              </div>
            )}
          </div>
        </div>

          {/* 编辑按钮 - 居中放在卡片底部 */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center">
            <button
              onClick={onStartEdit}
              className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700 bg-white hover:bg-gray-50 px-3 py-2 rounded-md transition-colors duration-200 text-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              <span>{t('profile.edit')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfileCard

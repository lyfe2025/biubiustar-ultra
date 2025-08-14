import React from 'react'
import { FileText, Users, UserPlus, Heart } from 'lucide-react'
import { useLanguage } from '../../contexts/language'
import { UserStatsPanelProps } from './types'

const UserStatsPanel: React.FC<UserStatsPanelProps> = ({ stats, isLoading }) => {
  const { t } = useLanguage()

  const statItems = [
    {
      key: 'posts',
      icon: FileText,
      value: stats.postsCount,
      label: t('profile.stats.posts'),
      color: 'text-blue-600 bg-blue-100'
    },
    {
      key: 'followers',
      icon: Users,
      value: stats.followersCount,
      label: t('profile.stats.followers'),
      color: 'text-green-600 bg-green-100'
    },
    {
      key: 'following',
      icon: UserPlus,
      value: stats.followingCount,
      label: t('profile.stats.following'),
      color: 'text-purple-600 bg-purple-100'
    },
    {
      key: 'likes',
      icon: Heart,
      value: stats.likes,
      label: t('profile.stats.likes'),
      color: 'text-red-600 bg-red-100'
    }
  ]

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="w-12 h-12 bg-gray-300 rounded-lg mb-3"></div>
              <div className="h-6 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('profile.statistics')}</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.key} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 ${item.color} rounded-lg mb-3`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
              <div className="text-sm text-gray-500">{item.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default UserStatsPanel

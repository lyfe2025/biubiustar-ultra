import React from 'react'
import { Calendar, MapPin, Users, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { useLanguage } from '../../contexts/LanguageContext'
import { UserActivitiesListProps } from './types'

const UserActivitiesList: React.FC<UserActivitiesListProps> = ({ activities, isLoading }) => {
  const { t } = useLanguage()

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse border-b border-gray-200 pb-4">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="flex space-x-4">
                <div className="h-3 bg-gray-300 rounded w-20"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('profile.noActivities')}</h3>
          <p className="text-gray-500">{t('profile.joinFirstActivity')}</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP')
    } catch {
      return dateString
    }
  }

  const getActivityStatus = (activity: any) => {
    const now = new Date()
    const startDate = new Date(activity.start_time || activity.created_at)
    const endDate = activity.end_time ? new Date(activity.end_time) : null

    if (endDate && now > endDate) {
      return { status: 'ended', color: 'bg-gray-100 text-gray-800' }
    } else if (now >= startDate) {
      return { status: 'ongoing', color: 'bg-green-100 text-green-800' }
    } else {
      return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('profile.myActivities')}</h3>
      
      <div className="space-y-6">
        {activities.map((activity) => {
          const statusInfo = getActivityStatus(activity)
          
          return (
            <div key={activity.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
              {/* 活动标题和状态 */}
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-medium text-gray-900 flex-1">
                  {activity.title || t('profile.untitledActivity')}
                </h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                  {t(`profile.activityStatus.${statusInfo.status}`)}
                </span>
              </div>

              {/* 活动描述 */}
              {activity.description && (
                <div className="text-gray-700 mb-4">
                  <p className="line-clamp-2">{activity.description}</p>
                </div>
              )}

              {/* 活动详情 */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                {activity.start_time && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(activity.start_time)}</span>
                  </div>
                )}

                {activity.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{activity.location}</span>
                  </div>
                )}

                {activity.participants_count !== undefined && (
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{activity.participants_count} {t('profile.participants')}</span>
                  </div>
                )}

                {activity.end_time && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{t('profile.endsOn')} {formatDate(activity.end_time)}</span>
                  </div>
                )}
              </div>

              {/* 活动分类 */}
              {activity.category && (
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {activity.category}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default UserActivitiesList

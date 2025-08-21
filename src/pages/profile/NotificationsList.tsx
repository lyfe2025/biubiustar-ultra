import React, { useState } from 'react'
import { Bell, Check, X, Clock, User, Heart, MessageCircle, Calendar } from 'lucide-react'
import { useLanguage } from '../../contexts/language'
import { headingStyles } from '../../utils/cn'

const NotificationsList: React.FC = () => {
  const { t } = useLanguage()
  
  // 生成模拟的通知数据，使用翻译函数
  const generateMockNotifications = () => [
    {
      id: '1',
      type: 'like',
      message: t('profile.notifications.newLike'),
      time: t('common.time.minutes', { count: 2 }),
      read: false,
      avatar: null,
      data: { postId: 'post-1' }
    },
    {
      id: '2',
      type: 'comment',
      message: t('profile.notifications.newComment'),
      time: t('common.time.hour', { count: 1 }),
      read: false,
      avatar: null,
      data: { postId: 'post-2', commentId: 'comment-1' }
    },
    {
      id: '3',
      type: 'follow',
      message: t('profile.notifications.newFollower'),
      time: t('common.time.hours', { count: 3 }),
      read: true,
      avatar: null,
      data: { userId: 'user-3' }
    },
    {
      id: '4',
      type: 'activity',
      message: t('profile.notifications.activityReminder'),
      time: t('common.time.day', { count: 1 }),
      read: true,
      avatar: null,
      data: { activityId: 'activity-1' }
    }
  ]

  const [notifications, setNotifications] = React.useState(generateMockNotifications())

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case 'follow':
        return <User className="w-5 h-5 text-green-500" />
      case 'activity':
        return <Calendar className="w-5 h-5 text-purple-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const showDeleteConfirmModal = (id: string) => {
    setNotificationToDelete(id)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteNotification = () => {
    if (notificationToDelete) {
      deleteNotification(notificationToDelete)
      setShowDeleteConfirm(false)
      setNotificationToDelete(null)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-purple-600" />
          <h3 className={headingStyles.h3Simple}>
            {t('profile.notifications.title')}
          </h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {unreadCount} {t('profile.notifications.unread')}
            </span>
          )}
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            {t('profile.notifications.markAllRead')}
          </button>
        )}
      </div>

      {/* 通知列表 */}
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className={headingStyles.h3Simple}>
            {t('profile.notifications.noNotifications')}
          </h3>
          <p className="text-gray-500">
            {t('profile.notifications.noNotificationsDesc')}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors ${
                !notification.read ? 'bg-blue-50 border-l-4 border-blue-400' : ''
              }`}
            >
              {/* 头像/图标 */}
              <div className="flex-shrink-0">
                {notification.avatar ? (
                  <img
                    src={notification.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>
                )}
              </div>

              {/* 通知内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex items-center space-x-1 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-blue-600 hover:text-blue-700 rounded"
                        title={t('profile.notifications.markAsRead')}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => showDeleteConfirmModal(notification.id)}
                      className="p-1 text-red-600 hover:text-red-700 rounded"
                      title={t('profile.notifications.delete')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 加载更多 */}
      {notifications.length > 0 && (
        <div className="text-center mt-6">
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            {t('profile.notifications.loadMore')}
          </button>
        </div>
      )}

      {/* 删除确认对话框 */}
      {showDeleteConfirm && notificationToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className={headingStyles.h3Simple}>{t('profile.notifications.delete')}</h3>
            <p className="text-gray-600 mb-6">{t('profile.notifications.deleteConfirm')}</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmDeleteNotification}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationsList

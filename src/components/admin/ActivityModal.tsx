import React, { useState, useEffect } from 'react'
import { XCircle, User, MapPin, Calendar, Tag, Users, UserCheck } from 'lucide-react'
import { AdminActivity } from '../../services/AdminService'
import { useLanguage } from '../../contexts/language'
import { ActivityService, ActivityCategory, ActivityParticipant } from '../../lib/activityService'
import { getCategoryName } from '../../utils/categoryUtils'
import { generateDefaultAvatarUrl, isDefaultAvatar, getUserDefaultAvatarUrl } from '../../utils/avatarGenerator'

interface ActivityModalProps {
  activity: AdminActivity | null
  isOpen: boolean
  onClose: () => void
  onEdit: (activity: AdminActivity) => void
  onDelete: (activity: AdminActivity) => void
  onToggleFeatured: (activityId: string) => void
}

const ActivityModal: React.FC<ActivityModalProps> = ({ activity, isOpen, onClose, onEdit, onDelete, onToggleFeatured }) => {
  const { t, language } = useLanguage()
  const [categories, setCategories] = useState<ActivityCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [participants, setParticipants] = useState<ActivityParticipant[]>([])
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false)
  const [participantsError, setParticipantsError] = useState<string | null>(null)
  const [showParticipants, setShowParticipants] = useState(false)

  // 加载分类数据
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const categoriesData = await ActivityService.getActivityCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // 加载参与人员数据
  const loadParticipants = async () => {
    if (!activity?.id) return;
    
    setIsLoadingParticipants(true);
    setParticipantsError(null);
    try {
      const participantsData = await ActivityService.getActivityParticipants(activity.id);
      setParticipants(participantsData);
    } catch (error) {
      console.error('Failed to load participants:', error);
      setParticipantsError('加载参与人员失败');
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  // 当显示参与人员时加载数据
  useEffect(() => {
    if (showParticipants && activity?.id) {
      loadParticipants();
    }
  }, [showParticipants, activity?.id]);

  if (!isOpen || !activity) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'active': return 'bg-green-100 text-green-800' // 向后兼容，映射为published样式
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('admin.activities.actions.view')}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* 活动图片 */}
          {activity.image_url && (
            <div className="mb-6">
              <img
                src={activity.image_url} 
                alt={activity.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {/* 活动标题和状态 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xl font-bold text-gray-900">{activity.title}</h4>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(activity.status)}`}>
                {t(`admin.activities.status.${activity.status}`)}
              </span>
            </div>
            {activity.is_featured && (
              <div className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                ⭐ {t('admin.activities.featured')}
              </div>
            )}
          </div>

          {/* 活动信息网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* 组织者 */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{t('admin.activities.table.organizer')}</div>
                <div className="text-sm text-gray-500">{typeof activity.organizer === 'string' ? activity.organizer : activity.organizer?.username || 'Unknown'}</div>
              </div>
            </div>

            {/* 地点 */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <MapPin className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{t('admin.activities.form.location')}</div>
                <div className="text-sm text-gray-500">{activity.location}</div>
              </div>
            </div>

            {/* 分类 */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Tag className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{t('admin.activities.form.category')}</div>
                <div className="text-sm text-gray-500">
                  {(() => {
                    const category = categories.find(cat => cat.name === activity.category);
                    return category ? getCategoryName(category, language) : activity.category;
                  })()}
                </div>
              </div>
            </div>

            {/* 参与人数 */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{t('admin.activities.table.participants')}</div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-sm text-gray-500">
                      {activity.current_participants}
                      {activity.max_participants && ` / ${activity.max_participants}`}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    {showParticipants ? '隐藏参与人员' : '查看参与人员'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 时间信息 */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex-shrink-0">
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-sm font-medium text-gray-900">{t('admin.activities.form.time')}</div>
            </div>
            <div className="ml-8 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('admin.activities.form.startTime')}</span>
                <span className="text-sm font-medium text-gray-900">{formatDate(activity.start_date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('admin.activities.form.endTime')}</span>
                <span className="text-sm font-medium text-gray-900">{formatDate(activity.end_date)}</span>
              </div>
            </div>
          </div>

          {/* 参与人员列表 */}
          {showParticipants && (
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-900 mb-3">参与人员</h5>
              {isLoadingParticipants ? (
                <div className="text-center py-4">
                  <div className="text-sm text-gray-500">加载中...</div>
                </div>
              ) : participantsError ? (
                <div className="text-center py-4">
                  <div className="text-sm text-red-500">{participantsError}</div>
                  <button
                    onClick={loadParticipants}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    重试
                  </button>
                </div>
              ) : participants.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {participants.map((participant, index) => (
                       <div key={participant.id || index} className="flex items-center space-x-3 p-2 bg-white rounded border">
                         <div className="flex-shrink-0">
                           {participant.user?.avatar_url && !isDefaultAvatar(participant.user.avatar_url) ? (
                             <img
                               src={participant.user.avatar_url}
                               alt={participant.user.username || participant.user.full_name}
                               className="w-8 h-8 rounded-full object-cover"
                             />
                           ) : (
                             <img
                               src={getUserDefaultAvatarUrl(participant.user?.username || participant.user?.full_name || 'User', participant.user?.avatar_url)}
                               alt={participant.user?.username || participant.user?.full_name || 'User'}
                               className="w-8 h-8 rounded-full"
                             />
                           )}
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="text-sm font-medium text-gray-900 truncate">
                             {participant.user?.full_name || participant.user?.username || '未知用户'}
                           </div>
                           <div className="text-xs text-gray-500">
                             参与时间：{new Date(participant.joined_at).toLocaleDateString('zh-CN', {
                               year: 'numeric',
                               month: 'short',
                               day: 'numeric',
                               hour: '2-digit',
                               minute: '2-digit'
                             })}
                           </div>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">暂无参与人员</div>
                </div>
              )}
            </div>
          )}

          {/* 活动描述 */}
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-900 mb-2">{t('admin.activities.form.description')}</h5>
            <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
              {activity.description}
            </div>
          </div>

          {/* 创建时间 */}
          <div className="border-t pt-4">
            <div className="text-xs text-gray-400">
              {t('admin.activities.createdAt')}: {formatDate(activity.created_at)}
            </div>
          </div>

          {/* 关闭按钮 */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {t('admin.activities.actions.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivityModal
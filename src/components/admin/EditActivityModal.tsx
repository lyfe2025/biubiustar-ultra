import React, { useState, useEffect } from 'react'
import { XCircle, Upload, Calendar, MapPin, Users, Tag, FileText } from 'lucide-react'
import { useLanguage } from '../../contexts/language'
import { toast } from 'sonner'
import { Activity } from '../../types/activity'
import { adminService, AdminActivity } from '../../services/AdminService'

interface EditActivityModalProps {
  activity: AdminActivity | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  categories: Array<{ id: string; name: string }>
}

interface EditActivityData {
  title: string
  description: string
  location: string
  category: string
  start_date: string
  end_date: string
  max_participants: string
  image: string
  status: 'draft' | 'published' | 'cancelled'
}

const EditActivityModal: React.FC<EditActivityModalProps> = ({ 
  activity, 
  isOpen, 
  onClose, 
  onSuccess, 
  categories 
}) => {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [editActivityData, setEditActivityData] = useState<EditActivityData>({
    title: '',
    description: '',
    location: '',
    category: 'general', // 统一使用 'general' 作为默认值
    start_date: '',
    end_date: '',
    max_participants: '',
    image: '',
    status: 'draft'
  })

  // 当活动数据变化时更新表单
  useEffect(() => {
    if (activity && isOpen) {
      setEditActivityData({
        title: activity.title,
        description: activity.description,
        location: activity.location,
        category: activity.category || 'general',
        start_date: activity.start_date ? new Date(activity.start_date).toISOString().slice(0, 16) : '',
        end_date: activity.end_date ? new Date(activity.end_date).toISOString().slice(0, 16) : '',
        max_participants: activity.max_participants ? activity.max_participants.toString() : '',
        image: activity.image_url || '',
        status: activity.status
      })
    }
  }, [activity, isOpen])

  // 重置表单数据
  const resetForm = () => {
    setEditActivityData({
      title: '',
      description: '',
      location: '',
      category: 'general', // 统一使用 'general' 作为默认值
      start_date: '',
      end_date: '',
      max_participants: '',
      image: '',
      status: 'draft'
    })
  }

  // 关闭弹窗时重置表单
  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  const handleEditActivity = async () => {
    if (!activity) return

    try {
      setIsLoading(true)
      
      // 验证必填字段
      if (!editActivityData.title.trim()) {
        toast.error(t('admin.activities.form.validation.titleRequired'))
        return
      }
      if (!editActivityData.description.trim()) {
        toast.error(t('admin.activities.form.validation.descriptionRequired'))
        return
      }
      if (!editActivityData.location.trim()) {
        toast.error(t('admin.activities.form.validation.locationRequired'))
        return
      }
      if (!editActivityData.start_date) {
        toast.error(t('admin.activities.form.validation.startDateRequired'))
        return
      }
      if (!editActivityData.end_date) {
        toast.error(t('admin.activities.form.validation.endDateRequired'))
        return
      }

      // 验证时间逻辑
      const startDate = new Date(editActivityData.start_date)
      const endDate = new Date(editActivityData.end_date)
      if (endDate <= startDate) {
        toast.error(t('admin.activities.form.validation.endDateAfterStart'))
        return
      }

      // 准备活动数据
      const activityData = {
        ...editActivityData,
        max_participants: editActivityData.max_participants ? parseInt(editActivityData.max_participants) : null
      }

      await adminService.updateActivity(activity.id, activityData)
      toast.success(t('admin.activities.messages.updateSuccess'))
      resetForm()
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('更新活动失败:', error)
      
      // 处理不同类型的错误
      if (error.name === 'AuthenticationError') {
        toast.error(t('admin.auth.sessionExpired'))
      } else {
        // 尝试显示后端返回的具体错误信息
        const errorMessage = error.message || t('admin.activities.messages.updateFailed')
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof EditActivityData, value: string) => {
    setEditActivityData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen || !activity) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('admin.activities.actions.edit')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* 表单内容 */}
          <div className="space-y-6">
            {/* 活动标题 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 mr-2" />
                {t('admin.activities.form.title')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={editActivityData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('admin.activities.form.placeholders.title')}
                disabled={isLoading}
              />
            </div>

            {/* 活动描述 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 mr-2" />
                {t('admin.activities.form.description')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={editActivityData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('admin.activities.form.placeholders.description')}
                disabled={isLoading}
              />
            </div>

            {/* 活动地点 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 mr-2" />
                {t('admin.activities.form.location')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={editActivityData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('admin.activities.form.placeholders.location')}
                disabled={isLoading}
              />
            </div>

            {/* 活动分类 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 mr-2" />
                {t('admin.activities.form.category')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={editActivityData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="general">{t('admin.activities.categories.general')}</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 活动状态 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 mr-2" />
                {t('admin.activities.form.status')}
              </label>
              <select
                value={editActivityData.status}
                onChange={(e) => handleInputChange('status', e.target.value as 'draft' | 'published' | 'cancelled')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="draft">{t('admin.activities.status.draft')}</option>
                <option value="published">{t('admin.activities.status.published')}</option>
                <option value="cancelled">{t('admin.activities.status.cancelled')}</option>
              </select>
            </div>

            {/* 时间设置 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('admin.activities.form.startTime')}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={editActivityData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('admin.activities.form.endTime')}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={editActivityData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* 最大参与人数 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 mr-2" />
                {t('admin.activities.form.maxParticipants')}
              </label>
              <input
                type="number"
                value={editActivityData.max_participants}
                onChange={(e) => handleInputChange('max_participants', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('admin.activities.form.placeholders.maxParticipants')}
                min="1"
                disabled={isLoading}
              />
            </div>

            {/* 活动图片 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Upload className="w-4 h-4 mr-2" />
                {t('admin.activities.form.image')}
              </label>
              <input
                type="url"
                value={editActivityData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('admin.activities.form.placeholders.image')}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-3 mt-8">
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              {t('admin.activities.actions.cancel')}
            </button>
            <button
              onClick={handleEditActivity}
              disabled={isLoading}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('admin.activities.actions.updating')}
                </>
              ) : (
                t('admin.activities.actions.update')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditActivityModal
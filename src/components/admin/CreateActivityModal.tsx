import React, { useState, useEffect } from 'react'
import { XCircle, Upload, Calendar, MapPin, Users, Tag, FileText } from 'lucide-react'
import { useLanguage } from '../../contexts/language'
import { toast } from 'sonner'

import { adminService } from '../../services/AdminService'

interface CreateActivityModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  categories: Array<{ id: string; name: string }>
}

interface NewActivityData {
  title: string
  description: string
  location: string
  category: string
  start_date: string
  end_date: string
  max_participants: string
  image: string
}

const CreateActivityModal: React.FC<CreateActivityModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  categories 
}) => {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [newActivityData, setNewActivityData] = useState<NewActivityData>({
    title: '',
    description: '',
    location: '',
    category: 'general', // 统一使用 'general' 作为默认值
    start_date: '',
    end_date: '',
    max_participants: '',
    image: ''
  })

  // 重置表单数据
  const resetForm = () => {
    setNewActivityData({
      title: '',
      description: '',
      location: '',
      category: 'general', // 统一使用 'general' 作为默认值
      start_date: '',
      end_date: '',
      max_participants: '',
      image: ''
    })
  }

  // 关闭弹窗时重置表单
  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  const handleCreateActivity = async () => {
    try {
      setIsLoading(true)
      
      // 验证必填字段
      if (!newActivityData.title.trim()) {
        toast.error(t('admin.activities.form.validation.titleRequired'))
        return
      }
      if (!newActivityData.description.trim()) {
        toast.error(t('admin.activities.form.validation.descriptionRequired'))
        return
      }
      if (!newActivityData.location.trim()) {
        toast.error(t('admin.activities.form.validation.locationRequired'))
        return
      }
      if (!newActivityData.start_date) {
        toast.error(t('admin.activities.form.validation.startDateRequired'))
        return
      }
      if (!newActivityData.end_date) {
        toast.error(t('admin.activities.form.validation.endDateRequired'))
        return
      }

      // 验证时间逻辑
      const startDate = new Date(newActivityData.start_date)
      const endDate = new Date(newActivityData.end_date)
      if (endDate <= startDate) {
        toast.error(t('admin.activities.form.validation.endDateAfterStart'))
        return
      }

      // 准备活动数据
      const activityData = {
        ...newActivityData,
        max_participants: newActivityData.max_participants ? parseInt(newActivityData.max_participants) : null,
        status: 'draft' as const
      }

      await adminService.createActivity(activityData)
      toast.success(t('admin.activities.messages.createSuccess'))
      resetForm()
      onSuccess()
      onClose()
    } catch (error: unknown) {
      console.error('创建活动失败:', error)
      
      // 处理不同类型的错误
      const err = error as any
      if (err.name === 'AuthenticationError') {
        toast.error(t('admin.auth.sessionExpired'))
      } else {
        // 尝试显示后端返回的具体错误信息
        const errorMessage = err.message || t('admin.activities.messages.createFailed')
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof NewActivityData, value: string) => {
    setNewActivityData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

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
              {t('admin.activities.actions.create')}
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
                value={newActivityData.title}
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
                value={newActivityData.description}
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
                value={newActivityData.location}
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
                value={newActivityData.category}
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
                  value={newActivityData.start_date}
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
                  value={newActivityData.end_date}
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
                value={newActivityData.max_participants}
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
                value={newActivityData.image}
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
              onClick={handleCreateActivity}
              disabled={isLoading}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('admin.activities.actions.creating')}
                </>
              ) : (
                t('admin.activities.actions.create')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateActivityModal
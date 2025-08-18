import React, { useState, useEffect } from 'react'
import { XCircle, Upload, Calendar, MapPin, Users, Tag, FileText, Image } from 'lucide-react'
import { useLanguage } from '../../contexts/language'
import { toast } from 'sonner'

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
  status: 'published' | 'draft' | 'cancelled'
  start_date: string
  end_date: string
  max_participants: string | number
  image: string
}

interface UploadingState {
  image: boolean
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
  const [uploading, setUploading] = useState<UploadingState>({ image: false })
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
        image: activity.image_url || activity.image || '', // 支持多个图片字段
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

  // 表单验证函数
  const validateForm = (): string[] => {
    const errors: string[] = []

    // 验证必填字段
    if (!editActivityData.title.trim()) {
      errors.push('活动标题不能为空')
    } else if (editActivityData.title.trim().length < 2) {
      errors.push('活动标题至少需要2个字符')
    } else if (editActivityData.title.trim().length > 100) {
      errors.push('活动标题不能超过100个字符')
    }

    if (!editActivityData.description.trim()) {
      errors.push('活动描述不能为空')
    } else if (editActivityData.description.trim().length < 10) {
      errors.push('活动描述至少需要10个字符')
    } else if (editActivityData.description.trim().length > 2000) {
      errors.push('活动描述不能超过2000个字符')
    }

    if (!editActivityData.location.trim()) {
      errors.push('活动地点不能为空')
    } else if (editActivityData.location.trim().length < 2) {
      errors.push('活动地点至少需要2个字符')
    } else if (editActivityData.location.trim().length > 200) {
      errors.push('活动地点不能超过200个字符')
    }

    if (!editActivityData.start_date) {
      errors.push('开始时间不能为空')
    }

    if (!editActivityData.end_date) {
      errors.push('结束时间不能为空')
    }

    // 验证时间逻辑
    if (editActivityData.start_date && editActivityData.end_date) {
      const startDate = new Date(editActivityData.start_date)
      const endDate = new Date(editActivityData.end_date)
      const now = new Date()

      if (isNaN(startDate.getTime())) {
        errors.push('开始时间格式不正确')
      }

      if (isNaN(endDate.getTime())) {
        errors.push('结束时间格式不正确')
      } else if (endDate <= startDate) {
        errors.push('结束时间必须晚于开始时间')
      }

      // 检查活动持续时间是否合理（不能超过30天）
      if (startDate && endDate && (endDate.getTime() - startDate.getTime()) > 30 * 24 * 60 * 60 * 1000) {
        errors.push('活动持续时间不能超过30天')
      }
    }

    // 验证最大参与人数
    if (editActivityData.max_participants && editActivityData.max_participants.toString().trim()) {
      const maxParticipants = parseInt(editActivityData.max_participants.toString())
      if (isNaN(maxParticipants)) {
        errors.push('最大参与人数必须是数字')
      } else if (maxParticipants < 1) {
        errors.push('最大参与人数至少为1')
      } else if (maxParticipants > 10000) {
        errors.push('最大参与人数不能超过10000')
      }
    }

    // 验证图片URL格式（如果提供了）
    if (editActivityData.image && editActivityData.image.trim()) {
      try {
        new URL(editActivityData.image)
      } catch {
        // 如果不是完整URL，检查是否是相对路径
        if (!editActivityData.image.startsWith('/') && !editActivityData.image.startsWith('./')) {
          errors.push('图片URL格式不正确')
        }
      }
    }

    return errors
  }

  // 处理图片上传
  const handleImageUpload = async (file: File) => {
    try {
      // 设置上传状态
      setUploading(prev => ({ ...prev, image: true }))

      // 文件大小检查（限制为5MB）
      if (file.size > 5 * 1024 * 1024) {
        toast.error('文件大小不能超过5MB')
        return
      }

      // 文件类型检查
      if (!file.type.startsWith('image/')) {
        toast.error('只能上传图片文件')
        return
      }

      // 获取认证token
      const token = localStorage.getItem('adminToken') || 
                   (localStorage.getItem('supabase.auth.token') && 
                    JSON.parse(localStorage.getItem('supabase.auth.token')!).access_token)

      if (!token) {
        toast.error('未找到认证信息，请重新登录')
        return
      }

      // 创建FormData
      const uploadFormData = new FormData()
      uploadFormData.append('image', file)

      // 上传图片到活动图片专用端点
      const response = await fetch('/api/admin/upload/activity-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      })

      const result = await response.json()

      if (response.ok) {
        // 使用完整的URL而不是相对路径
        const imageUrl = result.data.url || result.data.path
        handleInputChange('image', imageUrl)
        toast.success('图片上传成功')
        console.log('活动图片上传成功:', result.data)
      } else {
        throw new Error(result.error || '上传失败')
      }

    } catch (error) {
      console.error('图片上传失败:', error)
      toast.error(`图片上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      // 清除上传状态
      setUploading(prev => ({ ...prev, image: false }))
    }
  }

  const handleEditActivity = async () => {
    if (!activity) return

    try {
      setIsLoading(true)
      
      // 进行全面的表单验证
      const validationErrors = validateForm()
      if (validationErrors.length > 0) {
        // 显示第一个验证错误
        toast.error(validationErrors[0])
        return
      }

      // 准备活动数据 - 将内部的image字段映射为后端期望的image_url字段
      const activityData = {
        ...editActivityData,
        max_participants: editActivityData.max_participants ? parseInt(editActivityData.max_participants.toString()) : null,
        image_url: editActivityData.image // 后端期望的字段名是 image_url
      }
      
      // 移除内部使用的image字段，避免冲突
      delete (activityData as any).image

      await adminService.updateActivity(activity.id, activityData)
      toast.success(t('admin.activities.messages.updateSuccess'))
      resetForm()
      onSuccess()
      onClose()
    } catch (error: unknown) {
      console.error('更新活动失败:', error)
      
      // 处理不同类型的错误
      const err = error as any
      if (err.name === 'AuthenticationError') {
        toast.error(t('admin.auth.sessionExpired'))
      } else {
        // 显示后端返回的具体错误信息
        let errorMessage = err.message || t('admin.activities.messages.updateFailed')
        
        // 如果有详细错误信息，优先显示
        if (err.details && typeof err.details === 'object') {
          console.log('详细错误信息:', err.details)
          
          // 对于字段相关的错误，提供更友好的提示
          if (err.details.field) {
            const fieldNames: Record<string, string> = {
              'title': '标题',
              'description': '描述',
              'location': '地点',
              'start_date': '开始时间',
              'end_date': '结束时间',
              'max_participants': '最大参与人数'
            }
            const fieldName = fieldNames[err.details.field] || err.details.field
            errorMessage = `${fieldName}字段错误：${errorMessage}`
          }
          
          // 对于缺失字段的错误，提供具体的字段名称
          if (err.details.missingFields && Array.isArray(err.details.missingFields)) {
            const fieldNames: Record<string, string> = {
              'title': '标题',
              'description': '描述',
              'location': '地点',
              'start_date': '开始时间',
              'end_date': '结束时间'
            }
            const missingFieldNames = err.details.missingFields.map(
              (field: string) => fieldNames[field] || field
            )
            errorMessage = `请填写以下必填字段：${missingFieldNames.join('、')}`
          }
        }
        
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={editActivityData.status}
                onChange={(e) => handleInputChange('status', e.target.value as 'draft' | 'published' | 'cancelled')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={t('admin.activities.form.placeholders.maxParticipants')}
                min="1"
                disabled={isLoading}
              />
            </div>

            {/* 活动图片 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Image className="w-4 h-4 mr-2" />
                {t('admin.activities.form.image')}
              </label>
              
              {/* 图片预览 */}
              {editActivityData.image && editActivityData.image.trim() ? (
                <div className="mb-4 relative inline-block">
                  <img
                    src={editActivityData.image.startsWith('/') ? `${window.location.origin}${editActivityData.image}` : editActivityData.image}
                    alt="活动图片预览"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      console.warn('图片加载失败:', editActivityData.image)
                      const target = e.target as HTMLImageElement
                      target.src = '/images/placeholder-activity.svg'
                      target.onerror = () => {
                        target.style.display = 'none'
                        console.error('备用图片也加载失败')
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange('image', '')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    disabled={isLoading}
                    title="删除图片"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                  <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">暂无图片预览</div>
                </div>
              )}
              
              {/* 文件上传按钮 */}
              <div className="flex flex-col space-y-3">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleImageUpload(file)
                      }
                    }}
                    className="hidden"
                    id="activity-image-upload"
                    disabled={isLoading || uploading.image}
                  />
                  <label
                    htmlFor="activity-image-upload"
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      isLoading || uploading.image ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploading.image ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        上传中...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        选择图片文件
                      </>
                    )}
                  </label>
                </div>
                
                {/* 或者输入图片URL */}
                <div className="text-sm text-gray-500 text-center">或</div>
                <input
                  type="url"
                  value={editActivityData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={t('admin.activities.form.placeholders.image')}
                  disabled={isLoading}
                />
                
                {/* 文件格式提示 */}
                <p className="text-xs text-gray-500">
                  支持 JPG、PNG、GIF 格式，文件大小不超过 5MB
                </p>
              </div>
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
              className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
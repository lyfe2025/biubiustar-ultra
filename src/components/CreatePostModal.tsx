import { useState, useEffect } from 'react'
import { X, Image, Hash, Send, ChevronDown, ChevronUp, Upload, Trash2, Play } from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/language'
import { toast } from 'sonner'
import { socialService } from '../lib/socialService'
import { supabase } from '../lib/supabase'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated?: () => void
}

interface UploadedFile {
  filename: string
  originalName: string
  size: number
  mimetype: string
  type: 'image' | 'video'
  path: string
  url: string
}

interface ContentCategory {
  id: string
  name: string
  name_zh: string
  name_zh_tw: string
  name_en: string
  name_vi: string
  description?: string
  color?: string
  icon?: string
  is_active: boolean
}

const CreatePostModal = ({ isOpen, onClose, onPostCreated }: CreatePostModalProps) => {
  const { user, session } = useAuth()
  const { language, t } = useLanguage()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [category, setCategory] = useState('general')
  const [categories, setCategories] = useState<ContentCategory[]>([])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // URL验证函数
  const isValidUrl = (string: string): boolean => {
    try {
      const url = new URL(string)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  // 获取分类数据
  const fetchCategories = async () => {
    try {
      const categories = await socialService.getContentCategories(language);
      setCategories(categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // 获取分类名称（根据当前语言）
  const getCategoryName = (category: ContentCategory): string => {
    switch (language) {
      case 'zh-TW':
        return category.name_zh_tw || category.name_zh || category.name
      case 'en':
        return category.name_en || category.name
      case 'vi':
        return category.name_vi || category.name
      default:
        return category.name_zh || category.name
    }
  }

  // 处理文件上传
  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return
    
    // 检查文件数量限制
    if (uploadedFiles.length + files.length > 5) {
      toast.error(t('posts.create.uploadLabel') + ' ' + t('common.form.maxFiles'))
      return
    }
    
    setIsUploading(true)
    try {
      const formData = new FormData()
      
      // 添加所有选中的文件
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })
      
      let token: string | undefined
      
      // 优先使用AuthContext中的session
      if (session?.access_token) {
        token = session.access_token
      } else {
        const { data: sessionData } = await supabase.auth.getSession()
        token = sessionData.session?.access_token
      }
      
      if (!token) {
        toast.error('认证已过期，请重新登录')
        return
      }
      
      const response = await fetch('/api/posts/media', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`${t('posts.create.uploadLabel')} 失败: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success && result.data.files) {
        setUploadedFiles(prev => [...prev, ...result.data.files])
        toast.success(`${t('posts.create.uploadLabel')} 成功 ${result.data.files.length} 个文件`)
      } else {
        throw new Error(result.message || `${t('posts.create.uploadLabel')} 失败`)
      }
    } catch (error) {
      console.error('文件上传失败:', error)
      toast.error(error instanceof Error ? error.message : `${t('posts.create.uploadLabel')} 失败，请重试`)
    } finally {
      setIsUploading(false)
    }
  }
  
  // 删除已上传的文件
  const handleDeleteFile = async (file: UploadedFile) => {
    try {
      let token: string | undefined
      
      // 优先使用AuthContext中的session
      if (session?.access_token) {
        token = session.access_token
      } else {
        const { data: sessionData } = await supabase.auth.getSession()
        token = sessionData.session?.access_token
      }
      
      if (!token) {
        toast.error('认证已过期，请重新登录')
        return
      }
      
      const response = await fetch('/api/posts/media', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ filename: file.filename })
      })
      
      if (response.ok) {
        setUploadedFiles(prev => prev.filter(f => f.filename !== file.filename))
      } else {
        throw new Error(`${t('posts.create.uploadLabel')} 删除失败`)
      }
    } catch (error) {
      console.error('删除文件失败:', error)
      toast.error(`${t('posts.create.uploadLabel')} 删除失败，请重试`)
    }
  }
  
  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 组件挂载时获取分类数据
  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen, language])

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCategoryDropdown) {
        const target = event.target as Element
        if (!target.closest('.category-dropdown')) {
          setShowCategoryDropdown(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCategoryDropdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error(t('common.loginRequired'))
      return
    }
    // 输入验证
    if (!title.trim()) {
      toast.error(t('posts.create.titleLabel') + ' ' + t('common.form.required'))
      return
    }
    
    if (title.trim().length < 2) {
      toast.error(t('posts.create.titleLabel') + ' ' + t('common.form.tooShort'))
      return
    }
    
    if (!content.trim()) {
      toast.error(t('posts.create.contentLabel') + ' ' + t('common.form.required'))
      return
    }
    
    if (content.trim().length < 5) {
      toast.error(t('posts.create.contentLabel') + ' ' + t('common.form.tooShort'))
      return
    }
    
    // 验证图片URL格式（如果提供）
    if (imageUrl.trim() && !isValidUrl(imageUrl.trim())) {
      toast.error(t('posts.create.imageLinkLabel') + ' ' + t('common.form.invalidFormat'))
      return
    }

    setIsSubmitting(true)
    try {
      // 准备图片数组和主图片URL
      const images = uploadedFiles.filter(file => file.type === 'image').map(file => file.url)
      const mainImageUrl = images.length > 0 ? images[0] : (imageUrl.trim() || undefined)
      
      const postData = {
        title: title.trim(),
        content: content.trim(),
        user_id: user.id,
        image_url: mainImageUrl,
        images: images,
        category: category,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        shares_count: 0
      }

      await socialService.createPost(postData)
      
      // 重置表单
      setTitle('')
      setContent('')
      setTags('')
      setImageUrl('')
      setCategory('general')
      setShowCategoryDropdown(false)
      setUploadedFiles([])
      
      onPostCreated?.()
      onClose()
      toast.success('帖子发布成功！正在等待审核，审核通过后将在前台显示。')
    } catch (error) {
      console.error('发布帖子失败:', error)
      
      // 提供更具体的错误提示
      let errorMessage = t('posts.create.failureMessage')
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = t('common.form.loginExpired')
        } else if (error.message.includes('400')) {
          errorMessage = t('common.form.checkInput')
        } else if (error.message.includes('403')) {
          errorMessage = t('posts.create.noPermission')
        } else if (error.message.includes('413')) {
          errorMessage = t('common.form.tooLong')
        } else if (error.message.includes('429')) {
          errorMessage = t('common.form.tooFrequent')
        } else if (error.message.includes('500')) {
          errorMessage = t('common.form.serverError')
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = t('common.form.networkError')
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const handleClose = () => {
    if (title || content || tags || imageUrl || uploadedFiles.length > 0) {
      setShowCloseConfirm(true)
    } else {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">{t('posts.create.modalTitle')}</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 relative overflow-x-hidden">
            {/* 标题输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('posts.create.titleLabel')} *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('posts.create.titlePlaceholder')}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isSubmitting}
                maxLength={100}
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {title.length}/100
              </div>
            </div>

            {/* 内容输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('posts.create.contentLabel')} *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('posts.create.contentPlaceholder')}
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={6}
                disabled={isSubmitting}
                maxLength={1000}
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {content.length}/1000
              </div>
            </div>

            {/* 图片URL输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Image className="w-4 h-4 inline mr-1" />
                {t('posts.create.imageLinkLabel')}
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder={t('posts.create.imageLinkPlaceholder')}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              {imageUrl && (
                <div className="mt-2">
                  <img
                    src={imageUrl}
                    alt="预览"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* 媒体文件上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="w-4 h-4 inline mr-1" />
                {t('posts.create.uploadLabel')}
              </label>
              
              {/* 文件选择按钮 */}
              <div className="flex items-center space-x-3 mb-3">
                <label className={cn(
                  "flex items-center space-x-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors",
                  (isUploading || isSubmitting) && "opacity-50 cursor-not-allowed"
                )}>
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {isUploading ? t('posts.create.uploading') : t('posts.create.selectFile')}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                    disabled={isUploading || isSubmitting || uploadedFiles.length >= 5}
                  />
                </label>
                <span className="text-xs text-gray-500">
                  支持图片和视频，最多5个文件，单个文件最大50MB
                </span>
              </div>
              
              {/* 已上传文件列表 */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">
                    已上传文件 ({uploadedFiles.length}/5)
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                        {/* 文件预览 */}
                        <div className="flex-shrink-0">
                          {file.type === 'image' ? (
                            <img
                              src={file.url}
                              alt={file.originalName}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <Play className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        
                        {/* 文件信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {file.originalName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {file.type === 'image' ? t('posts.create.imageType') : t('posts.create.videoType')} • {formatFileSize(file.size)}
                          </div>
                        </div>
                        
                        {/* 删除按钮 */}
                        <button
                          type="button"
                          onClick={() => handleDeleteFile(file)}
                          className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          disabled={isSubmitting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 分类选择 */}
            <div className="relative category-dropdown z-10">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('posts.create.categoryLabel')}
              </label>
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className={cn(
                  "w-full p-3 border rounded-lg text-left flex items-center justify-between transition-all duration-200",
                  showCategoryDropdown 
                    ? "border-purple-500 ring-2 ring-purple-500 ring-opacity-20 bg-purple-50" 
                    : "border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                )}
                disabled={isSubmitting}
              >
                <span className="text-gray-700">
                  {categories.find(cat => cat.id === category) ? 
                    getCategoryName(categories.find(cat => cat.id === category)!) : 
                    t('posts.create.generalCategory')
                  }
                </span>
                <ChevronUp className={cn(
                  "h-4 w-4 text-gray-400 transition-transform duration-200",
                  showCategoryDropdown && "rotate-180"
                )} />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute z-[60] w-full mb-1 bg-white border border-gray-200 rounded-lg shadow-2xl max-h-60 overflow-y-auto bottom-full left-0 animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
                  <div
                    className="px-4 py-3 hover:bg-purple-50 hover:text-purple-700 cursor-pointer border-b border-gray-100 first:rounded-t-lg transition-colors duration-150"
                    onClick={() => {
                      setCategory('general')
                      setShowCategoryDropdown(false)
                    }}
                  >
                    <span className="text-gray-700 font-medium">{t('posts.create.generalCategory')}</span>
                  </div>
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="px-4 py-3 hover:bg-purple-50 hover:text-purple-700 cursor-pointer border-b border-gray-100 last:rounded-b-lg last:border-b-0 transition-colors duration-150"
                      onClick={() => {
                        setCategory(cat.id)
                        setShowCategoryDropdown(false)
                      }}
                    >
                      <span className="text-gray-700 font-medium">{getCategoryName(cat)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 标签输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="w-4 h-4 inline mr-1" />
                {t('posts.create.tagsLabel')}
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={t('posts.create.tagsPlaceholder')}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              {tags && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.split(',').map((tag, index) => {
                    const trimmedTag = tag.trim()
                    if (!trimmedTag) return null
                    return (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                      >
                        #{trimmedTag}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="border-t border-gray-100 p-6">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isSubmitting}
              >
                {t('posts.create.cancel')}
              </button>
              <button
                type="submit"
                disabled={!title.trim() || !content.trim() || isSubmitting}
                className={cn(
                  'flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all duration-200',
                  title.trim() && content.trim() && !isSubmitting
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? t('posts.create.submitting') : t('posts.create.submit')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 关闭确认对话框 */}
      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div 
            className="absolute inset-0"
            onClick={() => setShowCloseConfirm(false)}
          />
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative z-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('common.confirm.abandonEdit')}</h3>
            <p className="text-gray-600 mb-6">{t('common.confirm.closeConfirm')} {t('common.confirm.closeConfirmMessage')}</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                {t('common.confirm.cancel')}
              </button>
              <button
                onClick={() => {
                  setTitle('')
                  setContent('')
                  setTags('')
                  setImageUrl('')
                  setUploadedFiles([])
                  setShowCloseConfirm(false)
                  onClose()
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                {t('common.confirm.confirmClose')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreatePostModal
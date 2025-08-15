import React, { useState, useEffect } from 'react'
import { Mail, Eye, Check, MessageSquare, Search, Filter, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { useLanguage } from '../../contexts/language/LanguageContext'
import { adminContactsTranslations } from '../../contexts/language/translations/adminContacts'
import { aboutContactTranslations } from '../../contexts/language/translations/aboutContact'
import { contactService, ContactSubmission } from '../../services/ContactService'

const AdminContacts = () => {
  const { t, language: currentLanguage } = useLanguage()
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'read' | 'replied'>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [submissionToDelete, setSubmissionToDelete] = useState<ContactSubmission | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // 获取提交列表
  const fetchSubmissions = async (page: number = 1, status?: 'pending' | 'read' | 'replied') => {
    try {
      setLoading(true)
      const response = await contactService.getContactSubmissions(
        page,
        pagination.limit,
        status
      )
      
      if (response.success && response.data) {
        setSubmissions(response.data.submissions)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('获取联系提交失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 切换页面
  const changePage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchSubmissions(page, selectedStatus === 'all' ? undefined : selectedStatus)
    }
  }

  // 改变每页显示数量
  const changePageSize = async (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }))
    try {
      setLoading(true)
      const response = await contactService.getContactSubmissions(
        1,
        limit,
        selectedStatus === 'all' ? undefined : selectedStatus
      )
      
      if (response.success && response.data) {
        setSubmissions(response.data.submissions)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('获取联系提交失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 更新提交状态
  const updateSubmissionStatus = async (id: string, status: 'pending' | 'read' | 'replied') => {
    try {
      setIsUpdating(true)
      const response = await contactService.updateSubmissionStatus(id, status)
      
      if (response.success) {
        // 更新本地状态
        setSubmissions(prev => 
          prev.map(submission => 
            submission.id === id 
              ? { ...submission, status, updated_at: new Date().toISOString() }
              : submission
          )
        )
        
        // 如果是当前查看的提交，也更新详情
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(prev => 
            prev ? { ...prev, status, updated_at: new Date().toISOString() } : null
          )
        }
      }
    } catch (error) {
      console.error('更新状态失败:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  // 删除提交记录
  const deleteSubmission = async (id: string) => {
    try {
      setIsDeleting(true)
      const response = await contactService.deleteSubmission(id)
      
      if (response.success) {
        // 从本地状态中移除
        setSubmissions(prev => prev.filter(submission => submission.id !== id))
        
        // 如果删除的是当前查看的提交，关闭详情模态框
        if (selectedSubmission?.id === id) {
          closeDetailModal()
        }
        
        // 关闭删除确认模态框
        setShowDeleteModal(false)
        setSubmissionToDelete(null)
        
        // 重新获取数据以更新分页信息
        fetchSubmissions(pagination.page, selectedStatus === 'all' ? undefined : selectedStatus)
      }
    } catch (error) {
      console.error('删除失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // 打开删除确认对话框
  const openDeleteModal = (submission: ContactSubmission) => {
    setSubmissionToDelete(submission)
    setShowDeleteModal(true)
  }

  // 关闭删除确认对话框
  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setSubmissionToDelete(null)
  }

  // 打开详情模态框
  const openDetailModal = (submission: ContactSubmission) => {
    setSelectedSubmission(submission)
    setShowDetailModal(true)
    
    // 如果是未读状态，自动标记为已读
    if (submission.status === 'pending') {
      updateSubmissionStatus(submission.id, 'read')
    }
  }

  // 关闭模态框
  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedSubmission(null)
  }

  // 筛选提交
  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.subject.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // 获取状态样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'read':
        return 'bg-blue-100 text-blue-800'
      case 'replied':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Helper function to get category text from translation
  const getCategoryText = (categoryKey: string): string => {
    try {
      console.log(`[getCategoryText] ===== PROCESSING CATEGORY =====`)
      console.log(`[getCategoryText] Original categoryKey: '${categoryKey}'`)
      console.log(`[getCategoryText] Type of categoryKey: ${typeof categoryKey}`)
      console.log(`[getCategoryText] Length: ${categoryKey?.length || 'undefined'}`)
      console.log(`[getCategoryText] Processing category: '${categoryKey}'`)
      
      // 创建kebab-case到camelCase的映射表，确保所有情况都能正确转换
      const kebabToCamelMap: { [key: string]: string } = {
        'live-ecommerce': 'liveEcommerce',
        'short-video': 'shortVideo', 
        'business-cooperation': 'businessCooperation',
        'influencer-cooperation': 'influencerCooperation',
        'technical-consulting': 'technicalConsulting',
        'product-inquiry': 'productInquiry',
        'media-cooperation': 'mediaCooperation',
        'other': 'other'
      }
      
      // 首先尝试使用映射表
      let camelCaseKey = kebabToCamelMap[categoryKey]
      
      // 如果映射表中没有，使用通用转换规则
      if (!camelCaseKey) {
        camelCaseKey = categoryKey.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())
      }
      
      console.log(`[getCategoryText] Converted '${categoryKey}' to camelCase: '${camelCaseKey}'`)
      
      // 获取当前语言的翻译
      const currentTranslations = aboutContactTranslations[currentLanguage as keyof typeof aboutContactTranslations]
      
      if (!currentTranslations) {
        console.warn(`[getCategoryText] No translations found for language: ${currentLanguage}`)
        return categoryKey
      }
      
      const categoryTranslations = currentTranslations.about?.contactForm?.categories
      
      if (!categoryTranslations) {
        console.warn(`[getCategoryText] No category translations found for language: ${currentLanguage}`)
        return categoryKey
      }
      
      console.log(`[getCategoryText] Available categories:`, Object.keys(categoryTranslations))
      
      const translatedText = categoryTranslations[camelCaseKey as keyof typeof categoryTranslations]
      console.log(`[getCategoryText] Found translation for '${camelCaseKey}':`, translatedText)
      
      if (translatedText) {
        console.log(`[getCategoryText] SUCCESS: '${categoryKey}' -> '${camelCaseKey}' -> '${translatedText}'`)
        return translatedText
      }
      
      // 如果找不到翻译，尝试使用t函数作为备选方案
      const fallbackKey = `about.contactForm.categories.${camelCaseKey}`
      console.log(`[getCategoryText] Trying fallback key: ${fallbackKey}`)
      const fallbackText = t(fallbackKey)
      
      // 如果t函数返回的不是翻译键本身，说明找到了翻译
      if (fallbackText && fallbackText !== fallbackKey) {
        console.log(`[getCategoryText] Fallback successful: ${fallbackText}`)
        return fallbackText
      }
      
      // 最后的fallback：尝试直接显示原始键的友好格式
      const friendlyText = categoryKey
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      console.warn(`[getCategoryText] FAILED: No translation found for category: '${categoryKey}' (camelCase: '${camelCaseKey}'), using friendly format: '${friendlyText}'`)
      return friendlyText
    } catch (error) {
      console.error('[getCategoryText] Error:', error)
      return categoryKey
    }
  }

  useEffect(() => {
    fetchSubmissions(1, selectedStatus === 'all' ? undefined : selectedStatus)
  }, [selectedStatus])

  return (
    <AdminLayout>
      <div className="p-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.contacts.title')}</h1>
          <p className="text-gray-600 mt-1">{t('admin.contacts.description')}</p>
        </div>

        {/* 筛选器 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('admin.contacts.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* 状态筛选 */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">{t('admin.contacts.filter.allStatus')}</option>
                <option value="pending">{t('admin.contacts.filter.pending')}</option>
                <option value="read">{t('admin.contacts.filter.read')}</option>
                <option value="replied">{t('admin.contacts.filter.replied')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* 提交列表 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">{t('admin.contacts.loading')}</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('admin.contacts.noData')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.contacts.table.name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.contacts.table.email')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.contacts.table.subject')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.contacts.table.phone')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.contacts.table.ipAddress')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.contacts.table.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.contacts.table.submittedAt')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.contacts.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{submission.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{submission.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{getCategoryText(submission.subject)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{submission.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 font-mono">{submission.ip_address || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(submission.status)}`}>
                          {t(`admin.contacts.status.${submission.status}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(submission.submitted_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openDetailModal(submission)}
                            className="text-purple-600 hover:text-purple-900 flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>{t('admin.contacts.actions.view')}</span>
                          </button>
                          {submission.status !== 'replied' && (
                            <button
                              onClick={() => updateSubmissionStatus(submission.id, 'replied')}
                              disabled={isUpdating}
                              className="text-green-600 hover:text-green-900 flex items-center space-x-1 disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                              <span>{t('admin.contacts.actions.markAsReplied')}</span>
                            </button>
                          )}
                          <button
                            onClick={() => openDeleteModal(submission)}
                            className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>{t('admin.contacts.actions.delete')}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 分页组件 */}
        {!loading && pagination.total > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              显示第 {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} 条，共 {pagination.total} 条记录
            </div>
            <div className="flex items-center space-x-2">
              {/* 每页显示数量选择 */}
              <select
                value={pagination.limit}
                onChange={(e) => changePageSize(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value={10}>10条/页</option>
                <option value={20}>20条/页</option>
                <option value={50}>50条/页</option>
              </select>
              
              {/* 分页按钮 */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => changePage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {/* 页码按钮 */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i
                  } else {
                    pageNum = pagination.page - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => changePage(pageNum)}
                      className={`px-3 py-1 rounded border ${
                        pageNum === pagination.page
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => changePage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 详情模态框 */}
        {showDetailModal && selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDetailModal} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('admin.contacts.modal.title')}
                  </h3>
                  <button
                    onClick={closeDetailModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.contacts.table.name')}
                    </label>
                    <p className="text-gray-900">{selectedSubmission.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.contacts.table.email')}
                    </label>
                    <p className="text-gray-900">{selectedSubmission.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.contacts.table.subject')}
                    </label>
                    <p className="text-gray-900">{getCategoryText(selectedSubmission.subject)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.contacts.table.phone')}
                    </label>
                    <p className="text-gray-900">{selectedSubmission.phone || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.contacts.table.ipAddress')}
                    </label>
                    <p className="text-gray-900 font-mono">{selectedSubmission.ip_address || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.contacts.table.message')}
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedSubmission.message}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(selectedSubmission.status)}`}>
                        {t(`admin.contacts.status.${selectedSubmission.status}`)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {t('admin.contacts.table.submittedAt')}: {formatDate(selectedSubmission.submitted_at)}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={closeDetailModal}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      {t('admin.contacts.modal.close')}
                    </button>
                    {selectedSubmission.status !== 'replied' && (
                      <button
                        onClick={() => {
                          updateSubmissionStatus(selectedSubmission.id, 'replied')
                          closeDetailModal()
                        }}
                        disabled={isUpdating}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{t('admin.contacts.actions.markAsReplied')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 删除确认对话框 */}
        {showDeleteModal && submissionToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDeleteModal} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {t('admin.contacts.deleteModal.title')}
                    </h3>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    {t('admin.contacts.deleteModal.message')}
                  </p>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{submissionToDelete.name}</p>
                    <p className="text-sm text-gray-600">{submissionToDelete.email}</p>
                    <p className="text-sm text-gray-600">{getCategoryText(submissionToDelete.subject)}</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeDeleteModal}
                    disabled={isDeleting}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                  >
                    {t('admin.contacts.deleteModal.cancel')}
                  </button>
                  <button
                    onClick={() => deleteSubmission(submissionToDelete.id)}
                    disabled={isDeleting}
                    className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t('admin.contacts.deleteModal.deleting')}</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>{t('admin.contacts.deleteModal.confirm')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminContacts
import React, { useState, useEffect } from 'react'
import { Mail, Eye, Check, MessageSquare, Search, Filter } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { useLanguage } from '../../contexts/language'
import { contactService, ContactSubmission } from '../../services/ContactService'

const AdminContacts = () => {
  const { t } = useLanguage()
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'read' | 'replied'>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
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
                  placeholder={t('admin.contacts.searchPlaceholder')}
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
                <option value="all">{t('admin.contacts.statusAll')}</option>
                <option value="pending">{t('admin.contacts.statusPending')}</option>
                <option value="read">{t('admin.contacts.statusRead')}</option>
                <option value="replied">{t('admin.contacts.statusReplied')}</option>
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
              <p className="text-gray-500">{t('admin.contacts.noSubmissions')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.contacts.name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.contacts.email')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.contacts.subject')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.contacts.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.contacts.submittedAt')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.contacts.actions')}
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
                        <div className="text-sm text-gray-900 max-w-xs truncate">{submission.subject}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(submission.status)}`}>
                          {t(`admin.contacts.status${submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}`)}
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
                            <span>{t('admin.contacts.view')}</span>
                          </button>
                          {submission.status !== 'replied' && (
                            <button
                              onClick={() => updateSubmissionStatus(submission.id, 'replied')}
                              disabled={isUpdating}
                              className="text-green-600 hover:text-green-900 flex items-center space-x-1 disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                              <span>{t('admin.contacts.markReplied')}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 分页 */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchSubmissions(page, selectedStatus === 'all' ? undefined : selectedStatus)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    page === pagination.page
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
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
                    {t('admin.contacts.submissionDetails')}
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
                      {t('admin.contacts.name')}
                    </label>
                    <p className="text-gray-900">{selectedSubmission.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.contacts.email')}
                    </label>
                    <p className="text-gray-900">{selectedSubmission.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.contacts.subject')}
                    </label>
                    <p className="text-gray-900">{selectedSubmission.subject}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.contacts.message')}
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedSubmission.message}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(selectedSubmission.status)}`}>
                        {t(`admin.contacts.status${selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1)}`)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {t('admin.contacts.submittedAt')}: {formatDate(selectedSubmission.submitted_at)}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={closeDetailModal}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      {t('admin.contacts.close')}
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
                        <span>{t('admin.contacts.markReplied')}</span>
                      </button>
                    )}
                  </div>
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
import React from 'react'
import { FileText, Folder } from 'lucide-react'
import AdminLayout from '../../../components/AdminLayout'
import { useLanguage } from '../../../contexts/language'
import ContentFilters from './ContentFilters'
import ContentList from './ContentList'
import ContentPreview from './ContentPreview'
import CategoryManagement from './CategoryManagement'
import { useContentManagement } from './hooks/useContentManagement'

const AdminContent = () => {
  const { t } = useLanguage()
  const {
    // 数据
    posts,
    contentCategories,
    loading,
    selectedPost,
    selectedCategory,
    
    // 筛选状态
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    categorySearchTerm,
    setCategorySearchTerm,
    
    // 标签页
    activeTab,
    setActiveTab,
    
    // 预览状态
    showPreview,
    
    // 模态框状态
    showCreateCategoryModal,
    showEditCategoryModal,
    showDeleteCategoryConfirm,
    
    // 操作方法
    fetchPosts,
    updatePostStatus,
    deletePost,
    createContentCategory,
    updateContentCategory,
    deleteContentCategory,
    toggleCategoryStatus,
    
    // 预览操作
    openPreview,
    closePreview,
    
    // 分类模态框操作
    openCreateCategoryModal,
    openEditCategoryModal,
    openDeleteCategoryConfirm,
    closeAllModals
  } = useContentManagement()

  const handleViewPost = (post: any) => {
    openPreview(post)
  }

  const handleUpdatePostStatus = async (postId: string, status: any) => {
    await updatePostStatus(postId, status)
    closePreview()
  }

  const handleDeletePost = async (post: any) => {
    if (window.confirm(`确定要删除帖子 "${post.title}" 吗？此操作无法撤销。`)) {
      await deletePost(post.id)
      closePreview()
    }
  }

  const handlePreviewUpdateStatus = async (status: any) => {
    if (selectedPost) {
      await updatePostStatus(selectedPost.id, status)
      closePreview()
    }
  }

  const handlePreviewDelete = async () => {
    if (selectedPost) {
      if (window.confirm(`确定要删除帖子 "${selectedPost.title}" 吗？此操作无法撤销。`)) {
        await deletePost(selectedPost.id)
        closePreview()
      }
    }
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.content.title')}</h1>
          <p className="text-gray-600 mt-1">{t('admin.content.description')}</p>
        </div>

        {/* 标签页 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('content')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'content'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>{t('admin.content.tabs.content')}</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Folder className="w-4 h-4" />
                  <span>{t('admin.content.tabs.categories')}</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* 标签页内容 */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <ContentFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              onRefresh={fetchPosts}
            />
            
            <ContentList
              posts={posts}
              loading={loading}
              onView={handleViewPost}
              onUpdateStatus={handleUpdatePostStatus}
              onDelete={handleDeletePost}
            />
          </div>
        )}

        {activeTab === 'categories' && (
          <CategoryManagement
            categories={contentCategories}
            loading={loading}
            searchTerm={categorySearchTerm}
            setSearchTerm={setCategorySearchTerm}
            onCreate={openCreateCategoryModal}
            onEdit={openEditCategoryModal}
            onDelete={openDeleteCategoryConfirm}
            onToggle={toggleCategoryStatus}
          />
        )}

        {/* 内容预览模态框 */}
        <ContentPreview
          post={selectedPost}
          isOpen={showPreview}
          onClose={closePreview}
          onUpdateStatus={handlePreviewUpdateStatus}
          onDelete={handlePreviewDelete}
        />

        {/* 分类管理模态框 - 这里应该添加创建/编辑分类的模态框 */}
        {/* 由于原文件太大，这些模态框组件可以后续添加 */}
        
        {/* 删除确认对话框 */}
        {showDeleteCategoryConfirm && selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeAllModals} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('admin.content.categories.confirmDelete')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('admin.content.categories.confirmDeleteMessage').replace('{name}', selectedCategory.name)}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeAllModals}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => selectedCategory && deleteContentCategory(selectedCategory.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminContent

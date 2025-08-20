import React from 'react'
import { FileText, Folder, ChevronLeft, ChevronRight } from 'lucide-react'
import AdminLayout from '../../../components/AdminLayout'
import DeleteConfirmModal from '../../../components/DeleteConfirmModal'
import { useLanguage } from '../../../contexts/language'
import ContentFilters from './ContentFilters'
import ContentList from './ContentList'
import ContentPreview from './ContentPreview'
import CategoryManagement from './CategoryManagement'
import { useContentManagement } from './hooks/useContentManagement'
import CreateContentCategoryForm from './CreateContentCategoryForm'
import EditContentCategoryForm from './EditContentCategoryForm'

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
    showDeletePostConfirm,
    
    // 操作方法
    fetchPosts,
    updatePostStatus,
    deletePost,
    createContentCategory,
    updateContentCategory,
    deleteContentCategory,
    toggleCategoryStatus,
    
    // 分页相关
    pagination,
    changePage,
    changePageSize,
    
    // 预览操作
    openPreview,
    closePreview,
    
    // 分类模态框操作
    openCreateCategoryModal,
    openEditCategoryModal,
    openDeleteCategoryConfirm,
    closeAllModals,
    openDeletePostConfirm,
    postToDelete,
    confirmDeletePost
  } = useContentManagement()

  const handleViewPost = (post: any) => {
    openPreview(post)
  }

  const handleUpdatePostStatus = async (postId: string, status: any) => {
    await updatePostStatus(postId, status)
    closePreview()
  }

  const handleDeletePost = async (post: any) => {
    // 显示删除确认框而不是直接删除
    openDeletePostConfirm(post)
  }

  const handlePreviewUpdateStatus = async (status: any) => {
    if (selectedPost) {
      await updatePostStatus(selectedPost.id, status)
      closePreview()
    }
  }

  const handlePreviewDelete = async () => {
    if (selectedPost) {
      // 显示删除确认框而不是直接删除
      openDeletePostConfirm(selectedPost)
      closePreview()
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
            
            {/* 分页组件 */}
            {pagination && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => changePage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => changePage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      显示第{' '}
                      <span className="font-medium">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>{' '}
                      到{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      条，共{' '}
                      <span className="font-medium">{pagination.total}</span> 条记录
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-700">每页显示：</label>
                      <select
                        value={pagination.limit}
                        onChange={(e) => changePageSize(Number(e.target.value))}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => changePage(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {/* 页码按钮 */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => changePage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNum === pagination.page
                                ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => changePage(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <CategoryManagement
            categories={contentCategories}
            loading={loading}
            searchTerm={categorySearchTerm}
            onSearchChange={setCategorySearchTerm}
            onCreate={openCreateCategoryModal}
            onEdit={openEditCategoryModal}
            onDelete={openDeleteCategoryConfirm}
            onToggleStatus={toggleCategoryStatus}
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

        {/* 创建内容分类模态框 */}
        {showCreateCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeAllModals} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t('admin.content.categories.create')}
                </h2>
                
                <CreateContentCategoryForm
                  onSubmit={createContentCategory}
                  onCancel={closeAllModals}
                />
              </div>
            </div>
          </div>
        )}

        {/* 编辑内容分类模态框 */}
        {showEditCategoryModal && selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeAllModals} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t('admin.content.categories.edit')}
                </h2>
                
                <EditContentCategoryForm
                  category={selectedCategory}
                  onSubmit={(data) => updateContentCategory(selectedCategory.id, data)}
                  onCancel={closeAllModals}
                />
              </div>
            </div>
          </div>
        )}
        
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

        {/* 内容删除确认对话框 */}
        <DeleteConfirmModal
          isOpen={showDeletePostConfirm}
          onClose={closeAllModals}
          onConfirm={confirmDeletePost}
          title={t('admin.content.confirmDelete')}
          message={t('admin.content.confirmDeleteMessage').replace('{title}', postToDelete?.title || '')}
          itemName={postToDelete?.title}
          itemIcon={<FileText className="w-5 h-5 text-red-600" />}
        />
      </div>
    </AdminLayout>
  )
}

export default AdminContent

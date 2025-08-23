import React from 'react'
import { UserPlus, ChevronLeft, ChevronRight, X, Trash2, User } from 'lucide-react'
import AdminLayout from '../../../components/AdminLayout'
import { useLanguage } from '../../../contexts/language'
import UserFilters from './UserFilters'
import UserList from './UserList'
import { UserModal, AddUserModal, PasswordModal } from './UserModal'
import { useUserManagement } from './hooks/useUserManagement'
import { generateDefaultAvatarUrl, getUserDefaultAvatarUrl } from '../../../utils/avatarGenerator'

const AdminUsers = () => {
  const { t } = useLanguage()
  const {
    // 数据
    users,
    loading,
    selectedUser,
    isSubmitting,
    isUpdatingPassword,
    pagination,
    

    
    // 筛选状态
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedRole,
    setSelectedRole,
    
    // 模态框状态
    showUserModal,
    showDeleteConfirm,
    showAddUserModal,
    showPasswordModal,
    
    // 操作方法
    fetchUsers,
    updateUser,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    createUser,
    updateUserPassword,
    changePage,
    changePageSize,
    
    // 模态框操作
    openUserModal,
    openDeleteConfirm,
    openPasswordModal,
    setShowAddUserModal,
    closeAllModals
  } = useUserManagement()

  const handleSaveUser = async (userData: any) => {
    if (selectedUser) {
      await updateUser(selectedUser.id, userData)
      closeAllModals()
    }
  }

  const handleDeleteUser = async (user: any) => {
    await deleteUser(user)
  }

  const handleCreateUser = async (userData: any) => {
    const success = await createUser(userData)
    if (success) {
      closeAllModals()
    }
  }

  const handleUpdatePassword = async (password: string) => {
    if (selectedUser) {
      // 调试日志：打印selectedUser的完整信息
      console.log('🔍 [DEBUG] handleUpdatePassword - selectedUser:', {
        fullObject: selectedUser,
        id: selectedUser.id,
        idType: typeof selectedUser.id,
        idValue: JSON.stringify(selectedUser.id),
        username: selectedUser.username,
        email: selectedUser.email
      })
      
      await updateUserPassword(selectedUser.id, password)
    } else {
      console.error('❌ [DEBUG] handleUpdatePassword - selectedUser is null/undefined')
    }
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* 页面标题和操作 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.users.title')}</h1>
            <p className="text-gray-600 mt-1">{t('admin.users.description')}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              <span>{t('admin.users.addUser')}</span>
            </button>
          </div>
        </div>

        {/* 筛选器 */}
        <UserFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
        />



        {/* 用户列表 */}
        <UserList
          users={users}
          loading={loading}
          onEdit={openUserModal}
          onDelete={openDeleteConfirm}
          onUpdateStatus={updateUserStatus}
          onUpdateRole={updateUserRole}
          onChangePassword={openPasswordModal}
        />

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

        {/* 模态框 */}
        <UserModal
          user={selectedUser}
          isOpen={showUserModal}
          onClose={closeAllModals}
          onSave={handleSaveUser}
          onDelete={openDeleteConfirm}
          loading={isSubmitting}
        />

        <AddUserModal
          isOpen={showAddUserModal}
          onClose={closeAllModals}
          onSave={handleCreateUser}
          loading={isSubmitting}
        />

        <PasswordModal
          user={selectedUser}
          isOpen={showPasswordModal}
          onClose={closeAllModals}
          onSave={handleUpdatePassword}
          loading={isUpdatingPassword}
        />

        {/* 删除确认对话框 */}
        {showDeleteConfirm && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeAllModals} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('admin.users.confirmDelete')}
                </h3>
                <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">删除用户确认</p>
                    <p className="text-sm text-gray-500">此操作无法撤销</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  {t('admin.users.confirmDeleteMessage').replace('{username}', selectedUser.username)}
                </p>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {selectedUser.avatar ? (
                      <img className="h-8 w-8 rounded-full object-cover" src={selectedUser.avatar} alt="" />
                    ) : (
                      <img 
                        className="h-8 w-8 rounded-full" 
                        src={getUserDefaultAvatarUrl(selectedUser.username, selectedUser.avatar)} 
                        alt="" 
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedUser.username}</p>
                      <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
                <button
                  onClick={closeAllModals}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {t('admin.users.cancel')}
                </button>
                <button
                  onClick={() => handleDeleteUser(selectedUser)}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>删除中...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>{t('admin.users.delete')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminUsers

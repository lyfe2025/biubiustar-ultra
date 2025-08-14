import React from 'react'
import { UserPlus } from 'lucide-react'
import AdminLayout from '../../../components/AdminLayout'
import { useLanguage } from '../../../contexts/language'
import UserFilters from './UserFilters'
import UserList from './UserList'
import { UserModal, AddUserModal, PasswordModal } from './UserModal'
import { useUserManagement } from './hooks/useUserManagement'

const AdminUsers = () => {
  const { t } = useLanguage()
  const {
    // 数据
    users,
    loading,
    selectedUser,
    isSubmitting,
    isUpdatingPassword,
    
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
    updateUserStatus,
    updateUserRole,
    deleteUser,
    createUser,
    updateUserPassword,
    
    // 模态框操作
    openUserModal,
    openDeleteConfirm,
    openPasswordModal,
    setShowAddUserModal,
    closeAllModals
  } = useUserManagement()

  const handleSaveUser = async (userData: any) => {
    // 这里可以添加用户信息更新逻辑
    console.log('更新用户信息:', userData)
    closeAllModals()
  }

  const handleDeleteUser = async (user: any) => {
    if (window.confirm(`确定要删除用户 ${user.username} 吗？此操作无法撤销。`)) {
      await deleteUser(user)
    }
  }

  const handleCreateUser = async (userData: any) => {
    const success = await createUser(userData)
    if (success) {
      closeAllModals()
    }
  }

  const handleUpdatePassword = async (password: string) => {
    if (selectedUser) {
      await updateUserPassword(selectedUser.id, password)
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
          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            <span>{t('admin.users.addUser')}</span>
          </button>
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
          onDelete={handleDeleteUser}
          onUpdateStatus={updateUserStatus}
          onUpdateRole={updateUserRole}
          onChangePassword={openPasswordModal}
        />

        {/* 模态框 */}
        <UserModal
          user={selectedUser}
          isOpen={showUserModal}
          onClose={closeAllModals}
          onSave={handleSaveUser}
          onDelete={handleDeleteUser}
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
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('admin.users.confirmDelete')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('admin.users.confirmDeleteMessage').replace('{username}', selectedUser.username)}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeAllModals}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {t('admin.users.cancel')}
                </button>
                <button
                  onClick={() => handleDeleteUser(selectedUser)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('admin.users.delete')}
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

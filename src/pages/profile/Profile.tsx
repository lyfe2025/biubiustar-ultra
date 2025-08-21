import React, { useEffect } from 'react'
import { User, FileText, Users, Settings, Bell, Plus, UserCircle } from 'lucide-react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { useLanguage } from '../../contexts/language'
import { usePageTitle } from '../../hooks/usePageTitle'
import CreatePostModal from '../../components/CreatePostModal'
import UserProfileCard from './UserProfileCard'
import UserStatsPanel from './UserStatsPanel'
import UserPostsList from './UserPostsList'
import UserActivitiesList from './UserActivitiesList.tsx'
import ProfileSettings from './ProfileSettings.tsx'
import NotificationsList from './NotificationsList.tsx'
import UserProfileManagement from './UserProfileManagement'
import { useUserProfile } from './hooks/useUserProfile'

const Profile: React.FC = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  usePageTitle(t('profile.title'))
  
  const {
    // 数据状态
    user,
    userProfile,
    userStats,
    userPosts,
    userActivities,
    isLoading,
    notificationSettings,
    avatarPreview,
    avatarFile,
    
    // UI状态
    activeTab,
    setActiveTab,
    isCreatePostModalOpen,
    setIsCreatePostModalOpen,
    isEditingProfile,
    editForm,
    
    // 操作方法
    loadUserData,
    saveProfile,
    deletePost,
    likePost,
    previewAvatar,
    uploadAvatarToServer,
    handleEditFormChange,
    setNotificationSettings,
    signOut,
    startEdit,
    cancelEdit
  } = useUserProfile()

  // 从URL参数初始化标签页
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab')
    if (tabFromUrl && ['overview', 'profile', 'content', 'social', 'settings', 'notifications'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl as any)
    }
  }, [searchParams, setActiveTab])

  // 处理标签页切换
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as any)
    setSearchParams({ tab: tabId })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <User className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">{t('profile.notLoggedIn')}</h2>
          <p className="text-gray-500 mt-2">{t('profile.pleaseLogin')}</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: t('profile.tabs.overview'), icon: User },
    { id: 'profile', name: t('profile.tabs.profile'), icon: UserCircle },
    { id: 'content', name: t('profile.tabs.content'), icon: FileText },
    { id: 'social', name: t('profile.tabs.social'), icon: Users },
    { id: 'settings', name: t('profile.tabs.settings'), icon: Settings },
    { id: 'notifications', name: t('profile.tabs.notifications'), icon: Bell }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题栏 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">{t('profile.title')}</h1>
            <p className="text-gray-600 mt-1">{t('profile.subtitle')}</p>
          </div>
          <button
            onClick={() => setIsCreatePostModalOpen(true)}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t('profile.createPost')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧边栏 */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* 用户资料卡片 */}
              <UserProfileCard
                profile={userProfile}
                isLoading={isLoading}
                onStartEdit={() => {
                  startEdit()
                  handleTabChange('profile')
                }}
              />

              {/* 统计面板 */}
              <UserStatsPanel
                stats={userStats}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* 主要内容区域 */}
          <div className="lg:col-span-3">
            {/* 标签页导航 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={cn(
                          'py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2',
                          activeTab === tab.id
                            ? 'border-purple-500 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.name}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* 标签页内容 */}
            <div>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <UserPostsList
                    posts={userPosts.slice(0, 5)} // 只显示最近5个帖子
                    isLoading={isLoading}
                    onDeletePost={deletePost}
                    onLikePost={likePost}
                  />
                  <UserActivitiesList
                    activities={userActivities.slice(0, 5)} // 只显示最近5个活动
                    isLoading={isLoading}
                  />
                </div>
              )}

              {activeTab === 'profile' && (
                <UserProfileManagement
                  profile={userProfile}
                  isLoading={isLoading}
                  isEditingProfile={isEditingProfile}
                  editForm={editForm}
                  onEditFormChange={handleEditFormChange}
                  onSaveProfile={saveProfile}
                  onCancelEdit={cancelEdit}
                  onStartEdit={startEdit}
                  onAvatarUpload={previewAvatar}
                  avatarPreview={avatarPreview}
                />
              )}

              {activeTab === 'content' && (
                <UserPostsList
                  posts={userPosts}
                  isLoading={isLoading}
                  onDeletePost={deletePost}
                  onLikePost={likePost}
                />
              )}

              {activeTab === 'social' && (
                <UserActivitiesList
                  activities={userActivities}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'settings' && (
                <ProfileSettings
                  notificationSettings={notificationSettings}
                  onNotificationSettingsChange={setNotificationSettings}
                  onSignOut={signOut}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationsList />
              )}
            </div>
          </div>
        </div>

        {/* 创建帖子模态框 */}
        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={() => {
            setIsCreatePostModalOpen(false)
            loadUserData() // 重新加载用户数据
          }}
        />
      </div>
    </div>
  )
}

export default Profile

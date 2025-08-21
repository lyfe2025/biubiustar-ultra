import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { socialService } from '../../../lib/socialService'
import { User } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'
import { ActivityService } from '../../../lib/activityService'
import { userDataCache } from '../../../services/userDataCache'
import { apiCache } from '../../../services/apiCache'
import type { Post } from '../../admin/content/types'
import type { Activity } from '../../../types'
import type { UserProfile, UserStats, NotificationSettings, EditProfileForm, ProfileTab } from '../types'

export const useUserProfile = () => {
  const { user, session, signOut, refreshProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userStats, setUserStats] = useState<UserStats>({
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    likes: 0
  })
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [userActivities, setUserActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    push: false,
    sms: true
  })
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState<EditProfileForm>({
    full_name: '',
    bio: '',
    location: '',
    website: ''
  })
  // 头像预览状态
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // 加载用户数据
  const loadUserData = useCallback(async (forceRefresh = false) => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      // 使用全局缓存管理器加载数据，自动检查缓存有效性
      const cachedData = forceRefresh 
        ? await userDataCache.loadUserData(user.id, true)
        : await userDataCache.checkAndRefresh(user.id)
      
      // 更新组件状态
      setUserProfile(cachedData.profile)
      setUserPosts(cachedData.posts)
      setUserActivities(cachedData.activities)
      setUserStats(cachedData.stats)
      
      // 生成默认数据（当profile为null时使用）
      const defaultProfile = {
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        bio: '',
        location: '',
        website: ''
      };
      
      // 初始化编辑表单 - 优先使用profile，否则使用默认数据
      const formData = cachedData.profile ? {
        full_name: cachedData.profile.full_name || '',
        bio: cachedData.profile.bio || '',
        location: cachedData.profile.location || '',
        website: cachedData.profile.website || ''
      } : defaultProfile;
      
      setEditForm(formData);
      
      if (!cachedData.profile) {
        console.warn('用户资料为空，可能需要创建用户资料')
      }
      
      console.log('个人中心数据加载完成 (通过全局缓存管理器)')
      
    } catch (error) {
      console.error('加载用户数据失败:', error)
      toast.error('加载用户数据失败')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // 保存用户资料
  const saveProfile = async () => {
    if (!user) return
    
    try {
      // 如果有头像预览，先上传头像
      if (avatarFile) {
        const uploadSuccess = await uploadAvatarToServer(avatarFile)
        if (!uploadSuccess) {
          toast.error('头像上传失败，请重试')
          return
        }
        // 清除预览状态
        setAvatarPreview(null)
        setAvatarFile(null)
      }
      
      const updatedProfile = await socialService.updateUserProfile(user.id, editForm)
      setIsEditingProfile(false)
      
      // 标记缓存需要刷新，确保下次访问时获取最新数据
      userDataCache.markForRefresh(user.id)
      
      // 清除前端API缓存中的用户资料数据
      apiCache.invalidatePattern(`user_profile_${user.id}`)
      
      // 同步更新AuthContext中的全局状态
      await refreshProfile()
      
      // 强制刷新所有用户数据，确保UI显示最新信息
      await loadUserData(true)
      
      toast.success('资料保存成功')
    } catch (error) {
      console.error('保存用户资料失败:', error)
      toast.error('保存用户资料失败')
    }
  }

  // 删除帖子
  const deletePost = async (postId: string) => {
    try {
      await socialService.deletePost(postId)
      setUserPosts(prev => prev.filter(post => post.id !== postId))
      // 从全局缓存中删除帖子，并标记需要刷新统计
      if (user) {
        userDataCache.removePostFromCache(user.id, postId)
        userDataCache.markForRefresh(user.id) // 统计数据可能变化
      }
      toast.success('帖子删除成功')
    } catch (error) {
      console.error('删除帖子失败:', error)
      toast.error('删除帖子失败')
    }
  }

  // 点赞帖子
  const likePost = async (postId: string) => {
    if (!user) return
    
    try {
      await socialService.toggleLike(postId, user.id)
      // 标记缓存需要刷新以更新统计
      userDataCache.markForRefresh(user.id)
    } catch (error) {
      console.error('点赞操作失败:', error)
      toast.error('操作失败')
    }
  }

  // 预览头像（不立即上传）
  const previewAvatar = (file: File) => {
    if (!user) {
      toast.error('请先登录后再上传头像')
      return
    }
    
    // 创建预览URL
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
    setAvatarFile(file)
    
    toast.success('头像预览已更新，点击保存以确认更改')
  }
  
  // 实际上传头像到服务器
  const uploadAvatarToServer = async (file: File) => {
    console.log('=== 头像上传到服务器开始 ===')
    
    if (!user) {
      console.error('用户未登录')
      toast.error('请先登录后再上传头像')
      return false
    }
    
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      
      let token: string | undefined
      
      // 优先使用AuthContext中的session
      if (session?.access_token) {
        token = session.access_token
      } else {
        const { data: sessionData } = await supabase.auth.getSession()
        token = sessionData.session?.access_token
      }
      
      if (!token) {
        console.error('无法获取认证令牌')
        toast.error('认证已过期，请重新登录')
        return false
      }
      
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '头像上传失败')
      }
      
      const result = await response.json()
      
      // 同步更新AuthContext中的全局状态
      await refreshProfile()
      
      // 强制刷新所有用户数据，确保UI显示最新头像
      await loadUserData(true)
      
      console.log('=== 头像上传到服务器完成 ===')
      return true
    } catch (error) {
      console.error('头像上传失败:', error)
      toast.error(error instanceof Error ? error.message : '头像上传失败')
      return false
    }
  }

  // 处理编辑表单变化
  const handleEditFormChange = (field: keyof EditProfileForm, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }



  // 初始化
  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user, loadUserData])

  return {
    // 数据状态
    user,
    userProfile,
    userStats,
    userPosts,
    userActivities,
    isLoading,
    notificationSettings,
    
    // UI状态
    activeTab,
    setActiveTab,
    selectedPostId,
    setSelectedPostId,
    isCommentModalOpen,
    setIsCommentModalOpen,
    isCreatePostModalOpen,
    setIsCreatePostModalOpen,
    isEditingProfile,
    setIsEditingProfile,
    editForm,
    avatarPreview,
    avatarFile,
    
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
    
    // UI操作
    startEdit: () => {
      // 生成默认数据
      const defaultProfile = {
        full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
        bio: '',
        location: '',
        website: ''
      };
      
      // 优先使用现有资料，否则使用默认数据
      const formData = userProfile ? {
        full_name: userProfile.full_name || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        website: userProfile.website || ''
      } : defaultProfile;
      
      setEditForm(formData);
      setIsEditingProfile(true);
    },
    cancelEdit: () => {
      setIsEditingProfile(false)
      // 生成默认数据
      const defaultProfile = {
        full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
        bio: '',
        location: '',
        website: ''
      };
      
      // 恢复到原始数据或默认数据
      const formData = userProfile ? {
        full_name: userProfile.full_name || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        website: userProfile.website || ''
      } : defaultProfile;
      
      setEditForm(formData);
      // 清除头像预览状态
      setAvatarPreview(null);
      setAvatarFile(null);
    }
  }
}

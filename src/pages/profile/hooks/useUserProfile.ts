import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { socialService } from '../../../lib/socialService'
import { ActivityService } from '../../../lib/activityService'
import { supabase } from '../../../lib/supabase'
import type { Post } from '../../admin/content/types'
import type { Activity } from '../../../types'
import { toast } from 'sonner'
import type { UserProfile, UserStats, NotificationSettings, EditProfileForm, ProfileTab } from '../types'

export const useUserProfile = () => {
  const { user, session, signOut } = useAuth()
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

  // 加载用户数据
  const loadUserData = useCallback(async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      // 获取用户资料
      const profile = await socialService.getUserProfile(user.id)
      setUserProfile(profile)
      
      // 生成默认数据（当profile为null时使用）
      const defaultProfile = {
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        bio: '',
        location: '',
        website: ''
      };
      
      // 初始化编辑表单 - 优先使用profile，否则使用默认数据
      const formData = profile ? {
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || ''
      } : defaultProfile;
      
      setEditForm(formData);
      
      if (!profile) {
        console.warn('用户资料为空，可能需要创建用户资料')
      }
      
      // 获取用户统计数据
      const postsResponse = await socialService.getUserPosts(user.id)
      const posts = Array.isArray(postsResponse) ? postsResponse : postsResponse.posts || []
      setUserPosts(posts)
      
      const activities = await ActivityService.getUserActivities(user.id)
      setUserActivities(activities)
      
      setUserStats({
        postsCount: posts.length,
        followersCount: profile?.followers_count || 0,
        followingCount: profile?.following_count || 0,
        likes: (posts as Post[]).reduce((sum: number, post: Post) => sum + (post.likes_count || 0), 0)
      })
      
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
      const updatedProfile = await socialService.updateUserProfile(user.id, editForm)
      setUserProfile(updatedProfile)
      setIsEditingProfile(false)
      toast.success('资料保存成功')
      
      // 保存成功后重新加载数据以确保同步
      await loadUserData()
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
      // 重新加载用户数据以更新统计
      loadUserData()
    } catch (error) {
      console.error('点赞操作失败:', error)
      toast.error('操作失败')
    }
  }

  // 上传头像
  const uploadAvatar = async (file: File) => {
    console.log('=== 头像上传开始 ===')
    console.log('用户状态:', {
      user: user ? { id: user.id, email: user.email } : null,
      userExists: !!user
    })
    console.log('AuthContext session状态:', {
      session: session ? { 
        access_token: session.access_token ? `存在(长度: ${session.access_token.length})` : '不存在',
        expires_at: session.expires_at,
        user_id: session.user?.id
      } : null,
      sessionExists: !!session
    })
    
    if (!user) {
      console.error('用户未登录')
      toast.error('请先登录后再上传头像')
      return
    }
    
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      
      let token: string | undefined
      
      // 优先使用AuthContext中的session
      if (session?.access_token) {
        token = session.access_token
        console.log('使用AuthContext的token:', `存在(长度: ${token.length})`)
      } else {
        console.log('AuthContext session为空，尝试从supabase获取')
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        console.log('从supabase获取session结果:', { 
          sessionData: sessionData ? {
            session: sessionData.session ? {
              access_token: sessionData.session.access_token ? `存在(长度: ${sessionData.session.access_token.length})` : '不存在',
              expires_at: sessionData.session.expires_at,
              user_id: sessionData.session.user?.id
            } : null
          } : null,
          sessionError 
        })
        
        token = sessionData.session?.access_token
      }
      
      console.log('最终使用的token:', token ? `存在(长度: ${token.length})` : '不存在')
      
      if (!token) {
        console.error('无法获取认证令牌')
        toast.error('认证已过期，请重新登录')
        return
      }
      
      console.log('发送头像上传请求...')
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      console.log('头像上传响应状态:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('头像上传失败响应:', errorData)
        throw new Error(errorData.error || '头像上传失败')
      }
      
      const result = await response.json()
      console.log('头像上传成功响应:', result)
      
      // 更新本地用户资料状态
      if (result.profile) {
        setUserProfile(result.profile)
      }
      
      toast.success(result.message || '头像上传成功')
      console.log('=== 头像上传完成 ===')
    } catch (error) {
      console.error('头像上传失败:', error)
      toast.error(error instanceof Error ? error.message : '头像上传失败')
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
    
    // 操作方法
    loadUserData,
    saveProfile,
    deletePost,
    likePost,
    uploadAvatar,
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
    }
  }
}

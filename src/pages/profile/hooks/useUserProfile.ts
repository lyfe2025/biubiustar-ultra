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
  const { user, signOut } = useAuth()
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
      
      if (profile) {
        setEditForm({
          full_name: profile.full_name || '',
          bio: profile.bio || '',
          location: profile.location || '',
          website: profile.website || ''
        })
      } else {
        console.warn('用户资料为空，可能需要创建用户资料')
        setEditForm({
          full_name: '',
          bio: '',
          location: '',
          website: ''
        })
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
    if (!user || !userProfile) return
    
    try {
      const updatedProfile = await socialService.updateUserProfile(user.id, editForm)
      setUserProfile(updatedProfile)
      setIsEditingProfile(false)
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
    if (!user) return
    
    try {
      const fileName = `avatar-${user.id}-${Date.now()}`
      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // 更新用户资料中的头像URL
      await socialService.updateUserProfile(user.id, { avatar_url: publicUrl })
      
      // 重新加载用户数据
      loadUserData()
      toast.success('头像上传成功')
    } catch (error) {
      console.error('头像上传失败:', error)
      toast.error('头像上传失败')
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
    startEdit: () => setIsEditingProfile(true),
    cancelEdit: () => {
      setIsEditingProfile(false)
      if (userProfile) {
        setEditForm({
          full_name: userProfile.full_name || '',
          bio: userProfile.bio || '',
          location: userProfile.location || '',
          website: userProfile.website || ''
        })
      }
    }
  }
}

// 用户资料相关类型定义
export interface UserProfile {
  id: string
  username: string
  full_name: string
  email: string
  avatar_url?: string
  bio?: string
  location?: string
  website?: string
  followers_count: number
  following_count: number
  created_at: string
  updated_at: string
}

export interface UserStats {
  postsCount: number
  followersCount: number
  followingCount: number
  likes: number
}

export interface Notification {
  id: string
  type: string
  message: string
  time: string
  read: boolean
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
}

export interface EditProfileForm {
  full_name: string
  bio: string
  location: string
  website: string
}

export type ProfileTab = 'overview' | 'content' | 'social' | 'settings' | 'notifications'

export interface UserProfileCardProps {
  profile: UserProfile | null
  isLoading: boolean
  isEditingProfile: boolean
  editForm: EditProfileForm
  onEditFormChange: (field: keyof EditProfileForm, value: string) => void
  onSaveProfile: () => void
  onCancelEdit: () => void
  onStartEdit: () => void
}

export interface UserStatsPanelProps {
  stats: UserStats
  isLoading: boolean
}

import { Post, Activity } from '../../types'

export interface UserPostsListProps {
  posts: Post[]
  isLoading: boolean
  onDeletePost: (postId: string) => void
  onLikePost: (postId: string) => void
}

export interface UserActivitiesListProps {
  activities: Activity[]
  isLoading: boolean
}

export interface ProfileSettingsProps {
  notificationSettings: NotificationSettings
  onNotificationSettingsChange: (settings: NotificationSettings) => void
  onSignOut: () => void
}

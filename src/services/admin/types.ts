import { Activity } from '../../types/index'

/**
 * 帖子相关接口定义
 */
export interface Post {
  id: string
  title: string
  content: string
  image_url?: string
  video?: string
  thumbnail?: string
  author?: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
  }
  status: 'published' | 'draft' | 'pending' | 'rejected'
  likes_count: number
  comments_count: number
  shares_count: number
  views_count: number
  user_id: string
  category: string
  tags?: string[]
  created_at: string
  updated_at: string
}

/**
 * 帖子状态类型
 */
export type PostStatus = 'published' | 'draft' | 'pending' | 'rejected'

/**
 * 创建帖子数据接口
 */
export interface CreatePostData {
  title: string
  content: string
  image_url?: string
  video?: string
  thumbnail?: string
  status?: PostStatus
  category?: string
  tags?: string[]
}

/**
 * 更新帖子数据接口
 */
export interface UpdatePostData {
  title?: string
  content?: string
  image_url?: string
  video?: string
  thumbnail?: string
  status?: PostStatus
  category?: string
  tags?: string[]
}

/**
 * 用户相关接口定义
 */
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  status: 'active' | 'suspended' | 'banned'
  role: 'user' | 'admin' | 'moderator'
  email_verified: boolean
  created_at: string
  updated_at: string
  posts_count: number
  followers_count: number
  following_count: number
}

/**
 * 活动分类相关接口定义
 */
export interface ActivityCategory {
  id: string
  name: string
  description?: string
  name_zh?: string
  name_zh_tw?: string
  name_en?: string
  name_vi?: string
  description_zh?: string
  description_zh_tw?: string
  description_en?: string
  description_vi?: string
  color: string
  icon: string
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * 内容分类相关接口定义
 */
export interface ContentCategory {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

/**
 * 管理员活动接口定义（扩展自基础Activity）
 */
export interface AdminActivity extends Omit<Activity, 'status' | 'category_id'> {
  status: 'published' | 'draft' | 'cancelled'
  category_id?: string
  image?: string // 兼容性字段，支持旧数据
  organizer: {
    id: string
    username: string
    avatar?: string
  }
  tags: string[]
  is_featured: boolean
  is_recommended?: boolean
  updated_at: string
}

/**
 * 最近活动接口定义
 */
export interface RecentActivity {
  id: string
  type: 'post' | 'comment' | 'like' | 'follow'
  user: {
    id: string
    username: string
    avatar?: string
  }
  content: string
  message: string
  time: string
  icon: string
  color: string
  created_at: string
}

/**
 * 仪表板统计数据接口定义
 */
export interface DashboardStats {
  totalUsers: number
  totalPosts: number
  totalActivities: number
  activeUsers: number
  totalViews: number
  pendingPosts: number
  totalLikes: number
  totalComments: number
  newUsersToday: number
  activeActivities: number
  completedActivities: number
  totalParticipants: number
  upcomingActivities: number
}

/**
 * 安全状态接口定义
 */
export interface SecurityStatus {
  attemptsRemaining: number
  maxAttempts: number
  isLocked: boolean
  lockedUntil?: string
}

/**
 * 分页响应接口定义
 */
export interface PaginationResponse {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * 缓存信息接口定义
 */
export interface CacheInfo {
  cached: boolean
  timestamp: string
}

/**
 * 登录尝试记录接口定义
 */
export interface LoginAttempt {
  id: string
  ip_address: string
  email: string | null
  success: boolean
  user_agent: string | null
  failure_reason: string | null
  created_at: string
}

/**
 * IP黑名单记录接口定义
 */
export interface IPBlacklistRecord {
  id: string
  ip_address: string
  reason: string
  blocked_until: string | null
  is_permanent: boolean
  created_at: string
}

/**
 * 安全日志记录接口定义
 */
export interface SecurityLogRecord {
  id: string
  event_type: string
  ip_address: string
  user_id: string | null
  user_email: string | null
  event_data: Record<string, unknown>
  severity: 'info' | 'warning' | 'error'
  created_at: string
}

/**
 * 活动日志记录接口定义
 */
export interface ActivityLogRecord {
  id: string
  user_id: string | null
  user_email: string | null
  action: string
  type: string
  resource_id: string | null
  ip_address: string
  user_agent: string | null
  details: Record<string, unknown>
  created_at: string
}

/**
 * 用户统计数据接口定义
 */
export interface UserStats {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  userGrowthRate: number
  _cacheInfo?: CacheInfo
}

/**
 * 安全统计数据接口定义
 */
export interface SecurityStats {
  totalLoginAttempts: number
  failedAttempts24h: number
  blockedIPs: number
  securityEvents7d: number
}

/**
 * API响应基础接口
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  _cacheInfo?: CacheInfo
}

/**
 * 分页API响应接口
 */
export interface PaginatedApiResponse<T> {
  data: T[]
  pagination: PaginationResponse
  _cacheInfo?: CacheInfo
}



/**
 * 用户创建数据接口
 */
export interface CreateUserData {
  username: string
  email: string
  password: string
  full_name: string
  role: 'user' | 'moderator' | 'admin'
  status: 'active' | 'suspended' | 'banned' | 'pending'
}

/**
 * 活动分类创建数据接口
 */
export interface CreateActivityCategoryData {
  name: string
  description?: string
  color?: string
  icon?: string
}

/**
 * 活动分类更新数据接口
 */
export interface UpdateActivityCategoryData {
  name?: string
  description?: string
  color?: string
  icon?: string
  is_active?: boolean
}

/**
 * 内容分类创建数据接口
 */
export interface CreateContentCategoryData {
  name: string
  description?: string
  color?: string
  icon?: string
  sort_order?: number
}

/**
 * 内容分类更新数据接口
 */
export interface UpdateContentCategoryData {
  name?: string
  description?: string
  color?: string
  icon?: string
  sort_order?: number
  is_active?: boolean
}
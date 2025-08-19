export interface Post {
  id: string
  title: string
  content: string
  image_url?: string
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
  user_id: string
  category: string
  created_at: string
  updated_at: string
}

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

import { Activity } from '../types/index'

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

export interface SecurityStatus {
  attemptsRemaining: number
  maxAttempts: number
  isLocked: boolean
  lockedUntil?: string
}

class AdminService {
  private baseURL = '/api'
  private static authErrorCallback: (() => void) | null = null
  private static isHandlingAuthError = false // 防止重复处理认证错误

  // 设置认证错误回调函数
  static setAuthErrorCallback(callback: () => void) {
    AdminService.authErrorCallback = callback
  }

  // 清除认证错误回调函数
  static clearAuthErrorCallback() {
    AdminService.authErrorCallback = null
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      // 获取真实的Supabase认证token
      const token = await this.getAuthToken()
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options?.headers,
        },
      })

      if (!response.ok) {
        // 特殊处理401认证失败错误
        if (response.status === 401) {
          this.handleAuthError('认证令牌已失效，请重新登录')
          return Promise.reject(new Error('认证失败')) // 这里不会执行到，因为handleAuthError会抛出异常
        }
        
        // 尝试解析响应体中的错误信息
        let errorMessage = `API request failed: ${response.statusText}`
        let errorDetails = null
        
        try {
          const errorData = await response.json()
          
          // 优先使用后端返回的error字段
          if (errorData.error) {
            errorMessage = errorData.error
            
            // 如果有更详细的信息，添加到错误消息中
            if (errorData.details && errorData.details !== errorData.error) {
              errorMessage += ` (详细信息: ${errorData.details})`
            }
            
            // 如果有字段相关的错误信息
            if (errorData.field) {
              errorMessage += ` [字段: ${errorData.field}]`
            }
            
            // 如果有缺失字段信息
            if (errorData.missingFields && Array.isArray(errorData.missingFields)) {
              errorMessage += ` [缺失字段: ${errorData.missingFields.join(', ')}]`
            }
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
          
          // 保存完整的错误数据用于调试
          errorDetails = errorData
        } catch (parseError) {
          // 如果无法解析JSON，使用默认错误信息
          console.warn('无法解析错误响应:', parseError)
        }
        
        const error = new Error(errorMessage)
        // 将错误详情附加到错误对象上，方便前端组件使用
        if (errorDetails) {
          ;(error as any).details = errorDetails
        }
        throw error
      }

      return response.json()
    } catch (error) {
      // 如果是getAuthToken抛出的认证错误，也要处理
      if (error instanceof Error && error.message.includes('未找到有效的认证token')) {
        this.handleAuthError('未找到有效的认证信息，请先登录')
      }
      throw error
    }
  }

  // 统一处理认证错误
  private handleAuthError(message: string): never {
    // 防止重复处理认证错误
    if (AdminService.isHandlingAuthError) {
      const authError = new Error(message)
      authError.name = 'AuthenticationError'
      throw authError
    }
    
    AdminService.isHandlingAuthError = true
    
    // 清除本地存储的认证token
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    localStorage.removeItem('supabase.auth.token')
    
    // 如果有注册的回调函数，调用它
    if (AdminService.authErrorCallback) {
      try {
        AdminService.authErrorCallback()
      } catch (error) {
        console.error('认证错误回调函数执行失败:', error)
      }
    }
    
    // 延迟重置标志，防止立即重复处理
    setTimeout(() => {
      AdminService.isHandlingAuthError = false
    }, 1000)
    
    // 抛出特定的认证失败错误
    const authError = new Error(message)
    authError.name = 'AuthenticationError'
    throw authError
  }

  private async getAuthToken(): Promise<string> {
    // 首先尝试从localStorage获取管理员token（来自管理员登录）
    const adminToken = localStorage.getItem('adminToken')
    if (adminToken) {
      // 简单验证token格式（可以根据实际token格式调整）
      if (adminToken.length > 10) {
        return adminToken
      } else {
        // token格式不正确，清除它
        localStorage.removeItem('adminToken')
      }
    }

    // 如果没有管理员token，尝试获取普通用户的Supabase session token
    const sessionData = localStorage.getItem('supabase.auth.token')
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData)
        if (session.access_token && session.access_token.length > 10) {
          return session.access_token
        }
      } catch (error) {
        console.error('解析session数据失败:', error)
        // 清除无效的session数据
        localStorage.removeItem('supabase.auth.token')
      }
    }

    // 如果都没有，抛出错误
    throw new Error('未找到有效的认证token，请重新登录')
  }

  // 检查token是否存在（用于认证守卫）
  static hasValidToken(): boolean {
    const adminToken = localStorage.getItem('adminToken')
    if (adminToken && adminToken.length > 10) {
      return true
    }

    const sessionData = localStorage.getItem('supabase.auth.token')
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData)
        return !!(session.access_token && session.access_token.length > 10)
      } catch (error) {
        return false
      }
    }

    return false
  }

  // 清除所有认证信息
  static clearAuth(): void {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    localStorage.removeItem('supabase.auth.token')
  }

  // 内容管理相关API
  async getPosts(page: number = 1, limit: number = 20): Promise<{ posts: Post[], pagination: { page: number, limit: number, total: number, totalPages: number } }> {
    return this.request<{ posts: Post[], pagination: { page: number, limit: number, total: number, totalPages: number } }>(`/admin/posts?page=${page}&limit=${limit}`)
  }

  async updatePostStatus(postId: string, status: 'published' | 'rejected' | 'draft' | 'pending'): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/posts/${postId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  async deletePost(postId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/posts/${postId}`, {
      method: 'DELETE',
    })
  }

  // 用户管理相关API
  async getUsers(
    page: number = 1, 
    limit: number = 10, 
    search?: string, 
    status?: string, 
    role?: string
  ): Promise<{ users: User[], pagination: { page: number, limit: number, total: number, totalPages: number } }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    if (search && search.trim()) {
      params.append('search', search.trim())
    }
    if (status && status !== 'all') {
      params.append('status', status)
    }
    if (role && role !== 'all') {
      params.append('role', role)
    }
    
    return this.request<{ users: User[], pagination: { page: number, limit: number, total: number, totalPages: number } }>(`/admin/users?${params.toString()}`)
  }

  async updateUserStatus(userId: string, status: User['status']): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  async updateUserRole(userId: string, role: User['role']): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    })
  }

  async deleteUser(userId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/users/${userId}`, {
      method: 'DELETE',
    })
  }

  async createUser(userData: {
    username: string
    email: string
    password: string
    full_name: string
    role: 'user' | 'moderator' | 'admin'
    status: 'active' | 'suspended' | 'banned' | 'pending'
  }): Promise<User> {
    return this.request<User>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password: newPassword }),
    })
  }

  // 活动管理相关API
  async getActivities(page: number = 1, limit: number = 10): Promise<{ activities: AdminActivity[], pagination: { page: number, limit: number, total: number, totalPages: number } }> {
    return this.request<{ activities: AdminActivity[], pagination: { page: number, limit: number, total: number, totalPages: number } }>(`/admin/activities?page=${page}&limit=${limit}`)
  }

  async getRecentActivities(): Promise<RecentActivity[]> {
    return this.request<RecentActivity[]>('/admin/recent-activities')
  }

  async updateActivityStatus(activityId: string, status: AdminActivity['status'], is_featured?: boolean): Promise<{ success: boolean }> {
    const body: { status: AdminActivity['status']; is_featured?: boolean } = { status }
    if (is_featured !== undefined) {
      body.is_featured = is_featured
    }
    return this.request<{ success: boolean }>(`/admin/activities/${activityId}/status`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async deleteActivity(activityId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/activities/${activityId}`, {
      method: 'DELETE',
    })
  }

  async createActivity(activityData: Omit<AdminActivity, 'id' | 'created_at' | 'updated_at' | 'current_participants' | 'organizer' | 'tags' | 'is_featured' | 'user_id' | 'author'>): Promise<AdminActivity> {
    return this.request<AdminActivity>('/admin/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    })
  }

  async updateActivity(activityId: string, activityData: Partial<Omit<AdminActivity, 'id' | 'created_at' | 'updated_at' | 'organizer' | 'user_id' | 'author'>>): Promise<AdminActivity> {
    return this.request<AdminActivity>(`/admin/activities/${activityId}`, {
      method: 'PUT',
      body: JSON.stringify(activityData),
    })
  }

  async toggleActivityFeatured(activityId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/activities/${activityId}/featured`, {
      method: 'PUT',
    })
  }

  // 活动分类管理相关API
  async getCategories(): Promise<ActivityCategory[]> {
    return this.request<ActivityCategory[]>('/admin/categories/activity')
  }

  async createCategory(categoryData: {
    name: string
    description?: string
    color?: string
    icon?: string
  }): Promise<ActivityCategory> {
    return this.request<ActivityCategory>('/admin/categories/activity', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    })
  }

  async updateCategory(categoryId: string, categoryData: {
    name?: string
    description?: string
    color?: string
    icon?: string
    is_active?: boolean
  }): Promise<ActivityCategory> {
    return this.request<ActivityCategory>(`/admin/categories/activity/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    })
  }

  async deleteCategory(categoryId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/categories/activity/${categoryId}`, {
      method: 'DELETE',
    })
  }

  async toggleCategoryStatus(categoryId: string): Promise<ActivityCategory> {
    return this.request<ActivityCategory>(`/admin/categories/activity/${categoryId}/toggle`, {
      method: 'PUT',
    })
  }

  // 内容分类管理相关API
  async getContentCategories(): Promise<ContentCategory[]> {
    return this.request<ContentCategory[]>('/admin/categories/content')
  }

  async createContentCategory(categoryData: {
    name: string
    description?: string
    color?: string
    icon?: string
    sort_order?: number
  }): Promise<ContentCategory> {
    return this.request<ContentCategory>('/admin/categories/content', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    })
  }

  async updateContentCategory(categoryId: string, categoryData: {
    name?: string
    description?: string
    color?: string
    icon?: string
    sort_order?: number
    is_active?: boolean
  }): Promise<ContentCategory> {
    return this.request<ContentCategory>(`/admin/categories/content/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    })
  }

  async deleteContentCategory(categoryId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/categories/content/${categoryId}`, {
      method: 'DELETE',
    })
  }

  async toggleContentCategoryStatus(categoryId: string): Promise<ContentCategory> {
    return this.request<ContentCategory>(`/admin/categories/content/${categoryId}/toggle`, {
      method: 'PUT',
    })
  }

  // 统计数据API
  async getStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/admin/stats')
  }

  // 系统设置相关API
  async getSettings(category?: string): Promise<Record<string, unknown>> {
    const url = category ? `/admin/settings?category=${category}` : '/admin/settings'
    return this.request<Record<string, unknown>>(url)
  }

  async saveSettings(settings: Record<string, unknown>): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  async testEmail(email: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/admin/settings/test-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async getPublicSettings(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/admin/settings/public')
  }

  // 添加缺失的系统设置方法
  async getSystemSettings(): Promise<Record<string, unknown>> {
    const response = await this.request<{ success: boolean; data: Record<string, unknown> }>('/admin/settings')
    return response.data
  }

  async updateSystemSettings(settings: Record<string, unknown>): Promise<void> {
    await this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
    
    // 保存成功后清除前台缓存
    try {
      if (typeof window !== 'undefined' && (window as unknown as { clearSettingsCache?: () => void }).clearSettingsCache) {
        (window as unknown as { clearSettingsCache: () => void }).clearSettingsCache()
      }
    } catch (error) {
      console.warn('清除前台缓存失败:', error)
    }
  }

  async resetSystemSettings(): Promise<void> {
    await this.request('/admin/settings/reset', {
      method: 'POST'
    })
  }

  async exportSystemSettings(): Promise<Record<string, unknown>> {
    const response = await this.request<{ success: boolean; data: Record<string, unknown> }>('/admin/settings/export')
    return response.data
  }

  async importSystemSettings(settings: Record<string, unknown>): Promise<void> {
    await this.request('/admin/settings/import', {
      method: 'POST',
      body: JSON.stringify(settings)
    })
  }

  async testEmailConfig(settings: Record<string, unknown>): Promise<void> {
    await this.request('/admin/settings/test-email', {
      method: 'POST',
      body: JSON.stringify(settings)
    })
  }

  async clearCache(): Promise<void> {
    await this.request('/admin/settings/clear-cache', {
      method: 'POST'
    })
  }

  // 安全管理相关API
  async getLoginAttempts(page: number = 1, limit: number = 20, ip?: string): Promise<{
    data: Array<{
      id: string
      ip_address: string
      email: string | null
      success: boolean
      user_agent: string | null
      failure_reason: string | null
      created_at: string
    }>
    pagination: { page: number, limit: number, total: number, totalPages: number }
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    if (ip) params.append('ip', ip)
    
    return this.request(`/admin/security/login-attempts?${params.toString()}`)
  }

  async getIPBlacklist(page: number = 1, limit: number = 20): Promise<{
    data: Array<{
      id: string
      ip_address: string
      reason: string
      blocked_until: string | null
      is_permanent: boolean
      created_at: string
    }>
    pagination: { page: number, limit: number, total: number, totalPages: number }
  }> {
    return this.request(`/admin/security/ip-blacklist?page=${page}&limit=${limit}`)
  }

  async getSecurityLogs(page: number = 1, limit: number = 20, eventType?: string, severity?: string): Promise<{
    data: Array<{
      id: string
      event_type: string
      ip_address: string
      user_id: string | null
      user_email: string | null
      event_data: Record<string, unknown>
      severity: 'info' | 'warning' | 'error'
      created_at: string
    }>
    pagination: { page: number, limit: number, total: number, totalPages: number }
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    if (eventType) params.append('eventType', eventType)
    if (severity) params.append('severity', severity)
    
    return this.request(`/admin/security/security-logs?${params.toString()}`)
  }

  async getSecurityStats(): Promise<{
    totalLoginAttempts: number
    failedAttempts24h: number
    blockedIPs: number
    securityEvents7d: number
  }> {
    return this.request('/admin/security/stats')
  }

  async unlockIP(ip: string): Promise<{ success: boolean }> {
    return this.request(`/admin/security/ip-blacklist/${encodeURIComponent(ip)}`, {
      method: 'DELETE'
    })
  }

  async addIPToBlacklist(ip: string, reason: string): Promise<{ success: boolean }> {
    return this.request('/admin/security/ip-blacklist', {
      method: 'POST',
      body: JSON.stringify({ ip_address: ip, reason })
    })
  }

  // 获取当前IP的安全状态（无需认证）
  async getSecurityStatus(): Promise<SecurityStatus> {
    // 直接调用API，不使用request方法（因为不需要认证）
    const response = await fetch(`${this.baseURL}/admin/security-status`)
    if (!response.ok) {
      throw new Error(`获取安全状态失败: ${response.statusText}`)
    }
    return response.json()
  }

  // 活动日志相关API
  async getActivityLogs(page: number = 1, limit: number = 20, search?: string, type?: string): Promise<{
    data: Array<{
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
    }>
    pagination: { page: number, limit: number, total: number, totalPages: number }
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    if (search) params.append('search', search)
    if (type) params.append('type', type)
    
    return this.request(`/admin/logs?${params.toString()}`)
  }
}

export const adminService = new AdminService()
export { AdminService }
export default adminService
// Types are already exported above
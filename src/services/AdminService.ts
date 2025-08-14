export interface Post {
  id: string
  title: string
  content: string
  image?: string
  author: {
    id: string
    username: string
    avatar?: string
  }
  status: 'published' | 'draft' | 'pending' | 'rejected'
  likes_count: number
  comments_count: number
  views_count: number
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

import { Activity } from '../types/activity'

export interface AdminActivity extends Activity {
  status: 'draft' | 'published' | 'cancelled'
  category_id?: string
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
  upcomingActivities: number
}

class AdminService {
  private baseURL = '/api'

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
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
        // 清除本地存储的认证token
        localStorage.removeItem('adminToken')
        localStorage.removeItem('supabase.auth.token')
        
        // 抛出特定的认证失败错误
        const authError = new Error('无效的认证令牌')
        authError.name = 'AuthenticationError'
        throw authError
      }
      
      // 尝试解析响应体中的错误信息
      let errorMessage = `API request failed: ${response.statusText}`
      
      try {
        const errorData = await response.json()
        if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch (parseError) {
        // 如果无法解析JSON，使用默认错误信息
        console.warn('无法解析错误响应:', parseError)
      }
      
      throw new Error(errorMessage)
    }

    return response.json()
  }

  private async getAuthToken(): Promise<string> {
    // 首先尝试从localStorage获取管理员token（来自管理员登录）
    const adminToken = localStorage.getItem('adminToken')
    if (adminToken) {
      return adminToken
    }

    // 如果没有管理员token，尝试获取普通用户的Supabase session token
    const sessionData = localStorage.getItem('supabase.auth.token')
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData)
        if (session.access_token) {
          return session.access_token
        }
      } catch (error) {
        console.error('解析session数据失败:', error)
      }
    }

    // 如果都没有，抛出错误
    throw new Error('未找到有效的认证token，请重新登录')
  }

  // 内容管理相关API
  async getPosts(): Promise<Post[]> {
    return this.request<Post[]>('/admin/posts')
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
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/admin/users')
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
  async getActivities(): Promise<AdminActivity[]> {
    return this.request<AdminActivity[]>('/admin/activities')
  }

  async getRecentActivities(): Promise<RecentActivity[]> {
    return this.request<RecentActivity[]>('/admin/recent-activities')
  }

  async updateActivityStatus(activityId: string, status: AdminActivity['status'], is_featured?: boolean): Promise<{ success: boolean }> {
    const body: any = { status }
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
    return this.request<ActivityCategory[]>('/admin/categories')
  }

  async createCategory(categoryData: {
    name: string
    description?: string
    color?: string
    icon?: string
  }): Promise<ActivityCategory> {
    return this.request<ActivityCategory>('/admin/categories', {
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
    return this.request<ActivityCategory>(`/admin/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    })
  }

  async deleteCategory(categoryId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/categories/${categoryId}`, {
      method: 'DELETE',
    })
  }

  async toggleCategoryStatus(categoryId: string): Promise<ActivityCategory> {
    return this.request<ActivityCategory>(`/admin/categories/${categoryId}/toggle`, {
      method: 'PUT',
    })
  }

  // 内容分类管理相关API
  async getContentCategories(): Promise<ContentCategory[]> {
    return this.request<ContentCategory[]>('/admin/content-categories')
  }

  async createContentCategory(categoryData: {
    name: string
    description?: string
    color?: string
    icon?: string
    sort_order?: number
  }): Promise<ContentCategory> {
    return this.request<ContentCategory>('/admin/content-categories', {
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
    return this.request<ContentCategory>(`/admin/content-categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    })
  }

  async deleteContentCategory(categoryId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/content-categories/${categoryId}`, {
      method: 'DELETE',
    })
  }

  async toggleContentCategoryStatus(categoryId: string): Promise<ContentCategory> {
    return this.request<ContentCategory>(`/admin/content-categories/${categoryId}/toggle`, {
      method: 'PUT',
    })
  }

  // 统计数据API
  async getStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/admin/stats')
  }

  // 系统设置相关API
  async getSettings(category?: string): Promise<Record<string, any>> {
    const url = category ? `/admin/settings?category=${category}` : '/admin/settings'
    return this.request<Record<string, any>>(url)
  }

  async saveSettings(settings: Record<string, any>): Promise<{ success: boolean }> {
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

  async getPublicSettings(): Promise<Record<string, any>> {
    return this.request<Record<string, any>>('/admin/settings/public')
  }

  // 添加缺失的系统设置方法
  async getSystemSettings(): Promise<any> {
    return await this.request('/admin/settings')
  }

  async updateSystemSettings(settings: any): Promise<void> {
    await this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  }

  async resetSystemSettings(): Promise<void> {
    await this.request('/admin/settings/reset', {
      method: 'POST'
    })
  }

  async exportSystemSettings(): Promise<any> {
    return await this.request('/admin/settings/export')
  }

  async importSystemSettings(settings: any): Promise<void> {
    await this.request('/admin/settings/import', {
      method: 'POST',
      body: JSON.stringify(settings)
    })
  }

  async testEmailConfig(settings: any): Promise<void> {
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
}

export const adminService = new AdminService()
// Types are already exported above
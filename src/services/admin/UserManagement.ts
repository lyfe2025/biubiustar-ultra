/**
 * 用户管理服务
 * 负责用户相关的管理功能
 */
import { AdminBaseService } from './AdminBaseService'
import type {
  User,
  UserStats,
  CreateUserData,
  ApiResponse,
  PaginatedApiResponse
} from './types'

export class UserManagement extends AdminBaseService {
  /**
   * 获取用户列表
   * @param page 页码
   * @param limit 每页数量
   * @param search 搜索关键词
   * @param role 用户角色筛选
   * @param status 用户状态筛选
   * @returns Promise<PaginatedApiResponse<User>> 用户列表
   */
  async getUsers(
    page: number = 1, 
    limit: number = 10, 
    search?: string, 
    role?: string, 
    status?: string
  ): Promise<PaginatedApiResponse<User>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    if (search) {
      params.append('search', search)
    }
    if (role) {
      params.append('role', role)
    }
    if (status) {
      params.append('status', status)
    }
    
    return this.request<PaginatedApiResponse<User>>(`/admin/users?${params}`)
  }

  /**
   * 获取单个用户详情
   * @param id 用户ID
   * @returns Promise<ApiResponse<User>> 用户详情
   */
  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`/admin/users/${id}`)
  }

  /**
   * 创建新用户
   * @param userData 用户数据
   * @returns Promise<ApiResponse<User>> 创建的用户
   */
  async createUser(userData: CreateUserData): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param userData 更新的用户数据
   * @returns Promise<ApiResponse<User>> 更新后的用户
   */
  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
  }

  /**
   * 删除用户
   * @param id 用户ID
   * @returns Promise<ApiResponse<{ success: boolean }>> 删除结果
   */
  async deleteUser(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/users/${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * 批量删除用户
   * @param ids 用户ID数组
   * @returns Promise<ApiResponse<{ success: boolean, deletedCount: number }>> 删除结果
   */
  async deleteUsers(ids: string[]): Promise<ApiResponse<{ success: boolean, deletedCount: number }>> {
    return this.request<ApiResponse<{ success: boolean, deletedCount: number }>>('/admin/users/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids })
    })
  }

  /**
   * 激活/禁用用户
   * @param id 用户ID
   * @param active 是否激活
   * @returns Promise<ApiResponse<User>> 更新后的用户
   */
  async toggleUserActive(id: string, active: boolean): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`/admin/users/${id}/toggle-active`, {
      method: 'PATCH',
      body: JSON.stringify({ active })
    })
  }

  /**
   * 更新用户角色
   * @param id 用户ID
   * @param role 新角色
   * @returns Promise<ApiResponse<User>> 更新后的用户
   */
  async updateUserRole(id: string, role: string): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    })
  }

  /**
   * 重置用户密码
   * @param id 用户ID
   * @param newPassword 新密码
   * @returns Promise<ApiResponse<{ success: boolean }>> 重置结果
   */
  async resetUserPassword(id: string, newPassword: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword })
    })
  }

  /**
   * 发送密码重置邮件
   * @param id 用户ID
   * @returns Promise<ApiResponse<{ success: boolean }>> 发送结果
   */
  async sendPasswordResetEmail(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/users/${id}/send-password-reset`, {
      method: 'POST'
    })
  }

  /**
   * 获取用户统计信息
   * @returns Promise<ApiResponse<UserStats>> 用户统计
   */
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    return this.request<ApiResponse<UserStats>>('/admin/users/stats')
  }

  /**
   * 获取用户活动历史
   * @param id 用户ID
   * @param page 页码
   * @param limit 每页数量
   * @returns Promise<PaginatedApiResponse<any>> 用户活动历史
   */
  async getUserActivityHistory(
    id: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<PaginatedApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    return this.request<PaginatedApiResponse<any>>(`/admin/users/${id}/activity-history?${params}`)
  }

  /**
   * 获取用户发布的内容
   * @param id 用户ID
   * @param type 内容类型 ('posts' | 'activities' | 'comments')
   * @param page 页码
   * @param limit 每页数量
   * @returns Promise<PaginatedApiResponse<any>> 用户内容
   */
  async getUserContent(
    id: string, 
    type: 'posts' | 'activities' | 'comments',
    page: number = 1, 
    limit: number = 10
  ): Promise<PaginatedApiResponse<any>> {
    const params = new URLSearchParams({
      type,
      page: page.toString(),
      limit: limit.toString()
    })
    
    return this.request<PaginatedApiResponse<any>>(`/admin/users/${id}/content?${params}`)
  }

  /**
   * 验证用户邮箱
   * @param id 用户ID
   * @returns Promise<ApiResponse<{ success: boolean }>> 验证结果
   */
  async verifyUserEmail(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/users/${id}/verify-email`, {
      method: 'POST'
    })
  }

  /**
   * 取消验证用户邮箱
   * @param id 用户ID
   * @returns Promise<ApiResponse<{ success: boolean }>> 取消验证结果
   */
  async unverifyUserEmail(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/users/${id}/unverify-email`, {
      method: 'POST'
    })
  }

  /**
   * 获取在线用户列表
   * @returns Promise<ApiResponse<User[]>> 在线用户列表
   */
  async getOnlineUsers(): Promise<ApiResponse<User[]>> {
    return this.request<ApiResponse<User[]>>('/admin/users/online')
  }

  /**
   * 更新用户状态
   * @param userId 用户ID
   * @param status 新状态
   * @returns Promise<{ success: boolean }> 更新结果
   */
  async updateUserStatus(userId: string, status: string): Promise<{ success: boolean }> {
    const response = await this.request<ApiResponse<{ success: boolean }>>(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
    return response.data
  }

  /**
   * 更新用户密码
   * @param userId 用户ID
   * @param newPassword 新密码
   * @returns Promise<{ success: boolean }> 更新结果
   */
  async updateUserPassword(userId: string, newPassword: string): Promise<{ success: boolean }> {
    const response = await this.request<ApiResponse<{ success: boolean }>>(`/admin/users/${userId}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ newPassword })
    })
    return response.data
  }

  /**
   * 导出用户数据
   * @param format 导出格式 ('csv' | 'excel' | 'json')
   * @param filters 筛选条件
   * @returns Promise<Blob> 导出文件
   */
  async exportUsers(format: 'csv' | 'excel' | 'json' = 'csv', filters?: any): Promise<Blob> {
    const params = new URLSearchParams({ format })
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key].toString())
        }
      })
    }
    
    const response = await fetch(`${this.baseURL}/admin/users/export?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await this.getAuthToken()}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`导出失败: ${response.statusText}`)
    }
    
    return response.blob()
  }


}
/**
 * 内容管理服务
 * 负责帖子、活动等内容相关的管理功能
 */
import { AdminBaseService } from './AdminBaseService'
import type {
  Post,
  AdminActivity,
  ApiResponse,
  PaginatedApiResponse,
  CreatePostData,
  UpdatePostData,
  PostStatus,
  ContentCategory,
  CreateContentCategoryData,
  UpdateContentCategoryData
} from './types'

export class ContentManagement extends AdminBaseService {
  /**
   * 获取所有帖子
   * @param page 页码
   * @param limit 每页数量
   * @param search 搜索关键词
   * @returns Promise<PaginatedApiResponse<Post>> 帖子列表
   */
  async getPosts(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: PostStatus,
    category?: string
  ): Promise<PaginatedApiResponse<Post>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    if (search) {
      params.append('search', search)
    }
    
    const response = await this.request<any>(`/admin/posts?${params}`)
    // 转换后端返回的数据格式以匹配前端期望的类型
    return {
      data: response.data || [],
      pagination: response.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
      _cacheInfo: response._cacheInfo
    } as PaginatedApiResponse<Post>
  }

  /**
   * 获取单个帖子详情
   * @param id 帖子ID
   * @returns Promise<ApiResponse<Post>> 帖子详情
   */
  async getPost(id: string): Promise<ApiResponse<Post>> {
    return this.request<ApiResponse<Post>>(`/admin/posts/${id}`)
  }

  /**
   * 创建新帖子
   * @param postData 帖子数据
   * @returns Promise<ApiResponse<Post>> 创建的帖子
   */
  async createPost(postData: Partial<Post>): Promise<ApiResponse<Post>> {
    return this.request<ApiResponse<Post>>('/admin/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    })
  }

  /**
   * 更新帖子
   * @param id 帖子ID
   * @param postData 更新的帖子数据
   * @returns Promise<ApiResponse<Post>> 更新后的帖子
   */
  async updatePost(id: string, postData: Partial<Post>): Promise<ApiResponse<Post>> {
    return this.request<ApiResponse<Post>>(`/admin/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData)
    })
  }

  /**
   * 删除帖子
   * @param id 帖子ID
   * @returns Promise<ApiResponse<{ success: boolean }>> 删除结果
   */
  async deletePost(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/posts/${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * 批量删除帖子
   * @param ids 帖子ID数组
   * @returns Promise<ApiResponse<{ success: boolean, deletedCount: number }>> 删除结果
   */
  async deletePosts(ids: string[]): Promise<ApiResponse<{ success: boolean, deletedCount: number }>> {
    return this.request<ApiResponse<{ success: boolean, deletedCount: number }>>('/admin/posts/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids })
    })
  }

  /**
   * 发布/取消发布帖子
   * @param id 帖子ID
   * @param published 是否发布
   * @returns Promise<ApiResponse<Post>> 更新后的帖子
   */
  async togglePostPublished(id: string, published: boolean): Promise<ApiResponse<Post>> {
    return this.request<ApiResponse<Post>>(`/admin/posts/${id}/toggle-published`, {
      method: 'PATCH',
      body: JSON.stringify({ published })
    })
  }

  /**
   * 置顶/取消置顶帖子
   * @param id 帖子ID
   * @param pinned 是否置顶
   * @returns Promise<ApiResponse<Post>> 更新后的帖子
   */
  async togglePostPinned(id: string, pinned: boolean): Promise<ApiResponse<Post>> {
    return this.request<ApiResponse<Post>>(`/admin/posts/${id}/toggle-pinned`, {
      method: 'PATCH',
      body: JSON.stringify({ pinned })
    })
  }

  /**
   * 更新帖子状态
   * @param id 帖子ID
   * @param status 状态
   * @returns Promise<ApiResponse<{ success: boolean }>> 更新结果
   */
  async updatePostStatus(id: string, status: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/posts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  }

  // ==================== 活动管理 ====================

  /**
   * 获取所有活动
   * @param page 页码
   * @param limit 每页数量
   * @param search 搜索关键词
   * @returns Promise<PaginatedApiResponse<AdminActivity>> 活动列表
   */
  async getActivities(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedApiResponse<AdminActivity>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    if (search) {
      params.append('search', search)
    }
    
    return this.request<PaginatedApiResponse<AdminActivity>>(`/admin/activities?${params}`)
  }

  /**
   * 获取单个活动详情
   * @param id 活动ID
   * @returns Promise<ApiResponse<AdminActivity>> 活动详情
   */
  async getActivity(id: string): Promise<ApiResponse<AdminActivity>> {
    return this.request<ApiResponse<AdminActivity>>(`/admin/activities/${id}`)
  }

  /**
   * 创建新活动
   * @param activityData 活动数据
   * @returns Promise<ApiResponse<AdminActivity>> 创建的活动
   */
  async createActivity(activityData: Partial<AdminActivity>): Promise<ApiResponse<AdminActivity>> {
    return this.request<ApiResponse<AdminActivity>>('/admin/activities', {
      method: 'POST',
      body: JSON.stringify(activityData)
    })
  }

  /**
   * 更新活动
   * @param id 活动ID
   * @param activityData 更新的活动数据
   * @returns Promise<ApiResponse<AdminActivity>> 更新后的活动
   */
  async updateActivity(id: string, activityData: Partial<AdminActivity>): Promise<ApiResponse<AdminActivity>> {
    return this.request<ApiResponse<AdminActivity>>(`/admin/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(activityData)
    })
  }

  /**
   * 删除活动
   * @param id 活动ID
   * @returns Promise<ApiResponse<{ success: boolean }>> 删除结果
   */
  async deleteActivity(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/activities/${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * 批量删除活动
   * @param ids 活动ID数组
   * @returns Promise<ApiResponse<{ success: boolean, deletedCount: number }>> 删除结果
   */
  async deleteActivities(ids: string[]): Promise<ApiResponse<{ success: boolean, deletedCount: number }>> {
    return this.request<ApiResponse<{ success: boolean, deletedCount: number }>>('/admin/activities/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids })
    })
  }

  /**
   * 发布/取消发布活动
   * @param id 活动ID
   * @param published 是否发布
   * @returns Promise<ApiResponse<AdminActivity>> 更新后的活动
   */
  async toggleActivityPublished(id: string, published: boolean): Promise<ApiResponse<AdminActivity>> {
    return this.request<ApiResponse<AdminActivity>>(`/admin/activities/${id}/toggle-published`, {
      method: 'PATCH',
      body: JSON.stringify({ published })
    })
  }

  /**
   * 置顶/取消置顶活动
   * @param id 活动ID
   * @param featured 是否置顶
   * @returns Promise<ApiResponse<AdminActivity>> 更新后的活动
   */
  async toggleActivityFeatured(id: string, featured: boolean): Promise<ApiResponse<AdminActivity>> {
    return this.request<ApiResponse<AdminActivity>>(`/admin/activities/${id}/toggle-featured`, {
      method: 'PATCH',
      body: JSON.stringify({ featured })
    })
  }

  /**
   * 更新活动状态
   * @param id 活动ID
   * @param status 状态
   * @param recommended 是否推荐
   * @returns Promise<ApiResponse<{ success: boolean }>> 更新结果
   */
  async updateActivityStatus(id: string, status: string, recommended?: boolean): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/activities/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, recommended })
    })
  }
}
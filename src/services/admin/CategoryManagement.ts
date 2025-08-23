/**
 * 分类管理服务
 * 负责活动分类和内容分类的管理功能
 */
import { AdminBaseService } from './AdminBaseService'
import type {
  ActivityCategory,
  ContentCategory,
  CreateActivityCategoryData,
  UpdateActivityCategoryData,
  CreateContentCategoryData,
  UpdateContentCategoryData,
  ApiResponse,
  PaginatedApiResponse
} from './types'

export class CategoryManagement extends AdminBaseService {
  // ==================== 活动分类管理 ====================

  /**
   * 获取所有活动分类
   * @param page 页码
   * @param limit 每页数量
   * @param search 搜索关键词
   * @returns Promise<PaginatedApiResponse<ActivityCategory>> 活动分类列表
   */
  async getActivityCategories(
    page: number = 1, 
    limit: number = 10, 
    search?: string
  ): Promise<PaginatedApiResponse<ActivityCategory>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    if (search) {
      params.append('search', search)
    }
    
    return this.request<PaginatedApiResponse<ActivityCategory>>(`/admin/categories/activity?${params}`)
  }

  /**
   * 获取单个活动分类详情
   * @param id 分类ID
   * @returns Promise<ApiResponse<ActivityCategory>> 活动分类详情
   */
  async getActivityCategory(id: string): Promise<ApiResponse<ActivityCategory>> {
    return this.request<ApiResponse<ActivityCategory>>(`/admin/categories/activity/${id}`)
  }

  /**
   * 创建新活动分类
   * @param categoryData 分类数据
   * @returns Promise<ApiResponse<ActivityCategory>> 创建的活动分类
   */
  async createActivityCategory(categoryData: CreateActivityCategoryData): Promise<ApiResponse<ActivityCategory>> {
    return this.request<ApiResponse<ActivityCategory>>('/admin/categories/activity', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    })
  }

  /**
   * 更新活动分类
   * @param id 分类ID
   * @param categoryData 更新的分类数据
   * @returns Promise<ApiResponse<ActivityCategory>> 更新后的活动分类
   */
  async updateActivityCategory(id: string, categoryData: UpdateActivityCategoryData): Promise<ApiResponse<ActivityCategory>> {
    return this.request<ApiResponse<ActivityCategory>>(`/admin/categories/activity/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    })
  }

  /**
   * 删除活动分类
   * @param id 分类ID
   * @returns Promise<ApiResponse<{ success: boolean }>> 删除结果
   */
  async deleteActivityCategory(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/categories/activity/${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * 批量删除活动分类
   * @param ids 分类ID数组
   * @returns Promise<ApiResponse<{ success: boolean, deletedCount: number }>> 删除结果
   */
  async deleteActivityCategories(ids: string[]): Promise<ApiResponse<{ success: boolean, deletedCount: number }>> {
    return this.request<ApiResponse<{ success: boolean, deletedCount: number }>>('/admin/categories/activity/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids })
    })
  }

  /**
   * 启用/禁用活动分类
   * @param id 分类ID
   * @param active 是否启用
   * @returns Promise<ApiResponse<ActivityCategory>> 更新后的活动分类
   */
  async toggleActivityCategoryActive(id: string, active: boolean): Promise<ApiResponse<ActivityCategory>> {
    return this.request<ApiResponse<ActivityCategory>>(`/admin/categories/activity/${id}/toggle-active`, {
      method: 'PATCH',
      body: JSON.stringify({ active })
    })
  }

  /**
   * 更新活动分类排序
   * @param id 分类ID
   * @param sortOrder 排序值
   * @returns Promise<ApiResponse<ActivityCategory>> 更新后的活动分类
   */
  async updateActivityCategorySortOrder(id: string, sortOrder: number): Promise<ApiResponse<ActivityCategory>> {
    return this.request<ApiResponse<ActivityCategory>>(`/admin/categories/activity/${id}/sort-order`, {
      method: 'PATCH',
      body: JSON.stringify({ sortOrder })
    })
  }

  /**
   * 批量更新活动分类排序
   * @param categories 分类排序数据数组 [{ id: string, sortOrder: number }]
   * @returns Promise<ApiResponse<{ success: boolean }>> 更新结果
   */
  async batchUpdateActivityCategorySortOrder(
    categories: Array<{ id: string, sortOrder: number }>
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>('/admin/categories/activity/batch-sort', {
      method: 'POST',
      body: JSON.stringify({ categories })
    })
  }

  // ==================== 内容分类管理 ====================

  /**
   * 获取所有内容分类
   * @param page 页码
   * @param limit 每页数量
   * @param search 搜索关键词
   * @returns Promise<PaginatedApiResponse<ContentCategory>> 内容分类列表
   */
  async getContentCategories(
    page: number = 1, 
    limit: number = 10, 
    search?: string
  ): Promise<PaginatedApiResponse<ContentCategory>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    if (search) {
      params.append('search', search)
    }
    
    return this.request<PaginatedApiResponse<ContentCategory>>(`/admin/categories/content?${params}`)
  }

  /**
   * 获取单个内容分类详情
   * @param id 分类ID
   * @returns Promise<ApiResponse<ContentCategory>> 内容分类详情
   */
  async getContentCategory(id: string): Promise<ApiResponse<ContentCategory>> {
    return this.request<ApiResponse<ContentCategory>>(`/admin/categories/content/${id}`)
  }

  /**
   * 创建新内容分类
   * @param categoryData 分类数据
   * @returns Promise<ApiResponse<ContentCategory>> 创建的内容分类
   */
  async createContentCategory(categoryData: CreateContentCategoryData): Promise<ApiResponse<ContentCategory>> {
    return this.request<ApiResponse<ContentCategory>>('/admin/categories/content', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    })
  }

  /**
   * 更新内容分类
   * @param id 分类ID
   * @param categoryData 更新的分类数据
   * @returns Promise<ApiResponse<ContentCategory>> 更新后的内容分类
   */
  async updateContentCategory(id: string, categoryData: UpdateContentCategoryData): Promise<ApiResponse<ContentCategory>> {
    return this.request<ApiResponse<ContentCategory>>(`/admin/categories/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    })
  }

  /**
   * 删除内容分类
   * @param id 分类ID
   * @returns Promise<ApiResponse<{ success: boolean }>> 删除结果
   */
  async deleteContentCategory(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/categories/content/${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * 批量删除内容分类
   * @param ids 分类ID数组
   * @returns Promise<ApiResponse<{ success: boolean, deletedCount: number }>> 删除结果
   */
  async deleteContentCategories(ids: string[]): Promise<ApiResponse<{ success: boolean, deletedCount: number }>> {
    return this.request<ApiResponse<{ success: boolean, deletedCount: number }>>('/admin/categories/content/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids })
    })
  }

  /**
   * 启用/禁用内容分类
   * @param id 分类ID
   * @param active 是否启用
   * @returns Promise<ApiResponse<ContentCategory>> 更新后的内容分类
   */
  async toggleContentCategoryActive(id: string, active: boolean): Promise<ApiResponse<ContentCategory>> {
    return this.request<ApiResponse<ContentCategory>>(`/admin/categories/content/${id}/toggle-active`, {
      method: 'PATCH',
      body: JSON.stringify({ active })
    })
  }

  /**
   * 更新内容分类排序
   * @param id 分类ID
   * @param sortOrder 排序值
   * @returns Promise<ApiResponse<ContentCategory>> 更新后的内容分类
   */
  async updateContentCategorySortOrder(id: string, sortOrder: number): Promise<ApiResponse<ContentCategory>> {
    return this.request<ApiResponse<ContentCategory>>(`/admin/categories/content/${id}/sort-order`, {
      method: 'PATCH',
      body: JSON.stringify({ sortOrder })
    })
  }

  /**
   * 批量更新内容分类排序
   * @param categories 分类排序数据数组 [{ id: string, sortOrder: number }]
   * @returns Promise<ApiResponse<{ success: boolean }>> 更新结果
   */
  async batchUpdateContentCategorySortOrder(
    categories: Array<{ id: string, sortOrder: number }>
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>('/admin/categories/content/batch-sort', {
      method: 'POST',
      body: JSON.stringify({ categories })
    })
  }

  // ==================== 通用分类操作 ====================

  /**
   * 获取分类统计信息
   * @param type 分类类型 ('activity' | 'content')
   * @returns Promise<ApiResponse<any>> 分类统计
   */
  async getCategoryStats(type: 'activity' | 'content'): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/admin/categories/${type}/stats`)
  }

  /**
   * 导出分类数据
   * @param type 分类类型 ('activity' | 'content')
   * @param format 导出格式 ('csv' | 'excel' | 'json')
   * @returns Promise<Blob> 导出文件
   */
  async exportCategories(type: 'activity' | 'content', format: 'csv' | 'excel' | 'json' = 'csv'): Promise<Blob> {
    const params = new URLSearchParams({ format })
    
    const response = await fetch(`${this.baseURL}/admin/categories/${type}/export?${params}`, {
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

  /**
   * 切换内容分类状态
   * @param id 分类ID
   * @returns Promise<ApiResponse<{ success: boolean }>> 切换结果
   */
  async toggleContentCategoryStatus(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/categories/content/${id}/toggle`, {
      method: 'PUT'
    })
  }

}
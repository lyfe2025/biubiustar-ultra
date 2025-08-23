/**
 * 系统设置管理服务
 * 负责系统配置、缓存管理等功能
 */
import { AdminBaseService } from './AdminBaseService'
import type {
  DashboardStats,
  CacheInfo,
  ApiResponse
} from './types'

export class SystemSettings extends AdminBaseService {
  /**
   * 获取仪表板统计数据
   * @returns Promise<ApiResponse<DashboardStats>> 仪表板统计
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<ApiResponse<DashboardStats>>('/admin/stats')
  }

  /**
   * 获取统计数据（getDashboardStats的别名）
   * @returns Promise<ApiResponse<DashboardStats>> 统计数据
   */
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    return this.getDashboardStats()
  }

  /**
   * 获取系统设置
   * @returns Promise<ApiResponse<any>> 系统设置
   */
  async getSystemSettings(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/admin/settings')
  }

  /**
   * 更新系统设置
   * @param settings 设置数据
   * @returns Promise<ApiResponse<any>> 更新后的设置
   */
  async updateSystemSettings(settings: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  }

  /**
   * 重置系统设置为默认值
   * @returns Promise<ApiResponse<any>> 重置后的设置
   */
  async resetSystemSettings(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/admin/settings/reset', {
      method: 'POST'
    })
  }

  /**
   * 导入系统设置
   * @param settingsData 设置数据
   * @returns Promise<ApiResponse<{ success: boolean }>> 导入结果
   */
  async importSystemSettings(settingsData: any): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>('/admin/settings/import', {
      method: 'POST',
      body: JSON.stringify(settingsData)
    })
  }

  /**
   * 导出系统设置
   * @returns Promise<ApiResponse<any>> 导出的设置数据
   */
  async exportSystemSettings(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/admin/settings/export')
  }

  /**
   * 测试邮件配置
   * @param testEmail 测试邮箱地址
   * @returns Promise<ApiResponse<{ success: boolean, message?: string }>> 测试结果
   */
  async testEmailConfiguration(testEmail: string): Promise<ApiResponse<{ success: boolean, message?: string }>> {
    return this.request<ApiResponse<{ success: boolean, message?: string }>>('/admin/settings/test-email', {
      method: 'POST',
      body: JSON.stringify({ testEmail })
    })
  }

  /**
   * 获取邮件配置状态
   * @returns Promise<ApiResponse<{ configured: boolean, provider?: string }>> 邮件配置状态
   */
  async getEmailConfigurationStatus(): Promise<ApiResponse<{ configured: boolean, provider?: string }>> {
    return this.request<ApiResponse<{ configured: boolean, provider?: string }>>('/admin/settings/email-status')
  }

  /**
   * 更新邮件配置
   * @param emailConfig 邮件配置
   * @returns Promise<ApiResponse<{ success: boolean }>> 更新结果
   */
  async updateEmailConfiguration(emailConfig: any): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>('/admin/settings/email-config', {
      method: 'PUT',
      body: JSON.stringify(emailConfig)
    })
  }

  // ==================== 缓存管理 ====================

  /**
   * 获取缓存信息
   * @returns Promise<ApiResponse<CacheInfo>> 缓存信息
   */
  async getCacheInfo(): Promise<ApiResponse<CacheInfo>> {
    return this.request<ApiResponse<CacheInfo>>('/admin/cache/info')
  }

  /**
   * 清除所有缓存
   * @returns Promise<ApiResponse<{ success: boolean, message: string }>> 清除结果
   */
  async clearAllCache(): Promise<ApiResponse<{ success: boolean, message: string }>> {
    return this.request<ApiResponse<{ success: boolean, message: string }>>('/admin/cache/clear-all', {
      method: 'POST'
    })
  }

  /**
   * 清除特定类型的缓存
   * @param cacheType 缓存类型
   * @returns Promise<ApiResponse<{ success: boolean, message: string }>> 清除结果
   */
  async clearCacheByType(cacheType: string): Promise<ApiResponse<{ success: boolean, message: string }>> {
    return this.request<ApiResponse<{ success: boolean, message: string }>>(`/admin/cache/clear/${cacheType}`, {
      method: 'POST'
    })
  }

  /**
   * 清除特定键的缓存
   * @param cacheKey 缓存键
   * @returns Promise<ApiResponse<{ success: boolean, message: string }>> 清除结果
   */
  async clearCacheByKey(cacheKey: string): Promise<ApiResponse<{ success: boolean, message: string }>> {
    return this.request<ApiResponse<{ success: boolean, message: string }>>('/admin/cache/clear-key', {
      method: 'POST',
      body: JSON.stringify({ key: cacheKey })
    })
  }

  /**
   * 预热缓存
   * @param cacheTypes 要预热的缓存类型数组
   * @returns Promise<ApiResponse<{ success: boolean, message: string }>> 预热结果
   */
  async warmupCache(cacheTypes?: string[]): Promise<ApiResponse<{ success: boolean, message: string }>> {
    return this.request<ApiResponse<{ success: boolean, message: string }>>('/admin/cache/warmup', {
      method: 'POST',
      body: JSON.stringify({ types: cacheTypes })
    })
  }

  /**
   * 获取缓存统计信息
   * @returns Promise<ApiResponse<any>> 缓存统计
   */
  async getCacheStats(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/admin/cache/stats')
  }

  // ==================== 系统维护 ====================

  /**
   * 获取系统健康状态
   * @returns Promise<ApiResponse<any>> 系统健康状态
   */
  async getSystemHealth(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/admin/settings/health')
  }

  /**
   * 获取系统信息
   * @returns Promise<ApiResponse<any>> 系统信息
   */
  async getSystemInfo(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/admin/settings/info')
  }

  /**
   * 执行系统清理
   * @param cleanupTypes 清理类型数组
   * @returns Promise<ApiResponse<{ success: boolean, message: string }>> 清理结果
   */
  async performSystemCleanup(cleanupTypes: string[]): Promise<ApiResponse<{ success: boolean, message: string }>> {
    return this.request<ApiResponse<{ success: boolean, message: string }>>('/admin/settings/cleanup', {
      method: 'POST',
      body: JSON.stringify({ types: cleanupTypes })
    })
  }

  /**
   * 获取系统日志
   * @param logType 日志类型
   * @param page 页码
   * @param limit 每页数量
   * @returns Promise<ApiResponse<any>> 系统日志
   */
  async getSystemLogs(
    logType: string = 'all', 
    page: number = 1, 
    limit: number = 100
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      type: logType,
      page: page.toString(),
      limit: limit.toString()
    })
    
    return this.request<ApiResponse<any>>(`/admin/settings/logs?${params}`)
  }

  /**
   * 清除系统日志
   * @param logType 日志类型
   * @param olderThanDays 清除多少天前的日志
   * @returns Promise<ApiResponse<{ success: boolean, deletedCount: number }>> 清除结果
   */
  async clearSystemLogs(
    logType: string = 'all', 
    olderThanDays: number = 30
  ): Promise<ApiResponse<{ success: boolean, deletedCount: number }>> {
    return this.request<ApiResponse<{ success: boolean, deletedCount: number }>>('/admin/settings/logs/clear', {
      method: 'POST',
      body: JSON.stringify({ type: logType, olderThanDays })
    })
  }

  // ==================== 备份与恢复 ====================

  /**
   * 创建系统备份
   * @param backupType 备份类型
   * @returns Promise<ApiResponse<{ success: boolean, backupId: string }>> 备份结果
   */
  async createSystemBackup(backupType: 'full' | 'data' | 'config' = 'full'): Promise<ApiResponse<{ success: boolean, backupId: string }>> {
    return this.request<ApiResponse<{ success: boolean, backupId: string }>>('/admin/settings/backup', {
      method: 'POST',
      body: JSON.stringify({ type: backupType })
    })
  }

  /**
   * 获取备份列表
   * @returns Promise<ApiResponse<any[]>> 备份列表
   */
  async getBackupList(): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>('/admin/settings/backups')
  }

  /**
   * 恢复系统备份
   * @param backupId 备份ID
   * @returns Promise<ApiResponse<{ success: boolean, message: string }>> 恢复结果
   */
  async restoreSystemBackup(backupId: string): Promise<ApiResponse<{ success: boolean, message: string }>> {
    return this.request<ApiResponse<{ success: boolean, message: string }>>(`/admin/settings/backup/${backupId}/restore`, {
      method: 'POST'
    })
  }

  /**
   * 删除系统备份
   * @param backupId 备份ID
   * @returns Promise<ApiResponse<{ success: boolean }>> 删除结果
   */
  async deleteSystemBackup(backupId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/settings/backup/${backupId}`, {
      method: 'DELETE'
    })
  }

  // ==================== 性能监控 ====================

  /**
   * 获取性能指标
   * @param timeRange 时间范围 ('1h' | '24h' | '7d' | '30d')
   * @returns Promise<ApiResponse<any>> 性能指标
   */
  async getPerformanceMetrics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ range: timeRange })
    return this.request<ApiResponse<any>>(`/admin/settings/performance?${params}`)
  }

  /**
   * 获取资源使用情况
   * @returns Promise<ApiResponse<any>> 资源使用情况
   */
  async getResourceUsage(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/admin/settings/resources')
  }
}
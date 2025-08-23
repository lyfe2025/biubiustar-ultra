/**
 * 安全管理服务
 * 负责登录尝试、IP黑名单、安全日志等安全相关功能
 */
import { AdminBaseService } from './AdminBaseService'
import type {
  SecurityStatus,
  SecurityStats,
  LoginAttempt,
  IPBlacklistRecord,
  SecurityLogRecord,
  ActivityLogRecord,
  ApiResponse,
  PaginatedApiResponse
} from './types'

export class SecurityManagement extends AdminBaseService {
  /**
   * 获取当前IP的安全状态
   * @returns Promise<ApiResponse<SecurityStatus>> 安全状态
   */
  async getCurrentIPSecurityStatus(): Promise<ApiResponse<SecurityStatus>> {
    return this.request<ApiResponse<SecurityStatus>>('/admin/security/current-ip-status')
  }

  /**
   * 获取安全统计信息
   * @returns Promise<ApiResponse<SecurityStats>> 安全统计
   */
  async getSecurityStats(): Promise<ApiResponse<SecurityStats>> {
    return this.request<ApiResponse<SecurityStats>>('/admin/security/stats')
  }

  // ==================== 登录尝试管理 ====================

  /**
   * 获取登录尝试记录
   * @param page 页码
   * @param limit 每页数量
   * @param status 状态筛选 ('success' | 'failed' | 'blocked')
   * @param ip IP地址筛选
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns Promise<PaginatedApiResponse<LoginAttempt>> 登录尝试列表
   */
  async getLoginAttempts(
    page: number = 1,
    limit: number = 10,
    status?: 'success' | 'failed' | 'blocked',
    ip?: string,
    startDate?: string,
    endDate?: string
  ): Promise<PaginatedApiResponse<LoginAttempt>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    if (status) params.append('status', status)
    if (ip) params.append('ip', ip)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    return this.request<PaginatedApiResponse<LoginAttempt>>(`/admin/security/login-attempts?${params}`)
  }

  /**
   * 获取失败登录尝试统计
   * @param timeRange 时间范围 ('1h' | '24h' | '7d' | '30d')
   * @returns Promise<ApiResponse<any>> 失败登录统计
   */
  async getFailedLoginStats(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ range: timeRange })
    return this.request<ApiResponse<any>>(`/admin/security/failed-login-stats?${params}`)
  }

  /**
   * 清除登录尝试记录
   * @param olderThanDays 清除多少天前的记录
   * @returns Promise<ApiResponse<{ success: boolean, deletedCount: number }>> 清除结果
   */
  async clearLoginAttempts(olderThanDays: number = 30): Promise<ApiResponse<{ success: boolean, deletedCount: number }>> {
    return this.request<ApiResponse<{ success: boolean, deletedCount: number }>>('/admin/security/login-attempts/clear', {
      method: 'POST',
      body: JSON.stringify({ olderThanDays })
    })
  }

  // ==================== IP黑名单管理 ====================

  /**
   * 获取IP黑名单
   * @param page 页码
   * @param limit 每页数量
   * @param search IP地址搜索
   * @returns Promise<PaginatedApiResponse<IPBlacklistRecord>> IP黑名单列表
   */
  async getIPBlacklist(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<PaginatedApiResponse<IPBlacklistRecord>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    if (search) params.append('search', search)
    
    return this.request<PaginatedApiResponse<IPBlacklistRecord>>(`/admin/security/ip-blacklist?${params}`)
  }

  /**
   * 添加IP到黑名单
   * @param ip IP地址
   * @param reason 封禁原因
   * @param expiresAt 过期时间（可选）
   * @returns Promise<ApiResponse<IPBlacklistRecord>> 添加的黑名单记录
   */
  async addIPToBlacklist(
    ip: string, 
    reason: string, 
    expiresAt?: string
  ): Promise<ApiResponse<IPBlacklistRecord>> {
    return this.request<ApiResponse<IPBlacklistRecord>>('/admin/security/ip-blacklist', {
      method: 'POST',
      body: JSON.stringify({ ip, reason, expiresAt })
    })
  }

  /**
   * 从黑名单中移除IP
   * @param id 黑名单记录ID
   * @returns Promise<ApiResponse<{ success: boolean }>> 移除结果
   */
  async removeIPFromBlacklist(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>(`/admin/security/ip-blacklist/${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * 解锁IP地址
   * @param ip IP地址
   * @returns Promise<ApiResponse<{ success: boolean }>> 解锁结果
   */
  async unlockIP(ip: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<ApiResponse<{ success: boolean }>>('/admin/security/unlock-ip', {
      method: 'POST',
      body: JSON.stringify({ ip })
    })
  }

  /**
   * 批量解锁IP地址
   * @param ips IP地址数组
   * @returns Promise<ApiResponse<{ success: boolean, unlockedCount: number }>> 解锁结果
   */
  async batchUnlockIPs(ips: string[]): Promise<ApiResponse<{ success: boolean, unlockedCount: number }>> {
    return this.request<ApiResponse<{ success: boolean, unlockedCount: number }>>('/admin/security/batch-unlock-ips', {
      method: 'POST',
      body: JSON.stringify({ ips })
    })
  }

  /**
   * 更新IP黑名单记录
   * @param id 记录ID
   * @param data 更新数据
   * @returns Promise<ApiResponse<IPBlacklistRecord>> 更新后的记录
   */
  async updateIPBlacklistRecord(
    id: string, 
    data: Partial<IPBlacklistRecord>
  ): Promise<ApiResponse<IPBlacklistRecord>> {
    return this.request<ApiResponse<IPBlacklistRecord>>(`/admin/security/ip-blacklist/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // ==================== 安全日志管理 ====================

  /**
   * 获取安全日志
   * @param page 页码
   * @param limit 每页数量
   * @param level 日志级别筛选
   * @param action 操作类型筛选
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns Promise<PaginatedApiResponse<SecurityLogRecord>> 安全日志列表
   */
  async getSecurityLogs(
    page: number = 1, 
    limit: number = 10, 
    eventType?: string, 
    severity?: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<PaginatedApiResponse<SecurityLogRecord>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    if (eventType) params.append('eventType', eventType)
    if (severity) params.append('severity', severity)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    return this.request<PaginatedApiResponse<SecurityLogRecord>>(`/admin/security/logs?${params}`)
  }

  /**
   * 获取安全日志统计
   * @param timeRange 时间范围
   * @returns Promise<ApiResponse<any>> 安全日志统计
   */
  async getSecurityLogStats(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ range: timeRange })
    return this.request<ApiResponse<any>>(`/admin/security/log-stats?${params}`)
  }

  /**
   * 清除安全日志
   * @param olderThanDays 清除多少天前的日志
   * @returns Promise<ApiResponse<{ success: boolean, deletedCount: number }>> 清除结果
   */
  async clearSecurityLogs(olderThanDays: number = 30): Promise<ApiResponse<{ success: boolean, deletedCount: number }>> {
    return this.request<ApiResponse<{ success: boolean, deletedCount: number }>>('/admin/security/logs/clear', {
      method: 'POST',
      body: JSON.stringify({ olderThanDays })
    })
  }

  // ==================== 活动日志管理 ====================

  /**
   * 获取活动日志
   * @param page 页码
   * @param limit 每页数量
   * @param userId 用户ID筛选
   * @param action 操作类型筛选
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns Promise<PaginatedApiResponse<ActivityLogRecord>> 活动日志列表
   */
  async getActivityLogs(
    page: number = 1, 
    limit: number = 10, 
    userId?: string, 
    action?: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<PaginatedApiResponse<ActivityLogRecord>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    if (userId) params.append('userId', userId)
    if (action) params.append('action', action)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    return this.request<PaginatedApiResponse<ActivityLogRecord>>(`/admin/logs?${params}`)
  }

  /**
   * 获取活动日志统计
   * @param timeRange 时间范围
   * @returns Promise<ApiResponse<any>> 活动日志统计
   */
  async getActivityLogStats(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ range: timeRange })
    return this.request<ApiResponse<any>>(`/admin/logs/stats?${params}`)
  }

  /**
   * 清除活动日志
   * @param olderThanDays 清除多少天前的日志
   * @returns Promise<ApiResponse<{ success: boolean, deletedCount: number }>> 清除结果
   */
  async clearActivityLogs(olderThanDays: number = 30): Promise<ApiResponse<{ success: boolean, deletedCount: number }>> {
    return this.request<ApiResponse<{ success: boolean, deletedCount: number }>>('/admin/logs/clear', {
      method: 'POST',
      body: JSON.stringify({ olderThanDays })
    })
  }

  // ==================== 安全设置 ====================

  /**
   * 获取安全设置
   * @returns Promise<ApiResponse<any>> 安全设置
   */
  async getSecuritySettings(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/admin/security/settings')
  }

  /**
   * 更新安全设置
   * @param settings 安全设置
   * @returns Promise<ApiResponse<any>> 更新后的设置
   */
  async updateSecuritySettings(settings: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/admin/security/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  }

  /**
   * 重置安全设置为默认值
   * @returns Promise<ApiResponse<any>> 重置后的设置
   */
  async resetSecuritySettings(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/admin/security/settings/reset', {
      method: 'POST'
    })
  }

  // ==================== 威胁检测 ====================

  /**
   * 获取威胁检测报告
   * @param timeRange 时间范围
   * @returns Promise<ApiResponse<any>> 威胁检测报告
   */
  async getThreatDetectionReport(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ range: timeRange })
    return this.request<ApiResponse<any>>(`/admin/security/threat-detection?${params}`)
  }

  /**
   * 执行安全扫描
   * @param scanType 扫描类型
   * @returns Promise<ApiResponse<{ success: boolean, scanId: string }>> 扫描结果
   */
  async performSecurityScan(scanType: 'quick' | 'full' | 'custom' = 'quick'): Promise<ApiResponse<{ success: boolean, scanId: string }>> {
    return this.request<ApiResponse<{ success: boolean, scanId: string }>>('/admin/security/scan', {
      method: 'POST',
      body: JSON.stringify({ type: scanType })
    })
  }

  /**
   * 获取安全扫描结果
   * @param scanId 扫描ID
   * @returns Promise<ApiResponse<any>> 扫描结果
   */
  async getSecurityScanResult(scanId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/admin/security/scan/${scanId}/result`)
  }

  // ==================== 导出功能 ====================

  /**
   * 导出安全数据
   * @param dataType 数据类型 ('login-attempts' | 'ip-blacklist' | 'security-logs' | 'activity-logs')
   * @param format 导出格式
   * @param filters 筛选条件
   * @returns Promise<Blob> 导出文件
   */
  async exportSecurityData(
    dataType: 'login-attempts' | 'ip-blacklist' | 'security-logs' | 'activity-logs',
    format: 'csv' | 'excel' | 'json' = 'csv',
    filters?: any
  ): Promise<Blob> {
    const params = new URLSearchParams({ format })
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key].toString())
        }
      })
    }
    
    // 映射数据类型到正确的API路径
    const pathMapping = {
      'login-attempts': '/admin/security/login-attempts/export',
      'ip-blacklist': '/admin/security/ip-blacklist/export', 
      'security-logs': '/admin/security/security-logs/export',
      'activity-logs': '/admin/logs/export' // activity-logs使用不同的路径
    }
    
    const apiPath = pathMapping[dataType]
    const response = await fetch(`${this.baseURL}${apiPath}?${params}`, {
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
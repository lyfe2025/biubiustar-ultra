/**
 * 管理员服务基础类
 * 负责认证、请求处理、错误处理等核心功能
 */
export class AdminBaseService {
  protected baseURL = '/api'
  private static authErrorCallback: (() => void) | null = null
  private static isHandlingAuthError = false // 防止重复处理认证错误

  /**
   * 设置认证错误回调函数
   * @param callback 认证错误时的回调函数
   */
  static setAuthErrorCallback(callback: () => void) {
    AdminBaseService.authErrorCallback = callback
  }

  /**
   * 清除认证错误回调函数
   */
  static clearAuthErrorCallback() {
    AdminBaseService.authErrorCallback = null
  }

  /**
   * 统一的HTTP请求处理方法
   * @param endpoint API端点
   * @param options 请求选项
   * @returns Promise<T> 响应数据
   */
  protected async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
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

      const responseData = await response.json()
      
      // 检查响应格式，如果有success和data字段，则返回data字段的内容
      // 这样可以保持向后兼容性
      if (responseData && typeof responseData === 'object' && 'success' in responseData && 'data' in responseData) {
        return responseData.data
      }
      
      // 否则返回原始响应（向后兼容）
      return responseData
    } catch (error) {
      // 如果是getAuthToken抛出的认证错误，也要处理
      if (error instanceof Error && error.message.includes('未找到有效的认证token')) {
        this.handleAuthError('未找到有效的认证信息，请先登录')
      }
      throw error
    }
  }

  /**
   * 统一处理认证错误
   * @param message 错误消息
   */
  private handleAuthError(message: string): never {
    // 防止重复处理认证错误
    if (AdminBaseService.isHandlingAuthError) {
      const authError = new Error(message)
      authError.name = 'AuthenticationError'
      throw authError
    }
    
    AdminBaseService.isHandlingAuthError = true
    
    // 清除本地存储的认证token
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    localStorage.removeItem('supabase.auth.token')
    
    // 如果有注册的回调函数，调用它
    if (AdminBaseService.authErrorCallback) {
      try {
        AdminBaseService.authErrorCallback()
      } catch (error) {
        console.error('认证错误回调函数执行失败:', error)
      }
    }
    
    // 延迟重置标志，防止立即重复处理
    setTimeout(() => {
      AdminBaseService.isHandlingAuthError = false
    }, 1000)
    
    // 抛出特定的认证失败错误
    const authError = new Error(message)
    authError.name = 'AuthenticationError'
    throw authError
  }

  /**
   * 获取认证令牌
   * @returns Promise<string> 认证令牌
   */
  protected async getAuthToken(): Promise<string> {
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

  /**
   * 检查token是否存在（用于认证守卫）
   * @returns boolean 是否有有效token
   */
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

  /**
   * 清除所有认证信息
   */
  static clearAuth(): void {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    localStorage.removeItem('supabase.auth.token')
  }
}
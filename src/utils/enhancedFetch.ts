/**
 * 增强的fetch包装器，提供更好的错误处理和重试机制
 */

interface FetchOptions extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
  retryOnNetworkError?: boolean
}

interface FetchResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Headers
  ok: boolean
}

/**
 * 创建AbortController用于超时控制
 */
function createTimeoutController(timeout: number): AbortController {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeout)
  return controller
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 检查错误是否可重试
 */
function isRetryableError(error: any): boolean {
  // 网络错误通常可以重试
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }
  
  // JSON解析错误通常可以重试
  if (error instanceof SyntaxError && error.message.includes('Unexpected end of JSON input')) {
    return true
  }
  
  // 连接被拒绝可以重试
  if (error.message?.includes('Connection refused') || error.code === 'ECONNREFUSED') {
    return true
  }
  
  // 网络超时可以重试
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return true
  }
  
  // DNS解析失败可以重试
  if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
    return true
  }
  
  // 5xx服务器错误可以重试
  if (error.status && error.status >= 500) {
    return true
  }
  
  return false
}

/**
 * 增强的fetch函数
 */
export async function enhancedFetch<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> {
  const {
    timeout = 10000,
    retries = 3,
    retryDelay = 1000,
    retryOnNetworkError = true,
    ...fetchOptions
  } = options
  
  let lastError: any
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // 创建超时控制器
      const timeoutController = createTimeoutController(timeout)
      
      // 合并信号
      const signal = fetchOptions.signal 
        ? AbortSignal.any([fetchOptions.signal, timeoutController.signal])
        : timeoutController.signal
      
      // 执行fetch请求
      const response = await fetch(url, {
        ...fetchOptions,
        signal
      })
      
      // 检查HTTP状态码
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        ;(error as any).status = response.status
        ;(error as any).statusText = response.statusText
        ;(error as any).headers = response.headers
        throw error
      }
      
      // 尝试解析JSON响应
      let data: T
      try {
        const text = await response.text()
        if (text.trim()) {
          data = JSON.parse(text)
        } else {
          // 空响应，返回null或空对象
          data = {} as T
        }
      } catch (parseError) {
        // JSON解析失败
        const error = new Error(`JSON parse error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
        ;(error as any).originalError = parseError
        ;(error as any).responseText = await response.text()
        throw error
      }
      
      // 返回成功响应
      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        ok: response.ok
      }
      
    } catch (error: any) {
      lastError = error
      
      // 检查是否应该重试
      const shouldRetry = attempt < retries && 
        retryOnNetworkError && 
        isRetryableError(error)
      
      if (shouldRetry) {
        // 计算延迟时间（指数退避）
        const delayTime = retryDelay * Math.pow(2, attempt)
        console.warn(`Fetch attempt ${attempt + 1} failed, retrying in ${delayTime}ms:`, error.message)
        await delay(delayTime)
        continue
      }
      
      // 不重试或重试次数用完，抛出错误
      break
    }
  }
  
  // 所有重试都失败了，抛出最后一个错误
  throw lastError
}

/**
 * 简化的GET请求
 */
export async function get<T = any>(url: string, options?: FetchOptions): Promise<T> {
  const response = await enhancedFetch<T>(url, { ...options, method: 'GET' })
  return response.data
}

/**
 * 简化的POST请求
 */
export async function post<T = any>(url: string, data?: any, options?: FetchOptions): Promise<T> {
  const response = await enhancedFetch<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    body: data ? JSON.stringify(data) : undefined
  })
  return response.data
}

/**
 * 简化的PUT请求
 */
export async function put<T = any>(url: string, data?: any, options?: FetchOptions): Promise<T> {
  const response = await enhancedFetch<T>(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    body: data ? JSON.stringify(data) : undefined
  })
  return response.data
}

/**
 * 简化的DELETE请求
 */
export async function del<T = any>(url: string, options?: FetchOptions): Promise<T> {
  const response = await enhancedFetch<T>(url, { ...options, method: 'DELETE' })
  return response.data
}

/**
 * 批量请求
 */
export async function batchRequests<T = any>(
  requests: Array<{ url: string; options?: FetchOptions }>,
  options?: FetchOptions
): Promise<T[]> {
  const results = await Promise.allSettled(
    requests.map(req => enhancedFetch<T>(req.url, { ...options, ...req.options }))
  )
  
  return results.map(result => {
    if (result.status === 'fulfilled') {
      return result.value.data
    } else {
      throw result.reason
    }
  })
}

export default enhancedFetch

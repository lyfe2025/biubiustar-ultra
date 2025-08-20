import { Request, Response, NextFunction } from 'express'

// 请求记录接口
interface RequestRecord {
  count: number
  resetTime: number
}

// 内存存储请求记录
const requestStore = new Map<string, RequestRecord>()

// 清理过期记录的定时器
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of requestStore.entries()) {
    if (now > record.resetTime) {
      requestStore.delete(key)
    }
  }
}, 60000) // 每分钟清理一次过期记录

/**
 * 创建频率限制中间件
 * @param options 配置选项
 */
export function createRateLimiter(options: {
  windowMs: number // 时间窗口（毫秒）
  maxRequests: number // 最大请求数
  message?: string // 超限时的错误消息
  skipSuccessfulRequests?: boolean // 是否跳过成功请求的计数
  keyGenerator?: (req: Request) => string // 自定义key生成器
}) {
  const {
    windowMs,
    maxRequests,
    message = '请求过于频繁，请稍后再试',
    skipSuccessfulRequests = false,
    keyGenerator = (req: Request) => {
      // 默认使用IP地址作为key，如果有用户ID则使用用户ID
      const userId = (req as any).user?.id
      const ip = req.ip || req.connection.remoteAddress || 'unknown'
      return userId ? `user:${userId}` : `ip:${ip}`
    }
  } = options

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req)
    const now = Date.now()
    const resetTime = now + windowMs

    // 获取或创建请求记录
    let record = requestStore.get(key)
    
    if (!record || now > record.resetTime) {
      // 创建新的记录或重置过期记录
      record = {
        count: 0,
        resetTime
      }
      requestStore.set(key, record)
    }

    // 检查是否超过限制
    if (record.count >= maxRequests) {
      const remainingTime = Math.ceil((record.resetTime - now) / 1000)
      
      return res.status(429).json({
        error: message,
        retryAfter: remainingTime,
        limit: maxRequests,
        windowMs: windowMs / 1000
      })
    }

    // 增加请求计数
    record.count++

    // 设置响应头
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - record.count).toString(),
      'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
    })

    // 如果配置了跳过成功请求，则在响应完成后检查状态码
    if (skipSuccessfulRequests) {
      const originalSend = res.send
      res.send = function(body) {
        // 如果响应状态码表示成功，则减少计数
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const currentRecord = requestStore.get(key)
          if (currentRecord && currentRecord.count > 0) {
            currentRecord.count--
          }
        }
        return originalSend.call(this, body)
      }
    }

    next()
  }
}

/**
 * 统计接口专用的频率限制中间件
 * 限制：每分钟最多10次请求
 */
export const statsRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1分钟
  maxRequests: 10, // 最多10次请求
  message: '统计接口请求过于频繁，请稍后再试',
  skipSuccessfulRequests: true // 只计算失败的请求
})

/**
 * 管理员接口通用频率限制中间件
 * 限制：每分钟最多30次请求
 */
export const adminRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1分钟
  maxRequests: 30, // 最多30次请求
  message: '管理员接口请求过于频繁，请稍后再试'
})

/**
 * 严格的频率限制中间件（用于敏感操作）
 * 限制：每5分钟最多5次请求
 */
export const strictRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5分钟
  maxRequests: 5, // 最多5次请求
  message: '敏感操作请求过于频繁，请稍后再试'
})

/**
 * 获取当前频率限制状态
 */
export function getRateLimitStatus(key: string) {
  const record = requestStore.get(key)
  if (!record) {
    return null
  }
  
  const now = Date.now()
  if (now > record.resetTime) {
    return null
  }
  
  return {
    count: record.count,
    resetTime: record.resetTime,
    remaining: Math.max(0, record.resetTime - now)
  }
}

/**
 * 清除指定key的频率限制记录
 */
export function clearRateLimit(key: string) {
  return requestStore.delete(key)
}

/**
 * 获取当前存储的记录数量（用于监控）
 */
export function getStorageStats() {
  return {
    totalRecords: requestStore.size,
    records: Array.from(requestStore.entries()).map(([key, record]) => ({
      key,
      count: record.count,
      resetTime: new Date(record.resetTime).toISOString()
    }))
  }
}
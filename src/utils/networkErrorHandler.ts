import { useLanguage } from '../contexts/language'

/**
 * 网络错误类型枚举
 */
export enum NetworkErrorType {
  // 连接错误
  CONNECTION_REFUSED = 'connection_refused',
  SERVER_NOT_STARTED = 'server_not_started',
  NETWORK_UNREACHABLE = 'network_unreachable',
  
  // DNS和网络层错误
  DNS_RESOLUTION_FAILED = 'dns_resolution_failed',
  NETWORK_TIMEOUT = 'network_timeout',
  
  // HTTP错误
  HTTP_ERROR = 'http_error',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  
  // SSL/TLS错误
  SSL_HANDSHAKE_FAILED = 'ssl_handshake_failed',
  
  // 代理错误
  PROXY_CONNECTION_FAILED = 'proxy_connection_failed',
  
  // 未知错误
  UNKNOWN = 'unknown'
}

/**
 * 网络错误信息接口
 */
export interface NetworkErrorInfo {
  type: NetworkErrorType
  message: string
  userMessage: string
  suggestion: string
  retryable: boolean
  statusCode?: number
}

/**
 * 分析网络错误并返回友好的错误信息
 */
export function analyzeNetworkError(error: any): NetworkErrorInfo {
  // 检查是否是网络错误
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: NetworkErrorType.CONNECTION_REFUSED,
      message: 'Failed to fetch - Network error',
      userMessage: '网络连接失败',
      suggestion: '请检查网络连接或稍后重试',
      retryable: true
    }
  }

  // 检查是否是JSON解析错误
  if (error instanceof SyntaxError && error.message.includes('Unexpected end of JSON input')) {
    return {
      type: NetworkErrorType.SERVER_NOT_STARTED,
      message: 'Unexpected end of JSON input',
      userMessage: '服务器响应异常',
      suggestion: '服务器可能未启动或正在维护中，请稍后重试',
      retryable: true
    }
  }

  // 检查是否是连接被拒绝
  if (error.message?.includes('Connection refused') || error.code === 'ECONNREFUSED') {
    return {
      type: NetworkErrorType.CONNECTION_REFUSED,
      message: 'Connection refused',
      userMessage: '连接被拒绝',
      suggestion: '服务器可能未启动，请检查服务状态',
      retryable: true
    }
  }

  // 检查是否是网络超时
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return {
      type: NetworkErrorType.NETWORK_TIMEOUT,
      message: 'Request timeout',
      userMessage: '请求超时',
      suggestion: '网络连接较慢，请稍后重试',
      retryable: true
    }
  }

  // 检查是否是DNS解析失败
  if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
    return {
      type: NetworkErrorType.DNS_RESOLUTION_FAILED,
      message: 'DNS resolution failed',
      userMessage: '域名解析失败',
      suggestion: '请检查网络设置或稍后重试',
      retryable: true
    }
  }

  // 检查是否是SSL握手失败
  if (error.message?.includes('SSL') || error.message?.includes('TLS')) {
    return {
      type: NetworkErrorType.SSL_HANDSHAKE_FAILED,
      message: 'SSL handshake failed',
      userMessage: '安全连接失败',
      suggestion: '请检查网络环境或联系管理员',
      retryable: true
    }
  }

  // 检查HTTP状态码
  if (error.status) {
    switch (error.status) {
      case 503:
        return {
          type: NetworkErrorType.SERVICE_UNAVAILABLE,
          message: 'Service Unavailable',
          userMessage: '服务暂时不可用',
          suggestion: '服务器正在维护中，请稍后重试',
          retryable: true,
          statusCode: 503
        }
      case 502:
        return {
          type: NetworkErrorType.SERVER_NOT_STARTED,
          message: 'Bad Gateway',
          userMessage: '网关错误',
          suggestion: '上游服务器可能未启动，请稍后重试',
          retryable: true,
          statusCode: 502
        }
      case 504:
        return {
          type: NetworkErrorType.NETWORK_TIMEOUT,
          message: 'Gateway Timeout',
          userMessage: '网关超时',
          suggestion: '请求处理超时，请稍后重试',
          retryable: true,
          statusCode: 504
        }
    }
  }

  // 默认返回未知错误
  return {
    type: NetworkErrorType.UNKNOWN,
    message: error.message || 'Unknown network error',
    userMessage: '未知网络错误',
    suggestion: '请检查网络连接或联系技术支持',
    retryable: false
  }
}

/**
 * 获取多语言的错误提示信息
 */
export function getLocalizedNetworkError(error: any, language: string): NetworkErrorInfo {
  const errorInfo = analyzeNetworkError(error)
  
  // 根据语言返回本地化的用户消息和建议
  switch (language) {
    case 'zh':
      return {
        ...errorInfo,
        userMessage: getChineseErrorMessage(errorInfo.type),
        suggestion: getChineseSuggestion(errorInfo.type)
      }
    case 'zh-TW':
      return {
        ...errorInfo,
        userMessage: getTraditionalChineseErrorMessage(errorInfo.type),
        suggestion: getTraditionalChineseSuggestion(errorInfo.type)
      }
    case 'vi':
      return {
        ...errorInfo,
        userMessage: getVietnameseErrorMessage(errorInfo.type),
        suggestion: getVietnameseSuggestion(errorInfo.type)
      }
    default:
      return {
        ...errorInfo,
        userMessage: getEnglishErrorMessage(errorInfo.type),
        suggestion: getEnglishSuggestion(errorInfo.type)
      }
  }
}

// 中文错误消息
function getChineseErrorMessage(type: NetworkErrorType): string {
  switch (type) {
    case NetworkErrorType.CONNECTION_REFUSED:
      return '连接被拒绝'
    case NetworkErrorType.SERVER_NOT_STARTED:
      return '服务器未启动'
    case NetworkErrorType.NETWORK_UNREACHABLE:
      return '网络不可达'
    case NetworkErrorType.DNS_RESOLUTION_FAILED:
      return '域名解析失败'
    case NetworkErrorType.NETWORK_TIMEOUT:
      return '网络超时'
    case NetworkErrorType.SERVICE_UNAVAILABLE:
      return '服务暂时不可用'
    case NetworkErrorType.SSL_HANDSHAKE_FAILED:
      return '安全连接失败'
    case NetworkErrorType.PROXY_CONNECTION_FAILED:
      return '代理连接失败'
    default:
      return '网络连接错误'
  }
}

// 中文建议
function getChineseSuggestion(type: NetworkErrorType): string {
  switch (type) {
    case NetworkErrorType.CONNECTION_REFUSED:
    case NetworkErrorType.SERVER_NOT_STARTED:
      return '服务器可能未启动，请检查服务状态或联系管理员'
    case NetworkErrorType.NETWORK_UNREACHABLE:
      return '请检查网络连接或稍后重试'
    case NetworkErrorType.DNS_RESOLUTION_FAILED:
      return '请检查网络设置或稍后重试'
    case NetworkErrorType.NETWORK_TIMEOUT:
      return '网络连接较慢，请稍后重试'
    case NetworkErrorType.SERVICE_UNAVAILABLE:
      return '服务器正在维护中，请稍后重试'
    case NetworkErrorType.SSL_HANDSHAKE_FAILED:
      return '请检查网络环境或联系技术支持'
    case NetworkErrorType.PROXY_CONNECTION_FAILED:
      return '请检查代理设置或联系网络管理员'
    default:
      return '请检查网络连接或联系技术支持'
  }
}

// 繁体中文错误消息
function getTraditionalChineseErrorMessage(type: NetworkErrorType): string {
  switch (type) {
    case NetworkErrorType.CONNECTION_REFUSED:
      return '連線被拒絕'
    case NetworkErrorType.SERVER_NOT_STARTED:
      return '伺服器未啟動'
    case NetworkErrorType.NETWORK_UNREACHABLE:
      return '網路不可達'
    case NetworkErrorType.DNS_RESOLUTION_FAILED:
      return '網域名稱解析失敗'
    case NetworkErrorType.NETWORK_TIMEOUT:
      return '網路超時'
    case NetworkErrorType.SERVICE_UNAVAILABLE:
      return '服務暫時不可用'
    case NetworkErrorType.SSL_HANDSHAKE_FAILED:
      return '安全連線失敗'
    case NetworkErrorType.PROXY_CONNECTION_FAILED:
      return '代理連線失敗'
    default:
      return '網路連線錯誤'
  }
}

// 繁体中文建议
function getTraditionalChineseSuggestion(type: NetworkErrorType): string {
  switch (type) {
    case NetworkErrorType.CONNECTION_REFUSED:
    case NetworkErrorType.SERVER_NOT_STARTED:
      return '伺服器可能未啟動，請檢查服務狀態或聯絡管理員'
    case NetworkErrorType.NETWORK_UNREACHABLE:
      return '請檢查網路連線或稍後重試'
    case NetworkErrorType.DNS_RESOLUTION_FAILED:
      return '請檢查網路設定或稍後重試'
    case NetworkErrorType.NETWORK_TIMEOUT:
      return '網路連線較慢，請稍後重試'
    case NetworkErrorType.SERVICE_UNAVAILABLE:
      return '伺服器正在維護中，請稍後重試'
    case NetworkErrorType.SSL_HANDSHAKE_FAILED:
      return '請檢查網路環境或聯絡技術支援'
    case NetworkErrorType.PROXY_CONNECTION_FAILED:
      return '請檢查代理設定或聯絡網路管理員'
    default:
      return '請檢查網路連線或聯絡技術支援'
  }
}

// 越南语错误消息
function getVietnameseErrorMessage(type: NetworkErrorType): string {
  switch (type) {
    case NetworkErrorType.CONNECTION_REFUSED:
      return 'Kết nối bị từ chối'
    case NetworkErrorType.SERVER_NOT_STARTED:
      return 'Máy chủ chưa khởi động'
    case NetworkErrorType.NETWORK_UNREACHABLE:
      return 'Mạng không thể truy cập'
    case NetworkErrorType.DNS_RESOLUTION_FAILED:
      return 'Phân giải DNS thất bại'
    case NetworkErrorType.NETWORK_TIMEOUT:
      return 'Kết nối mạng quá thời gian'
    case NetworkErrorType.SERVICE_UNAVAILABLE:
      return 'Dịch vụ tạm thời không khả dụng'
    case NetworkErrorType.SSL_HANDSHAKE_FAILED:
      return 'Kết nối bảo mật thất bại'
    case NetworkErrorType.PROXY_CONNECTION_FAILED:
      return 'Kết nối proxy thất bại'
    default:
      return 'Lỗi kết nối mạng'
  }
}

// 越南语建议
function getVietnameseSuggestion(type: NetworkErrorType): string {
  switch (type) {
    case NetworkErrorType.CONNECTION_REFUSED:
    case NetworkErrorType.SERVER_NOT_STARTED:
      return 'Máy chủ có thể chưa khởi động, vui lòng kiểm tra trạng thái dịch vụ hoặc liên hệ quản trị viên'
    case NetworkErrorType.NETWORK_UNREACHABLE:
      return 'Vui lòng kiểm tra kết nối mạng hoặc thử lại sau'
    case NetworkErrorType.DNS_RESOLUTION_FAILED:
      return 'Vui lòng kiểm tra cài đặt mạng hoặc thử lại sau'
    case NetworkErrorType.NETWORK_TIMEOUT:
      return 'Kết nối mạng chậm, vui lòng thử lại sau'
    case NetworkErrorType.SERVICE_UNAVAILABLE:
      return 'Máy chủ đang bảo trì, vui lòng thử lại sau'
    case NetworkErrorType.SSL_HANDSHAKE_FAILED:
      return 'Vui lòng kiểm tra môi trường mạng hoặc liên hệ hỗ trợ kỹ thuật'
    case NetworkErrorType.PROXY_CONNECTION_FAILED:
      return 'Vui lòng kiểm tra cài đặt proxy hoặc liên hệ quản trị viên mạng'
    default:
      return 'Vui lòng kiểm tra kết nối mạng hoặc liên hệ hỗ trợ kỹ thuật'
  }
}

// 英语错误消息
function getEnglishErrorMessage(type: NetworkErrorType): string {
  switch (type) {
    case NetworkErrorType.CONNECTION_REFUSED:
      return 'Connection refused'
    case NetworkErrorType.SERVER_NOT_STARTED:
      return 'Server not started'
    case NetworkErrorType.NETWORK_UNREACHABLE:
      return 'Network unreachable'
    case NetworkErrorType.DNS_RESOLUTION_FAILED:
      return 'DNS resolution failed'
    case NetworkErrorType.NETWORK_TIMEOUT:
      return 'Network timeout'
    case NetworkErrorType.SERVICE_UNAVAILABLE:
      return 'Service temporarily unavailable'
    case NetworkErrorType.SSL_HANDSHAKE_FAILED:
      return 'Secure connection failed'
    case NetworkErrorType.PROXY_CONNECTION_FAILED:
      return 'Proxy connection failed'
    default:
      return 'Network connection error'
  }
}

// 英语建议
function getEnglishSuggestion(type: NetworkErrorType): string {
  switch (type) {
    case NetworkErrorType.CONNECTION_REFUSED:
    case NetworkErrorType.SERVER_NOT_STARTED:
      return 'Server may not be started, please check service status or contact administrator'
    case NetworkErrorType.NETWORK_UNREACHABLE:
      return 'Please check network connection or try again later'
    case NetworkErrorType.DNS_RESOLUTION_FAILED:
      return 'Please check network settings or try again later'
    case NetworkErrorType.NETWORK_TIMEOUT:
      return 'Network connection is slow, please try again later'
    case NetworkErrorType.SERVICE_UNAVAILABLE:
      return 'Server is under maintenance, please try again later'
    case NetworkErrorType.SSL_HANDSHAKE_FAILED:
      return 'Please check network environment or contact technical support'
    case NetworkErrorType.PROXY_CONNECTION_FAILED:
      return 'Please check proxy settings or contact network administrator'
    default:
      return 'Please check network connection or contact technical support'
  }
}

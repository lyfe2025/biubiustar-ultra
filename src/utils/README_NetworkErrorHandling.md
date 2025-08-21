# 网络错误处理工具使用指南

## 概述

这个网络错误处理工具包提供了友好的多语言错误提示和自动重试机制，特别适用于处理 "Failed to execute 'json' on 'Response': Unexpected end of JSON input" 和 "Failed to fetch" 等常见网络错误。

## 主要特性

- 🚀 **智能错误识别**: 自动识别不同类型的网络错误
- 🌍 **多语言支持**: 支持中文、繁体中文、越南语和英语
- 🔄 **自动重试**: 智能重试机制，支持指数退避
- 🎯 **友好提示**: 用户友好的错误信息和解决建议
- ⚡ **性能优化**: 超时控制和请求取消
- 🛠️ **易于集成**: 提供Hook和组件，快速集成到现有项目

## 文件结构

```
src/
├── utils/
│   ├── networkErrorHandler.ts      # 网络错误分析工具
│   ├── enhancedFetch.ts            # 增强的fetch包装器
│   └── README_NetworkErrorHandling.md
├── hooks/
│   └── useNetworkError.ts          # 网络错误处理Hook
└── components/
    ├── NetworkErrorModal.tsx       # 错误提示模态框
    └── NetworkErrorExample.tsx     # 使用示例
```

## 快速开始

### 1. 基本使用

```tsx
import { useNetworkError } from '../hooks/useNetworkError'
import NetworkErrorModal from '../components/NetworkErrorModal'

function MyComponent() {
  const { error, isErrorModalOpen, showError, hideError, retry } = useNetworkError({
    onRetry: fetchData // 重试时调用的函数
  })

  async function fetchData() {
    try {
      const response = await fetch('/api/data')
      const data = await response.json()
      // 处理数据...
    } catch (error) {
      showError(error) // 显示友好的错误提示
    }
  }

  return (
    <div>
      <button onClick={fetchData}>获取数据</button>
      
      <NetworkErrorModal
        error={error}
        isOpen={isErrorModalOpen}
        onClose={hideError}
        onRetry={retry}
      />
    </div>
  )
}
```

### 2. 使用增强的fetch

```tsx
import { enhancedFetch } from '../utils/enhancedFetch'

async function fetchData() {
  try {
    const result = await enhancedFetch('/api/data', {
      timeout: 10000,        // 10秒超时
      retries: 3,            // 重试3次
      retryDelay: 1000,      // 重试延迟1秒
      retryOnNetworkError: true
    })
    
    console.log('数据:', result.data)
  } catch (error) {
    console.error('请求失败:', error)
  }
}
```

### 3. 批量请求

```tsx
import { batchRequests } from '../utils/enhancedFetch'

async function fetchMultipleData() {
  const requests = [
    { url: '/api/users' },
    { url: '/api/posts' },
    { url: '/api/comments' }
  ]
  
  try {
    const results = await batchRequests(requests, {
      timeout: 15000,
      retries: 2
    })
    
    console.log('用户:', results[0])
    console.log('帖子:', results[1])
    console.log('评论:', results[2])
  } catch (error) {
    console.error('批量请求失败:', error)
  }
}
```

## 错误类型

### 自动识别的错误类型

| 错误类型 | 描述 | 可重试 |
|---------|------|--------|
| `connection_refused` | 连接被拒绝 | ✅ |
| `server_not_started` | 服务器未启动 | ✅ |
| `network_unreachable` | 网络不可达 | ✅ |
| `dns_resolution_failed` | DNS解析失败 | ✅ |
| `network_timeout` | 网络超时 | ✅ |
| `service_unavailable` | 服务不可用 | ✅ |
| `ssl_handshake_failed` | SSL握手失败 | ✅ |
| `proxy_connection_failed` | 代理连接失败 | ✅ |

### 错误信息示例

**中文**:
- 错误: "服务器未启动"
- 建议: "服务器可能未启动，请检查服务状态或联系管理员"

**English**:
- Error: "Server not started"
- Suggestion: "Server may not be started, please check service status or contact administrator"

**Tiếng Việt**:
- Lỗi: "Máy chủ chưa khởi động"
- Gợi ý: "Máy chủ có thể chưa khởi động, vui lòng kiểm tra trạng thái dịch vụ hoặc liên hệ quản trị viên"

## 配置选项

### useNetworkError Hook 选项

```tsx
const { showError, hideError } = useNetworkError({
  onRetry: fetchData,        // 重试函数
  autoHide: false,           // 是否自动隐藏错误
  autoHideDelay: 5000        // 自动隐藏延迟（毫秒）
})
```

### enhancedFetch 选项

```tsx
const result = await enhancedFetch(url, {
  timeout: 10000,            // 超时时间（毫秒）
  retries: 3,                // 重试次数
  retryDelay: 1000,          // 重试延迟（毫秒）
  retryOnNetworkError: true, // 是否在网络错误时重试
  method: 'GET',             // HTTP方法
  headers: {},               // 请求头
  body: null                 // 请求体
})
```

## 集成到现有项目

### 1. 替换现有的fetch调用

**之前**:
```tsx
try {
  const response = await fetch('/api/data')
  const data = await response.json()
} catch (error) {
  console.error('请求失败:', error)
  // 显示简单的错误提示
}
```

**之后**:
```tsx
import { enhancedFetch } from '../utils/enhancedFetch'
import { useNetworkError } from '../hooks/useNetworkError'

function MyComponent() {
  const { showError } = useNetworkError()
  
  async function fetchData() {
    try {
      const result = await enhancedFetch('/api/data')
      // 处理数据...
    } catch (error) {
      showError(error) // 显示友好的多语言错误提示
    }
  }
}
```

### 2. 在现有服务中使用

```tsx
// 之前: src/services/userService.ts
export class UserService {
  async getUsers() {
    const response = await fetch('/api/users')
    return response.json()
  }
}

// 之后: 使用增强的fetch
import { enhancedFetch } from '../utils/enhancedFetch'

export class UserService {
  async getUsers() {
    try {
      const result = await enhancedFetch('/api/users')
      return result.data
    } catch (error) {
      // 错误会被上层组件处理
      throw error
    }
  }
}
```

## 自定义错误处理

### 1. 添加新的错误类型

```tsx
// 在 networkErrorHandler.ts 中添加
export enum NetworkErrorType {
  // ... 现有类型
  CUSTOM_ERROR = 'custom_error'
}

// 在 analyzeNetworkError 函数中添加识别逻辑
if (error.message?.includes('custom error pattern')) {
  return {
    type: NetworkErrorType.CUSTOM_ERROR,
    message: 'Custom error message',
    userMessage: '自定义错误',
    suggestion: '自定义解决建议',
    retryable: true
  }
}
```

### 2. 自定义错误提示样式

```tsx
// 在 NetworkErrorModal.tsx 中自定义样式
const getErrorColor = () => {
  switch (errorInfo.type) {
    case 'custom_error':
      return 'border-purple-200 bg-purple-50'
    // ... 其他类型
  }
}
```

## 最佳实践

### 1. 错误处理策略

- **网络错误**: 自动重试，显示友好提示
- **服务器错误**: 显示维护信息，提供重试选项
- **用户错误**: 显示验证信息，指导用户操作
- **系统错误**: 记录日志，联系技术支持

### 2. 重试策略

- 使用指数退避算法
- 设置合理的重试次数和延迟
- 区分可重试和不可重试的错误

### 3. 用户体验

- 提供清晰的错误描述
- 给出具体的解决建议
- 支持多语言显示
- 提供重试和联系支持的选项

## 故障排除

### 常见问题

**Q: 错误提示不显示？**
A: 检查是否正确导入和使用了 `useNetworkError` Hook

**Q: 重试功能不工作？**
A: 确保在 `useNetworkError` 中正确设置了 `onRetry` 回调

**Q: 多语言不生效？**
A: 检查是否正确配置了语言上下文和翻译文件

**Q: 自定义错误类型不识别？**
A: 在 `analyzeNetworkError` 函数中添加相应的识别逻辑

### 调试技巧

```tsx
// 启用详细日志
const { showError } = useNetworkError({
  onRetry: async () => {
    console.log('重试中...')
    await fetchData()
  }
})

// 查看错误详情
console.log('错误信息:', error)
console.log('错误类型:', errorInfo?.type)
console.log('用户消息:', errorInfo?.userMessage)
```

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基本的网络错误处理
- 多语言支持（中文、繁体中文、越南语、英语）
- 自动重试机制
- 友好的错误提示界面

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个工具包！

## 许可证

MIT License

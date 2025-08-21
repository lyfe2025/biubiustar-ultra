import React, { useState } from 'react'
import { useLanguage } from '../contexts/language'
import { useNetworkError } from '../hooks/useNetworkError'
import NetworkErrorModal from './NetworkErrorModal'
import { enhancedFetch } from '../utils/enhancedFetch'

/**
 * 网络错误处理使用示例组件
 * 展示如何在实际组件中使用网络错误处理工具
 */
export const NetworkErrorExample: React.FC = () => {
  const { language } = useLanguage()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // 使用网络错误处理Hook
  const {
    error,
    isErrorModalOpen,
    showError,
    hideError,
    retry,
    isRetrying
  } = useNetworkError({
    onRetry: fetchData, // 重试时调用fetchData函数
    autoHide: false
  })
  
  // 模拟数据获取函数
  async function fetchData() {
    setIsLoading(true)
    try {
      // 使用增强的fetch函数
      const result = await enhancedFetch('/api/test-endpoint', {
        timeout: 5000,
        retries: 2,
        retryDelay: 1000
      })
      
      setData(result.data)
      console.log('数据获取成功:', result.data)
      
    } catch (error: any) {
      console.error('数据获取失败:', error)
      
      // 显示友好的错误提示
      showError(error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // 模拟不同类型的错误
  const simulateErrors = {
    // 模拟服务器未启动错误
    serverNotStarted: () => {
      const error = new SyntaxError('Unexpected end of JSON input')
      showError(error)
    },
    
    // 模拟网络连接失败
    networkError: () => {
      const error = new TypeError('Failed to fetch')
      showError(error)
    },
    
    // 模拟连接被拒绝
    connectionRefused: () => {
      const error = new Error('Connection refused')
      ;(error as any).code = 'ECONNREFUSED'
      showError(error)
    },
    
    // 模拟超时错误
    timeout: () => {
      const error = new Error('Request timeout')
      error.name = 'AbortError'
      showError(error)
    },
    
    // 模拟DNS解析失败
    dnsError: () => {
      const error = new Error('getaddrinfo ENOTFOUND example.com')
      showError(error)
    }
  }
  
  const getButtonText = (key: string) => {
    switch (language) {
      case 'zh':
        return {
          fetchData: '获取数据',
          serverError: '模拟服务器错误',
          networkError: '模拟网络错误',
          connectionError: '模拟连接错误',
          timeoutError: '模拟超时错误',
          dnsError: '模拟DNS错误'
        }[key] || key
      case 'zh-TW':
        return {
          fetchData: '取得資料',
          serverError: '模擬伺服器錯誤',
          networkError: '模擬網路錯誤',
          connectionError: '模擬連線錯誤',
          timeoutError: '模擬逾時錯誤',
          dnsError: '模擬DNS錯誤'
        }[key] || key
      case 'vi':
        return {
          fetchData: 'Lấy dữ liệu',
          serverError: 'Mô phỏng lỗi máy chủ',
          networkError: 'Mô phỏng lỗi mạng',
          connectionError: 'Mô phỏng lỗi kết nối',
          timeoutError: 'Mô phỏng lỗi thời gian chờ',
          dnsError: 'Mô phỏng lỗi DNS'
        }[key] || key
      default:
        return {
          fetchData: 'Fetch Data',
          serverError: 'Simulate Server Error',
          networkError: 'Simulate Network Error',
          connectionError: 'Simulate Connection Error',
          timeoutError: 'Simulate Timeout Error',
          dnsError: 'Simulate DNS Error'
        }[key] || key
    }
  }
  
  const getTitleText = () => {
    switch (language) {
      case 'zh':
        return '网络错误处理示例'
      case 'zh-TW':
        return '網路錯誤處理範例'
      case 'vi':
        return 'Ví dụ xử lý lỗi mạng'
      default:
        return 'Network Error Handling Example'
    }
  }
  
  const getDescriptionText = () => {
    switch (language) {
      case 'zh':
        return '点击下面的按钮来测试不同类型的网络错误处理。每个错误都会显示友好的多语言提示信息。'
      case 'zh-TW':
        return '點擊下面的按鈕來測試不同類型的網路錯誤處理。每個錯誤都會顯示友好的多語言提示資訊。'
      case 'vi':
        return 'Nhấp vào các nút bên dưới để kiểm tra xử lý các loại lỗi mạng khác nhau. Mỗi lỗi sẽ hiển thị thông báo gợi ý đa ngôn ngữ thân thiện.'
      default:
        return 'Click the buttons below to test different types of network error handling. Each error will display friendly multilingual prompt messages.'
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {getTitleText()}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {getDescriptionText()}
        </p>
        
        {/* 数据获取区域 */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">
            {language === 'zh' ? '数据获取测试' : 
             language === 'zh-TW' ? '資料取得測試' :
             language === 'vi' ? 'Kiểm tra lấy dữ liệu' :
             'Data Fetching Test'}
          </h2>
          
          <button
            onClick={fetchData}
            disabled={isLoading || isRetrying}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '获取中...' : isRetrying ? '重试中...' : getButtonText('fetchData')}
          </button>
          
          {data && (
            <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
              <p className="text-green-800 text-sm">
                {language === 'zh' ? '数据获取成功！' :
                 language === 'zh-TW' ? '資料取得成功！' :
                 language === 'vi' ? 'Lấy dữ liệu thành công!' :
                 'Data fetched successfully!'}
              </p>
              <pre className="text-xs text-green-700 mt-2">{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </div>
        
        {/* 错误模拟区域 */}
        <div className="mb-8 p-4 bg-red-50 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-3">
            {language === 'zh' ? '错误模拟测试' :
             language === 'zh-TW' ? '錯誤模擬測試' :
             language === 'vi' ? 'Kiểm tra mô phỏng lỗi' :
             'Error Simulation Test'}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={simulateErrors.serverNotStarted}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              {getButtonText('serverError')}
            </button>
            
            <button
              onClick={simulateErrors.networkError}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              {getButtonText('networkError')}
            </button>
            
            <button
              onClick={simulateErrors.connectionRefused}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              {getButtonText('connectionError')}
            </button>
            
            <button
              onClick={simulateErrors.timeout}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              {getButtonText('timeoutError')}
            </button>
            
            <button
              onClick={simulateErrors.dnsError}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              {getButtonText('dnsError')}
            </button>
          </div>
        </div>
        
        {/* 当前语言显示 */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>
              {language === 'zh' ? '当前语言' :
               language === 'zh-TW' ? '目前語言' :
               language === 'vi' ? 'Ngôn ngữ hiện tại' :
               'Current Language'}
            </strong>
            : {language}
          </p>
        </div>
      </div>
      
      {/* 网络错误模态框 */}
      <NetworkErrorModal
        error={error}
        isOpen={isErrorModalOpen}
        onClose={hideError}
        onRetry={retry}
      />
    </div>
  )
}

export default NetworkErrorExample

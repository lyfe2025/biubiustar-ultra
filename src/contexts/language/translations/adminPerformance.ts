// 性能监控翻译
export const adminPerformanceTranslations = {
  zh: {
    admin: {
      performance: {
        title: '性能监控',
        description: '监控系统性能指标和请求统计',
        refresh: '刷新',
        autoRefresh: '自动刷新',
        export: '导出数据',
        clear: '清除数据',
        clearConfirm: '确定要清除所有性能数据吗？此操作无法撤销。',
        
        // 统计卡片
        stats: {
          totalRequests: '总请求数',
          averageResponseTime: '平均响应时间',
          errorRate: '错误率',
          slowRequestRate: '慢请求率',
          ms: '毫秒',
          percent: '%'
        },
        
        // 慢请求
        slowRequests: {
          title: '慢请求列表',
          noData: '暂无慢请求记录',
          url: '请求URL',
          duration: '耗时',
          timestamp: '时间',
          method: 'HTTP方法'
        },
        
        // 错误请求
        errorRequests: {
          title: '错误请求列表',
          noData: '暂无错误请求记录',
          url: '请求URL',
          error: '错误信息',
          timestamp: '时间',
          method: 'HTTP方法',
          status: '状态码'
        },
        
        // 操作消息
        messages: {
          dataCleared: '性能数据已清除',
          dataExported: '性能数据已导出',
          exportFailed: '数据导出失败',
          refreshed: '数据已刷新'
        }
      }
    }
  },
  
  'zh-TW': {
    admin: {
      performance: {
        title: '效能監控',
        description: '監控系統效能指標和請求統計',
        refresh: '重新整理',
        autoRefresh: '自動重新整理',
        export: '匯出資料',
        clear: '清除資料',
        clearConfirm: '確定要清除所有效能資料嗎？此操作無法復原。',
        
        stats: {
          totalRequests: '總請求數',
          averageResponseTime: '平均回應時間',
          errorRate: '錯誤率',
          slowRequestRate: '慢請求率',
          ms: '毫秒',
          percent: '%'
        },
        
        slowRequests: {
          title: '慢請求清單',
          noData: '暫無慢請求記錄',
          url: '請求URL',
          duration: '耗時',
          timestamp: '時間',
          method: 'HTTP方法'
        },
        
        errorRequests: {
          title: '錯誤請求清單',
          noData: '暫無錯誤請求記錄',
          url: '請求URL',
          error: '錯誤訊息',
          timestamp: '時間',
          method: 'HTTP方法',
          status: '狀態碼'
        },
        
        messages: {
          dataCleared: '效能資料已清除',
          dataExported: '效能資料已匯出',
          exportFailed: '資料匯出失敗',
          refreshed: '資料已重新整理'
        }
      }
    }
  },
  
  en: {
    admin: {
      performance: {
        title: 'Performance Monitor',
        description: 'Monitor system performance metrics and request statistics',
        refresh: 'Refresh',
        autoRefresh: 'Auto Refresh',
        export: 'Export Data',
        clear: 'Clear Data',
        clearConfirm: 'Are you sure you want to clear all performance data? This action cannot be undone.',
        
        stats: {
          totalRequests: 'Total Requests',
          averageResponseTime: 'Average Response Time',
          errorRate: 'Error Rate',
          slowRequestRate: 'Slow Request Rate',
          ms: 'ms',
          percent: '%'
        },
        
        slowRequests: {
          title: 'Slow Requests',
          noData: 'No slow requests recorded',
          url: 'Request URL',
          duration: 'Duration',
          timestamp: 'Time',
          method: 'HTTP Method'
        },
        
        errorRequests: {
          title: 'Error Requests',
          noData: 'No error requests recorded',
          url: 'Request URL',
          error: 'Error Message',
          timestamp: 'Time',
          method: 'HTTP Method',
          status: 'Status Code'
        },
        
        messages: {
          dataCleared: 'Performance data cleared',
          dataExported: 'Performance data exported',
          exportFailed: 'Data export failed',
          refreshed: 'Data refreshed'
        }
      }
    }
  },
  
  vi: {
    admin: {
      performance: {
        title: 'Giám sát hiệu suất',
        description: 'Giám sát các chỉ số hiệu suất hệ thống và thống kê yêu cầu',
        refresh: 'Làm mới',
        autoRefresh: 'Tự động làm mới',
        export: 'Xuất dữ liệu',
        clear: 'Xóa dữ liệu',
        clearConfirm: 'Bạn có chắc chắn muốn xóa tất cả dữ liệu hiệu suất? Hành động này không thể hoàn tác.',
        
        stats: {
          totalRequests: 'Tổng số yêu cầu',
          averageResponseTime: 'Thời gian phản hồi trung bình',
          errorRate: 'Tỷ lệ lỗi',
          slowRequestRate: 'Tỷ lệ yêu cầu chậm',
          ms: 'ms',
          percent: '%'
        },
        
        slowRequests: {
          title: 'Danh sách yêu cầu chậm',
          noData: 'Không có yêu cầu chậm nào được ghi lại',
          url: 'URL yêu cầu',
          duration: 'Thời gian',
          timestamp: 'Thời điểm',
          method: 'Phương thức HTTP'
        },
        
        errorRequests: {
          title: 'Danh sách yêu cầu lỗi',
          noData: 'Không có yêu cầu lỗi nào được ghi lại',
          url: 'URL yêu cầu',
          error: 'Thông báo lỗi',
          timestamp: 'Thời điểm',
          method: 'Phương thức HTTP',
          status: 'Mã trạng thái'
        },
        
        messages: {
          dataCleared: 'Dữ liệu hiệu suất đã được xóa',
          dataExported: 'Dữ liệu hiệu suất đã được xuất',
          exportFailed: 'Xuất dữ liệu thất bại',
          refreshed: 'Dữ liệu đã được làm mới'
        }
      }
    }
  }
}
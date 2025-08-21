// 性能监控翻译
export const adminPerformanceTranslations = {
  zh: {
    admin: {
      performance: {
        title: '性能监控',
        description: '监控系统性能指标和请求统计',
        monitoring: '性能监控',
        refresh: '刷新',
        autoRefresh: '自动刷新',
        export: '导出数据',
        clear: '清除数据',
        clearConfirmTitle: '清除性能数据',
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
      },
      
      // 缓存性能监控
      cache: {
        title: '缓存性能监控',
        description: '监控缓存系统性能和健康状态',
        monitoring: '缓存监控',
        refresh: '刷新',
        autoRefresh: '自动刷新',
        clear: '清除缓存',
        clearAll: '清除所有缓存',
        clearConfirmTitle: '清除缓存',
        clearConfirm: '确定要清除选中的缓存吗？此操作无法撤销。',
        clearAllConfirm: '确定要清除所有缓存吗？此操作无法撤销。',
        performanceTest: '性能测试',
        runTest: '运行测试',
        testRunning: '测试运行中...',
        
        // 缓存健康状态
        health: {
          title: '缓存健康状态',
          type: '缓存类型',
          size: '大小',
          hitRate: '命中率',
          memoryUsage: '内存使用',
          utilization: '利用率',
          status: '状态',
          healthy: '健康',
          warning: '警告',
          critical: '严重'
        },
        
        // 性能指标
        metrics: {
          title: '性能指标概览',
          totalCaches: '总缓存数',
          totalHits: '总命中数',
          totalMisses: '总未命中数',
          overallHitRate: '总体命中率',
          averageResponseTime: '平均响应时间'
        },
        
        // 系统内存
        memory: {
          title: '系统内存使用',
          rss: 'RSS内存',
          rssDesc: '常驻内存',
          heapUsed: '已用堆内存',
          heapUsedDesc: '已用堆内存',
          heapTotal: '总堆内存',
          heapTotalDesc: '总堆内存',
          external: '外部内存',
          externalDesc: '外部内存',
          heapUtilization: '堆内存利用率'
        },
        
        // 性能测试
        test: {
          title: '缓存性能测试',
          testSize: '测试大小',
          writeTime: '写入时间',
          readTime: '读取时间',
          operations: '操作数',
          opsPerSecond: '每秒操作数',
          results: '测试结果'
        },
        
        // 缓存配置
        config: {
          title: '缓存配置管理',
          manageConfig: '管理配置',
          hideConfig: '隐藏配置',
          editConfig: '编辑配置',
          save: '保存',
          saving: '保存中...',
          cacheTypeSuffix: '缓存',
          maxSize: '最大条目数',
          maxSizePlaceholder: '输入最大条目数',
          defaultTTL: '默认过期时间',
          ttlPlaceholder: '输入过期时间（秒）',
          cleanupInterval: '清理间隔',
          cleanupPlaceholder: '输入清理间隔（秒）',
          seconds: '秒',
          current: '当前',
          currentUsage: '当前使用',
          capacityUtilization: '容量使用率',
          noConfigData: '暂无缓存配置数据',
          clickRefresh: '点击刷新'
        },
        
        // 操作消息
        messages: {
          cacheCleared: '缓存已清除',
          allCachesCleared: '所有缓存已清除',
          testCompleted: '性能测试完成',
          testFailed: '性能测试失败',
          refreshed: '数据已刷新',
          clearCacheFailed: '清除缓存失败',
          configFetchFailed: '获取缓存配置失败',
          configUpdated: '缓存配置已更新',
          configUpdateFailed: '更新缓存配置失败'
        },
        
        // 清除缓存对话框
        dialog: {
          clearAllTitle: '清除所有缓存',
          clearCacheTitle: '清除 {{cacheType}} 缓存',
          clearAllConfirm: '确定要清除所有缓存吗？此操作将清空所有缓存数据。',
          clearCacheConfirm: '确定要清除 {{cacheType}} 缓存吗？此操作将清空该缓存的所有数据。'
        }
      }
    }
  },
  
  'zh-TW': {
    admin: {
      performance: {
        title: '效能監控',
        description: '監控系統效能指標和請求統計',
        monitoring: '效能監控',
        refresh: '重新整理',
        autoRefresh: '自動重新整理',
        export: '匯出資料',
        clear: '清除資料',
        clearConfirmTitle: '清除效能資料',
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
      },
      
      // 快取效能監控
      cache: {
        title: '快取效能監控',
        description: '監控快取系統效能和健康狀態',
        monitoring: '快取監控',
        refresh: '重新整理',
        autoRefresh: '自動重新整理',
        clear: '清除快取',
        clearAll: '清除所有快取',
        clearConfirmTitle: '清除快取',
        clearConfirm: '確定要清除選中的快取嗎？此操作無法復原。',
        clearAllConfirm: '確定要清除所有快取嗎？此操作無法復原。',
        performanceTest: '效能測試',
        runTest: '執行測試',
        testRunning: '測試執行中...',
        
        health: {
          title: '快取健康狀態',
          type: '快取類型',
          size: '大小',
          hitRate: '命中率',
          memoryUsage: '記憶體使用',
          utilization: '利用率',
          status: '狀態',
          healthy: '健康',
          warning: '警告',
          critical: '嚴重'
        },
        
        metrics: {
          title: '效能指標概覽',
          totalCaches: '總快取數',
          totalHits: '總命中數',
          totalMisses: '總未命中數',
          overallHitRate: '總體命中率',
          averageResponseTime: '平均回應時間'
        },
        
        memory: {
          title: '系統記憶體使用',
          rss: 'RSS記憶體',
          rssDesc: '常駐記憶體',
          heapUsed: '已用堆記憶體',
          heapUsedDesc: '已用堆記憶體',
          heapTotal: '總堆記憶體',
          heapTotalDesc: '總堆記憶體',
          external: '外部記憶體',
          externalDesc: '外部記憶體',
          heapUtilization: '堆記憶體利用率'
        },
        
        test: {
          title: '快取效能測試',
          testSize: '測試大小',
          writeTime: '寫入時間',
          readTime: '讀取時間',
          operations: '操作數',
          opsPerSecond: '每秒操作數',
          results: '測試結果'
        },
        
        config: {
          title: '快取設定管理',
          manageConfig: '管理設定',
          hideConfig: '隱藏設定',
          editConfig: '編輯設定',
          save: '儲存',
          saving: '儲存中...',
          cacheTypeSuffix: '快取',
          maxSize: '最大條目數',
          maxSizePlaceholder: '輸入最大條目數',
          defaultTTL: '預設過期時間',
          ttlPlaceholder: '輸入過期時間（秒）',
          cleanupInterval: '清理間隔',
          cleanupPlaceholder: '輸入清理間隔（秒）',
          seconds: '秒',
          current: '目前',
          currentUsage: '目前使用',
          capacityUtilization: '容量使用率',
          noConfigData: '暫無快取設定資料',
          clickRefresh: '點擊重新整理'
        },
        
        messages: {
          cacheCleared: '快取已清除',
          allCachesCleared: '所有快取已清除',
          testCompleted: '效能測試完成',
          testFailed: '效能測試失敗',
          refreshed: '資料已重新整理',
          clearCacheFailed: '清除快取失敗',
          configFetchFailed: '取得快取設定失敗',
          configUpdated: '快取設定已更新',
          configUpdateFailed: '更新快取設定失敗'
        },
        
        dialog: {
          clearAllTitle: '清除所有快取',
          clearCacheTitle: '清除 {{cacheType}} 快取',
          clearAllConfirm: '確定要清除所有快取嗎？此操作將清空所有快取資料。',
          clearCacheConfirm: '確定要清除 {{cacheType}} 快取嗎？此操作將清空該快取的所有資料。'
        }
      }
    }
  },
  
  en: {
    admin: {
      performance: {
        title: 'Performance Monitor',
        description: 'Monitor system performance metrics and request statistics',
        monitoring: 'Performance Monitoring',
        refresh: 'Refresh',
        autoRefresh: 'Auto Refresh',
        export: 'Export Data',
        clear: 'Clear Data',
        clearConfirmTitle: 'Clear Performance Data',
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
      },
      
      // Cache Performance Monitoring
      cache: {
        title: 'Cache Performance Monitor',
        description: 'Monitor cache system performance and health status',
        monitoring: 'Cache Monitoring',
        refresh: 'Refresh',
        autoRefresh: 'Auto Refresh',
        clear: 'Clear Cache',
        clearAll: 'Clear All Caches',
        clearConfirmTitle: 'Clear Cache',
        clearConfirm: 'Are you sure you want to clear the selected cache? This action cannot be undone.',
        clearAllConfirm: 'Are you sure you want to clear all caches? This action cannot be undone.',
        performanceTest: 'Performance Test',
        runTest: 'Run Test',
        testRunning: 'Test Running...',
        
        health: {
          title: 'Cache Health Status',
          type: 'Cache Type',
          size: 'Size',
          hitRate: 'Hit Rate',
          memoryUsage: 'Memory Usage',
          utilization: 'Utilization',
          status: 'Status',
          healthy: 'Healthy',
          warning: 'Warning',
          critical: 'Critical'
        },
        
        metrics: {
          title: 'Performance Metrics Overview',
          totalCaches: 'Total Caches',
          totalHits: 'Total Hits',
          totalMisses: 'Total Misses',
          overallHitRate: 'Overall Hit Rate',
          averageResponseTime: 'Average Response Time'
        },
        
        memory: {
          title: 'System Memory Usage',
          rss: 'RSS Memory',
          rssDesc: 'Resident Memory',
          heapUsed: 'Heap Used',
          heapUsedDesc: 'Used Heap Memory',
          heapTotal: 'Heap Total',
          heapTotalDesc: 'Total Heap Memory',
          external: 'External Memory',
          externalDesc: 'External Memory',
          heapUtilization: 'Heap Utilization'
        },
        
        test: {
          title: 'Cache Performance Test',
          testSize: 'Test Size',
          writeTime: 'Write Time',
          readTime: 'Read Time',
          operations: 'Operations',
          opsPerSecond: 'Ops/Second',
          results: 'Test Results'
        },
        
        config: {
          title: 'Cache Configuration Management',
          manageConfig: 'Manage Config',
          hideConfig: 'Hide Config',
          editConfig: 'Edit Config',
          save: 'Save',
          saving: 'Saving...',
          cacheTypeSuffix: 'Cache',
          maxSize: 'Max Size',
          maxSizePlaceholder: 'Enter max size',
          defaultTTL: 'Default TTL',
          ttlPlaceholder: 'Enter expiration time (seconds)',
          cleanupInterval: 'Cleanup Interval',
          cleanupPlaceholder: 'Enter cleanup interval (seconds)',
          seconds: 'seconds',
          current: 'Current',
          currentUsage: 'Current Usage',
          capacityUtilization: 'Capacity Utilization',
          noConfigData: 'No cache configuration data',
          clickRefresh: 'Click to refresh'
        },
        
        messages: {
          cacheCleared: 'Cache cleared',
          allCachesCleared: 'All caches cleared',
          testCompleted: 'Performance test completed',
          testFailed: 'Performance test failed',
          refreshed: 'Data refreshed',
          clearCacheFailed: 'Failed to clear cache',
          configFetchFailed: 'Failed to fetch cache configuration',
          configUpdated: 'Cache configuration updated',
          configUpdateFailed: 'Failed to update cache configuration'
        },
        
        dialog: {
          clearAllTitle: 'Clear All Caches',
          clearCacheTitle: 'Clear {{cacheType}} Cache',
          clearAllConfirm: 'Are you sure you want to clear all caches? This operation will empty all cache data.',
          clearCacheConfirm: 'Are you sure you want to clear {{cacheType}} cache? This operation will empty all data in this cache.'
        }
      }
    }
  },
  
  vi: {
    admin: {
      performance: {
        title: 'Giám sát hiệu suất',
        description: 'Giám sát các chỉ số hiệu suất hệ thống và thống kê yêu cầu',
        monitoring: 'Giám sát hiệu suất',
        refresh: 'Làm mới',
        autoRefresh: 'Tự động làm mới',
        export: 'Xuất dữ liệu',
        clear: 'Xóa dữ liệu',
        clearConfirmTitle: 'Xóa dữ liệu hiệu suất',
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
      },
      
      // Giám sát hiệu suất cache
      cache: {
        title: 'Giám sát hiệu suất cache',
        description: 'Giám sát hiệu suất và trạng thái sức khỏe của hệ thống cache',
        monitoring: 'Giám sát cache',
        refresh: 'Làm mới',
        autoRefresh: 'Tự động làm mới',
        clear: 'Xóa cache',
        clearAll: 'Xóa tất cả cache',
        clearConfirmTitle: 'Xóa cache',
        clearConfirm: 'Bạn có chắc chắn muốn xóa cache đã chọn? Hành động này không thể hoàn tác.',
        clearAllConfirm: 'Bạn có chắc chắn muốn xóa tất cả cache? Hành động này không thể hoàn tác.',
        performanceTest: 'Kiểm tra hiệu suất',
        runTest: 'Chạy kiểm tra',
        testRunning: 'Đang chạy kiểm tra...',
        
        health: {
          title: 'Trạng thái sức khỏe cache',
          type: 'Loại cache',
          size: 'Kích thước',
          hitRate: 'Tỷ lệ trúng',
          memoryUsage: 'Sử dụng bộ nhớ',
          utilization: 'Tỷ lệ sử dụng',
          status: 'Trạng thái',
          healthy: 'Khỏe mạnh',
          warning: 'Cảnh báo',
          critical: 'Nghiêm trọng'
        },
        
        metrics: {
          title: 'Tổng quan chỉ số hiệu suất',
          totalCaches: 'Tổng số cache',
          totalHits: 'Tổng số trúng',
          totalMisses: 'Tổng số trượt',
          overallHitRate: 'Tỷ lệ trúng tổng thể',
          averageResponseTime: 'Thời gian phản hồi trung bình'
        },
        
        memory: {
          title: 'Sử dụng bộ nhớ hệ thống',
          rss: 'Bộ nhớ RSS',
          rssDesc: 'Bộ nhớ thường trú',
          heapUsed: 'Heap đã sử dụng',
          heapUsedDesc: 'Bộ nhớ heap đã sử dụng',
          heapTotal: 'Tổng heap',
          heapTotalDesc: 'Tổng bộ nhớ heap',
          external: 'Bộ nhớ ngoài',
          externalDesc: 'Bộ nhớ bên ngoài',
          heapUtilization: 'Tỷ lệ sử dụng heap'
        },
        
        test: {
          title: 'Kiểm tra hiệu suất cache',
          testSize: 'Kích thước kiểm tra',
          writeTime: 'Thời gian ghi',
          readTime: 'Thời gian đọc',
          operations: 'Số thao tác',
          opsPerSecond: 'Thao tác/giây',
          results: 'Kết quả kiểm tra'
        },
        
        config: {
          title: 'Quản lý cấu hình cache',
          manageConfig: 'Quản lý cấu hình',
          hideConfig: 'Ẩn cấu hình',
          editConfig: 'Chỉnh sửa cấu hình',
          save: 'Lưu',
          saving: 'Đang lưu...',
          cacheTypeSuffix: 'Cache',
          maxSize: 'Kích thước tối đa',
          maxSizePlaceholder: 'Nhập kích thước tối đa',
          defaultTTL: 'Thời gian hết hạn mặc định',
          ttlPlaceholder: 'Nhập thời gian hết hạn (giây)',
          cleanupInterval: 'Khoảng thời gian dọn dẹp',
          cleanupPlaceholder: 'Nhập khoảng thời gian dọn dẹp (giây)',
          seconds: 'giây',
          current: 'Hiện tại',
          currentUsage: 'Sử dụng hiện tại',
          capacityUtilization: 'Tỷ lệ sử dụng dung lượng',
          noConfigData: 'Không có dữ liệu cấu hình cache',
          clickRefresh: 'Nhấp để làm mới'
        },
        
        messages: {
          cacheCleared: 'Cache đã được xóa',
          allCachesCleared: 'Tất cả cache đã được xóa',
          testCompleted: 'Kiểm tra hiệu suất hoàn thành',
          testFailed: 'Kiểm tra hiệu suất thất bại',
          refreshed: 'Dữ liệu đã được làm mới',
          clearCacheFailed: 'Xóa cache thất bại',
          configFetchFailed: 'Không thể lấy cấu hình cache',
          configUpdated: 'Cấu hình cache đã được cập nhật',
          configUpdateFailed: 'Cập nhật cấu hình cache thất bại'
        },
        
        dialog: {
          clearAllTitle: 'Xóa tất cả cache',
          clearCacheTitle: 'Xóa cache {{cacheType}}',
          clearAllConfirm: 'Bạn có chắc chắn muốn xóa tất cả cache? Thao tác này sẽ xóa sạch tất cả dữ liệu cache.',
          clearCacheConfirm: 'Bạn có chắc chắn muốn xóa cache {{cacheType}}? Thao tác này sẽ xóa sạch tất cả dữ liệu trong cache này.'
        }
      }
    }
  }
}
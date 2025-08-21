// 管理后台安全管理翻译
export const adminSecurityTranslations = {
  zh: {
    admin: {
      security: {
        title: '安全管理',
        description: '管理登录安全、IP黑名单和安全日志',
        overview: '安全概览',
        loginAttempts: '登录尝试',
        ipBlacklist: 'IP黑名单',
        securityLogs: '安全日志',
        
        // 标签页
        tabs: {
          stats: '安全概览',
          attempts: '登录记录',
          blacklist: 'IP黑名单',
          logs: '安全日志'
        },
        
        // 消息
        messages: {
          refreshed: '数据已刷新',
          refreshFailed: '刷新数据失败'
        },
        
        // 统计数据
        stats: {
          totalLoginAttempts: '总登录尝试次数',
          failedAttempts24h: '24小时内失败次数',
          blockedIPs: '被阻止的IP数量',
          securityEvents7d: '7天内安全事件',
        },
        
        // 登录尝试
        attempts: {
          title: '登录尝试记录',
          ipAddress: 'IP地址',
          email: '邮箱',
          success: '成功',
          failed: '失败',
          userAgent: '用户代理',
          failureReason: '失败原因',
          time: '时间',
          noData: '暂无登录尝试记录',
        },
        
        // IP黑名单
        blacklist: {
          title: 'IP黑名单',
          reason: '原因',
          blockedUntil: '阻止至',
          permanent: '永久',
          temporary: '临时',
          actions: '操作',
          unlock: '解锁',
          addIP: '添加IP',
          addIPPlaceholder: '请输入IP地址',
          reasonPlaceholder: '请输入阻止原因',
          add: '添加',
          cancel: '取消',
          confirmUnlock: '确认解锁',
          confirmUnlockMessage: '确定要解锁此IP地址吗？',
          unlockSuccess: 'IP解锁成功',
          addSuccess: 'IP添加到黑名单成功',
          noData: '暂无IP黑名单记录',
        },
        
        // 安全日志
        logs: {
          title: '安全日志',
          eventType: '事件类型',
          severity: '严重程度',
          userId: '用户ID',
          userEmail: '用户邮箱',
          eventData: '事件数据',
          time: '时间',
          filterByType: '按类型筛选',
          filterBySeverity: '按严重程度筛选',
          allTypes: '所有类型',
          allSeverities: '所有严重程度',
          info: '信息',
          warning: '警告',
          error: '错误',
          noData: '暂无安全日志记录',
        },
        
        // 通用
        loading: '加载中...',
        loadError: '加载失败',
        retry: '重试',
        refresh: '刷新',
        confirm: '确认',
        cancel: '取消',
      }
    }
  },
  
  'zh-TW': {
    admin: {
      security: {
        title: '安全管理',
        description: '管理登錄安全、IP黑名單和安全日誌',
        overview: '安全概覽',
        loginAttempts: '登入嘗試',
        ipBlacklist: 'IP黑名單',
        securityLogs: '安全日誌',
        
        // 標籤頁
        tabs: {
          stats: '安全概覽',
          attempts: '登錄記錄',
          blacklist: 'IP黑名單',
          logs: '安全日誌'
        },
        
        // 消息
        messages: {
          refreshed: '數據已刷新',
          refreshFailed: '刷新數據失敗'
        },
        
        // 統計數據
        stats: {
          totalLoginAttempts: '總登入嘗試次數',
          failedAttempts24h: '24小時內失敗次數',
          blockedIPs: '被阻止的IP數量',
          securityEvents7d: '7天內安全事件',
        },
        
        // 登入嘗試
        attempts: {
          title: '登入嘗試記錄',
          ipAddress: 'IP地址',
          email: '郵箱',
          success: '成功',
          failed: '失敗',
          userAgent: '用戶代理',
          failureReason: '失敗原因',
          time: '時間',
          noData: '暫無登入嘗試記錄',
        },
        
        // IP黑名單
        blacklist: {
          title: 'IP黑名單',
          reason: '原因',
          blockedUntil: '阻止至',
          permanent: '永久',
          temporary: '臨時',
          actions: '操作',
          unlock: '解鎖',
          addIP: '添加IP',
          addIPPlaceholder: '請輸入IP地址',
          reasonPlaceholder: '請輸入阻止原因',
          add: '添加',
          cancel: '取消',
          confirmUnlock: '確認解鎖',
          confirmUnlockMessage: '確定要解鎖此IP地址嗎？',
          unlockSuccess: 'IP解鎖成功',
          addSuccess: 'IP添加到黑名單成功',
          noData: '暫無IP黑名單記錄',
        },
        
        // 安全日誌
        logs: {
          title: '安全日誌',
          eventType: '事件類型',
          severity: '嚴重程度',
          userId: '用戶ID',
          userEmail: '用戶郵箱',
          eventData: '事件數據',
          time: '時間',
          filterByType: '按類型篩選',
          filterBySeverity: '按嚴重程度篩選',
          allTypes: '所有類型',
          allSeverities: '所有嚴重程度',
          info: '信息',
          warning: '警告',
          error: '錯誤',
          noData: '暫無安全日誌記錄',
        },
        
        // 通用
        loading: '加載中...',
        loadError: '加載失敗',
        retry: '重試',
        refresh: '刷新',
        confirm: '確認',
        cancel: '取消',
      }
    }
  },
  
  en: {
    admin: {
      security: {
        title: 'Security Management',
        description: 'Manage login security, IP blacklist and security logs',
        overview: 'Security Overview',
        loginAttempts: 'Login Attempts',
        ipBlacklist: 'IP Blacklist',
        securityLogs: 'Security Logs',
        
        // Tabs
        tabs: {
          stats: 'Security Overview',
          attempts: 'Login Records',
          blacklist: 'IP Blacklist',
          logs: 'Security Logs'
        },
        
        // Messages
        messages: {
          refreshed: 'Data refreshed',
          refreshFailed: 'Failed to refresh data'
        },
        
        // Statistics
        stats: {
          totalLoginAttempts: 'Total Login Attempts',
          failedAttempts24h: 'Failed Attempts (24h)',
          blockedIPs: 'Blocked IPs',
          securityEvents7d: 'Security Events (7d)',
        },
        
        // Login attempts
        attempts: {
          title: 'Login Attempt Records',
          ipAddress: 'IP Address',
          email: 'Email',
          success: 'Success',
          failed: 'Failed',
          userAgent: 'User Agent',
          failureReason: 'Failure Reason',
          time: 'Time',
          noData: 'No login attempt records',
        },
        
        // IP blacklist
        blacklist: {
          title: 'IP Blacklist',
          reason: 'Reason',
          blockedUntil: 'Blocked Until',
          permanent: 'Permanent',
          temporary: 'Temporary',
          actions: 'Actions',
          unlock: 'Unlock',
          addIP: 'Add IP',
          addIPPlaceholder: 'Enter IP address',
          reasonPlaceholder: 'Enter blocking reason',
          add: 'Add',
          cancel: 'Cancel',
          confirmUnlock: 'Confirm Unlock',
          confirmUnlockMessage: 'Are you sure you want to unlock this IP address?',
          unlockSuccess: 'IP unlocked successfully',
          addSuccess: 'IP added to blacklist successfully',
          noData: 'No IP blacklist records',
        },
        
        // Security logs
        logs: {
          title: 'Security Logs',
          eventType: 'Event Type',
          severity: 'Severity',
          userId: 'User ID',
          userEmail: 'User Email',
          eventData: 'Event Data',
          time: 'Time',
          filterByType: 'Filter by Type',
          filterBySeverity: 'Filter by Severity',
          allTypes: 'All Types',
          allSeverities: 'All Severities',
          info: 'Info',
          warning: 'Warning',
          error: 'Error',
          noData: 'No security log records',
        },
        
        // Common
        loading: 'Loading...',
        loadError: 'Load failed',
        retry: 'Retry',
        refresh: 'Refresh',
        confirm: 'Confirm',
        cancel: 'Cancel',
      }
    }
  },
  
  vi: {
    admin: {
      security: {
        title: 'Quản lý Bảo mật',
        description: 'Quản lý bảo mật đăng nhập, danh sách IP đen và nhật ký bảo mật',
        overview: 'Tổng quan Bảo mật',
        loginAttempts: 'Lần thử Đăng nhập',
        ipBlacklist: 'Danh sách IP Đen',
        securityLogs: 'Nhật ký Bảo mật',
        
        // Tabs
        tabs: {
          stats: 'Tổng quan Bảo mật',
          attempts: 'Bản ghi Đăng nhập',
          blacklist: 'Danh sách IP Đen',
          logs: 'Nhật ký Bảo mật'
        },
        
        // Messages
        messages: {
          refreshed: 'Dữ liệu đã được làm mới',
          refreshFailed: 'Không thể làm mới dữ liệu'
        },
        
        // Thống kê
        stats: {
          totalLoginAttempts: 'Tổng lần thử đăng nhập',
          failedAttempts24h: 'Lần thất bại (24h)',
          blockedIPs: 'IP bị chặn',
          securityEvents7d: 'Sự kiện bảo mật (7 ngày)',
        },
        
        // Lần thử đăng nhập
        attempts: {
          title: 'Bản ghi Lần thử Đăng nhập',
          ipAddress: 'Địa chỉ IP',
          email: 'Email',
          success: 'Thành công',
          failed: 'Thất bại',
          userAgent: 'User Agent',
          failureReason: 'Lý do thất bại',
          time: 'Thời gian',
          noData: 'Không có bản ghi lần thử đăng nhập',
        },
        
        // Danh sách IP đen
        blacklist: {
          title: 'Danh sách IP Đen',
          reason: 'Lý do',
          blockedUntil: 'Chặn đến',
          permanent: 'Vĩnh viễn',
          temporary: 'Tạm thời',
          actions: 'Hành động',
          unlock: 'Mở khóa',
          addIP: 'Thêm IP',
          addIPPlaceholder: 'Nhập địa chỉ IP',
          reasonPlaceholder: 'Nhập lý do chặn',
          add: 'Thêm',
          cancel: 'Hủy',
          confirmUnlock: 'Xác nhận Mở khóa',
          confirmUnlockMessage: 'Bạn có chắc chắn muốn mở khóa địa chỉ IP này?',
          unlockSuccess: 'Mở khóa IP thành công',
          addSuccess: 'Thêm IP vào danh sách đen thành công',
          noData: 'Không có bản ghi danh sách IP đen',
        },
        
        // Nhật ký bảo mật
        logs: {
          title: 'Nhật ký Bảo mật',
          eventType: 'Loại sự kiện',
          severity: 'Mức độ nghiêm trọng',
          userId: 'ID người dùng',
          userEmail: 'Email người dùng',
          eventData: 'Dữ liệu sự kiện',
          time: 'Thời gian',
          filterByType: 'Lọc theo loại',
          filterBySeverity: 'Lọc theo mức độ',
          allTypes: 'Tất cả loại',
          allSeverities: 'Tất cả mức độ',
          info: 'Thông tin',
          warning: 'Cảnh báo',
          error: 'Lỗi',
          noData: 'Không có bản ghi nhật ký bảo mật',
        },
        
        // Chung
        loading: 'Đang tải...',
        loadError: 'Tải thất bại',
        retry: 'Thử lại',
        refresh: 'Làm mới',
        confirm: 'Xác nhận',
        cancel: 'Hủy',
      }
    }
  }
}
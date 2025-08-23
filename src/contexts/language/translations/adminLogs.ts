// 活动日志管理翻译
export const adminLogsTranslations = {
  zh: {
    admin: {
      logs: {
        title: '活动日志',
        description: '查看系统中所有用户活动和操作记录',
        loading: '加载中...',
        noData: '暂无活动记录',
        system: '系统',
        messages: {
          refreshed: '数据已刷新',
          refreshFailed: '刷新数据失败',
          loadFailed: '加载活动日志失败'
        },
        search: {
          placeholder: '搜索活动...'
        },
        filter: {
          allActions: '所有操作',
          allResources: '所有资源类型',
          apply: '应用',
          clear: '清除'
        },
        actions: {
          create: '创建',
          update: '更新',
          delete: '删除',
          login: '登录',
          logout: '登出',
          view: '查看',
          export: '导出'
        },
        resources: {
          user: '用户',
          post: '帖子',
          comment: '评论',
          activity: '活动',
          category: '分类',
          setting: '设置',
          system: '系统'
        },
        table: {
          user: '用户',
          action: '操作',
          resource: '资源类型',
          resourceId: '资源ID',
          ip: 'IP地址',
          time: '时间',
          details: '详情'
        },
        pagination: {
          showing: '显示',
          to: '到',
          of: '共',
          entries: '条记录',
          totalRecords: '共 {total} 条记录',
          showingRecords: '显示第 {start} - {end} 条，共 {total} 条记录',
          pageInfo: '第 {page} 页，共 {totalPages} 页',
          previous: '上一页',
          next: '下一页'
        },
        clearLogs: {
          button: '清除日志',
          clearing: '清除中...',
          confirmTitle: '确认清除日志',
          confirmMessage: '此操作将清除30天前的所有活动日志，近期重要记录将被保留。此操作不可撤销，您确定要继续吗？',
          confirmButton: '确认清除',
          cancelButton: '取消',
          successMessage: '成功清除 {count} 条日志记录',
          errorMessage: '清除活动日志失败'
        }
      }
    }
  },
  'zh-TW': {
    admin: {
      logs: {
        title: '活動日誌',
        description: '查看系統中所有用戶活動和操作記錄',
        loading: '載入中...',
        noData: '暫無活動記錄',
        system: '系統',
        messages: {
          refreshed: '數據已刷新',
          refreshFailed: '刷新數據失敗',
          loadFailed: '載入活動日誌失敗'
        },
        search: {
          placeholder: '搜尋活動...'
        },
        filter: {
          allActions: '所有操作',
          allResources: '所有資源類型',
          apply: '應用',
          clear: '清除'
        },
        actions: {
          create: '創建',
          update: '更新',
          delete: '刪除',
          login: '登入',
          logout: '登出',
          view: '查看',
          export: '匯出'
        },
        resources: {
          user: '用戶',
          post: '帖子',
          comment: '評論',
          activity: '活動',
          category: '分類',
          setting: '設定',
          system: '系統'
        },
        table: {
          user: '用戶',
          action: '操作',
          resource: '資源類型',
          resourceId: '資源ID',
          ip: 'IP地址',
          time: '時間',
          details: '詳情'
        },
        pagination: {
          showing: '顯示',
          to: '到',
          of: '共',
          entries: '條記錄',
          totalRecords: '共 {total} 條記錄',
          showingRecords: '顯示第 {start} - {end} 條，共 {total} 條記錄',
          pageInfo: '第 {page} 頁，共 {totalPages} 頁',
          previous: '上一頁',
          next: '下一頁'
        },
        clearLogs: {
          button: '清除日誌',
          clearing: '清除中...',
          confirmTitle: '確認清除日誌',
          confirmMessage: '此操作將清除30天前的所有活動日誌，近期重要記錄將被保留。此操作不可撤銷，您確定要繼續嗎？',
          confirmButton: '確認清除',
          cancelButton: '取消',
          successMessage: '成功清除 {count} 條日誌記錄',
          errorMessage: '清除活動日誌失敗'
        }
      }
    }
  },
  en: {
    admin: {
      logs: {
        title: 'Activity Logs',
        description: 'View all user activities and operation records in the system',
        loading: 'Loading...',
        noData: 'No activity records',
        system: 'System',
        messages: {
          refreshed: 'Data refreshed',
          refreshFailed: 'Failed to refresh data',
          loadFailed: 'Failed to load activity logs'
        },
        search: {
          placeholder: 'Search activities...'
        },
        filter: {
          allActions: 'All Actions',
          allResources: 'All Resource Types',
          apply: 'Apply',
          clear: 'Clear'
        },
        actions: {
          create: 'Create',
          update: 'Update',
          delete: 'Delete',
          login: 'Login',
          logout: 'Logout',
          view: 'View',
          export: 'Export'
        },
        resources: {
          user: 'User',
          post: 'Post',
          comment: 'Comment',
          activity: 'Activity',
          category: 'Category',
          setting: 'Setting',
          system: 'System'
        },
        table: {
          user: 'User',
          action: 'Action',
          resource: 'Resource Type',
          resourceId: 'Resource ID',
          ip: 'IP Address',
          time: 'Time',
          details: 'Details'
        },
        pagination: {
          showing: 'Showing',
          to: 'to',
          of: 'of',
          entries: 'entries',
          totalRecords: 'Total {total} records',
          showingRecords: 'Showing {start} - {end} of {total} records',
          pageInfo: 'Page {page} of {totalPages}',
          previous: 'Previous',
          next: 'Next'
        },
        clearLogs: {
          button: 'Clear Logs',
          clearing: 'Clearing...',
          confirmTitle: 'Confirm Clear Logs',
          confirmMessage: 'This operation will clear all activity logs older than 30 days. Recent important records will be preserved. This action cannot be undone. Are you sure you want to continue?',
          confirmButton: 'Confirm Clear',
          cancelButton: 'Cancel',
          successMessage: 'Successfully cleared {count} log records',
          errorMessage: 'Failed to clear activity logs'
        }
      }
    }
  },
  vi: {
    admin: {
      logs: {
        title: 'Nhật ký hoạt động',
        description: 'Xem tất cả hoạt động của người dùng và bản ghi hoạt động trong hệ thống',
        loading: 'Đang tải...',
        noData: 'Không có bản ghi hoạt động',
        system: 'Hệ thống',
        messages: {
          refreshed: 'Dữ liệu đã được làm mới',
          refreshFailed: 'Không thể làm mới dữ liệu',
          loadFailed: 'Không thể tải nhật ký hoạt động'
        },
        search: {
          placeholder: 'Tìm kiếm hoạt động...'
        },
        filter: {
          allActions: 'Tất cả hành động',
          allResources: 'Tất cả loại tài nguyên',
          apply: 'Áp dụng',
          clear: 'Xóa'
        },
        actions: {
          create: 'Tạo',
          update: 'Cập nhật',
          delete: 'Xóa',
          login: 'Đăng nhập',
          logout: 'Đăng xuất',
          view: 'Xem',
          export: 'Xuất'
        },
        resources: {
          user: 'Người dùng',
          post: 'Bài viết',
          comment: 'Bình luận',
          activity: 'Hoạt động',
          category: 'Danh mục',
          setting: 'Cài đặt',
          system: 'Hệ thống'
        },
        table: {
          user: 'Người dùng',
          action: 'Hành động',
          resource: 'Loại tài nguyên',
          resourceId: 'ID tài nguyên',
          ip: 'Địa chỉ IP',
          time: 'Thời gian',
          details: 'Chi tiết'
        },
        pagination: {
          showing: 'Hiển thị',
          to: 'đến',
          of: 'của',
          entries: 'mục',
          totalRecords: 'Tổng cộng {total} bản ghi',
          showingRecords: 'Hiển thị {start} - {end} trong tổng số {total} bản ghi',
          pageInfo: 'Trang {page} trong tổng số {totalPages} trang',
          previous: 'Trang trước',
          next: 'Trang tiếp'
        },
        clearLogs: {
          button: 'Xóa nhật ký',
          clearing: 'Đang xóa...',
          confirmTitle: 'Xác nhận xóa nhật ký',
          confirmMessage: 'Thao tác này sẽ xóa tất cả nhật ký hoạt động cũ hơn 30 ngày. Các bản ghi quan trọng gần đây sẽ được bảo tồn. Thao tác này không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?',
          confirmButton: 'Xác nhận xóa',
          cancelButton: 'Hủy',
          successMessage: 'Đã xóa thành công {count} bản ghi nhật ký',
          errorMessage: 'Không thể xóa nhật ký hoạt động'
        }
      }
    }
  }
}
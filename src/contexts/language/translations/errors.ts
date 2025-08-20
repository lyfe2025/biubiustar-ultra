// 错误消息多语言翻译
export const errorTranslations = {
  zh: {
    errors: {
      // 通用错误
      general: {
        serverError: '服务器内部错误',
        networkError: '网络连接失败',
        unknownError: '未知错误',
        validationError: '数据验证失败',
        unauthorized: '未授权访问',
        forbidden: '禁止访问',
        notFound: '资源未找到',
        timeout: '请求超时',
        maintenance: '系统维护中'
      },
      
      // 帖子相关错误
      posts: {
        notFound: '帖子不存在',
        createFailed: '创建帖子失败',
        updateFailed: '更新帖子失败',
        deleteFailed: '删除帖子失败',
        fetchFailed: '获取帖子失败',
        titleRequired: '标题不能为空',
        contentRequired: '内容不能为空',
        userIdRequired: '用户ID不能为空',
        invalidStatus: '无效的状态值',
        permissionDenied: '没有权限执行此操作'
      },
      
      // 用户相关错误
      users: {
        notFound: '用户不存在',
        unauthorized: '请先登录',
        permissionDenied: '权限不足',
        profileNotFound: '用户资料不存在',
        avatarUploadFailed: '头像上传失败'
      },
      
      // 评论相关错误
      comments: {
        notFound: '评论不存在',
        createFailed: '创建评论失败',
        updateFailed: '更新评论失败',
        deleteFailed: '删除评论失败',
        contentRequired: '评论内容不能为空',
        postNotFound: '帖子不存在',
        permissionDenied: '没有权限执行此操作'
      },
      
      // 活动相关错误
      activities: {
        notFound: '活动不存在',
        createFailed: '创建活动失败',
        updateFailed: '更新活动失败',
        deleteFailed: '删除活动失败',
        titleRequired: '活动标题不能为空',
        dateRequired: '活动日期不能为空',
        permissionDenied: '没有权限执行此操作'
      },
      
      // 文件上传错误
      upload: {
        fileTooLarge: '文件过大',
        invalidFileType: '不支持的文件类型',
        uploadFailed: '文件上传失败',
        deleteFailed: '文件删除失败',
        storageError: '存储服务错误'
      }
    }
  },
  
  'zh-TW': {
    errors: {
      general: {
        serverError: '伺服器內部錯誤',
        networkError: '網路連接失敗',
        unknownError: '未知錯誤',
        validationError: '資料驗證失敗',
        unauthorized: '未授權存取',
        forbidden: '禁止存取',
        notFound: '資源未找到',
        timeout: '請求逾時',
        maintenance: '系統維護中'
      },
      
      posts: {
        notFound: '帖子不存在',
        createFailed: '建立帖子失敗',
        updateFailed: '更新帖子失敗',
        deleteFailed: '刪除帖子失敗',
        fetchFailed: '取得帖子失敗',
        titleRequired: '標題不能為空',
        contentRequired: '內容不能為空',
        userIdRequired: '使用者ID不能為空',
        invalidStatus: '無效的狀態值',
        permissionDenied: '沒有權限執行此操作'
      },
      
      users: {
        notFound: '使用者不存在',
        unauthorized: '請先登入',
        permissionDenied: '權限不足',
        profileNotFound: '使用者資料不存在',
        avatarUploadFailed: '頭像上傳失敗'
      },
      
      comments: {
        notFound: '評論不存在',
        createFailed: '建立評論失敗',
        updateFailed: '更新評論失敗',
        deleteFailed: '刪除評論失敗',
        contentRequired: '評論內容不能為空',
        postNotFound: '帖子不存在',
        permissionDenied: '沒有權限執行此操作'
      },
      
      activities: {
        notFound: '活動不存在',
        createFailed: '建立活動失敗',
        updateFailed: '更新活動失敗',
        deleteFailed: '刪除活動失敗',
        titleRequired: '活動標題不能為空',
        dateRequired: '活動日期不能為空',
        permissionDenied: '沒有權限執行此操作'
      },
      
      upload: {
        fileTooLarge: '檔案過大',
        invalidFileType: '不支援的檔案類型',
        uploadFailed: '檔案上傳失敗',
        deleteFailed: '檔案刪除失敗',
        storageError: '儲存服務錯誤'
      }
    }
  },
  
  en: {
    errors: {
      general: {
        serverError: 'Internal server error',
        networkError: 'Network connection failed',
        unknownError: 'Unknown error',
        validationError: 'Data validation failed',
        unauthorized: 'Unauthorized access',
        forbidden: 'Access forbidden',
        notFound: 'Resource not found',
        timeout: 'Request timeout',
        maintenance: 'System under maintenance'
      },
      
      posts: {
        notFound: 'Post not found',
        createFailed: 'Failed to create post',
        updateFailed: 'Failed to update post',
        deleteFailed: 'Failed to delete post',
        fetchFailed: 'Failed to fetch post',
        titleRequired: 'Title is required',
        contentRequired: 'Content is required',
        userIdRequired: 'User ID is required',
        invalidStatus: 'Invalid status value',
        permissionDenied: 'Permission denied'
      },
      
      users: {
        notFound: 'User not found',
        unauthorized: 'Please login first',
        permissionDenied: 'Insufficient permissions',
        profileNotFound: 'User profile not found',
        avatarUploadFailed: 'Failed to upload avatar'
      },
      
      comments: {
        notFound: 'Comment not found',
        createFailed: 'Failed to create comment',
        updateFailed: 'Failed to update comment',
        deleteFailed: 'Failed to delete comment',
        contentRequired: 'Comment content is required',
        postNotFound: 'Post not found',
        permissionDenied: 'Permission denied'
      },
      
      activities: {
        notFound: 'Activity not found',
        createFailed: 'Failed to create activity',
        updateFailed: 'Failed to update activity',
        deleteFailed: 'Failed to delete activity',
        titleRequired: 'Activity title is required',
        dateRequired: 'Activity date is required',
        permissionDenied: 'Permission denied'
      },
      
      upload: {
        fileTooLarge: 'File too large',
        invalidFileType: 'Unsupported file type',
        uploadFailed: 'File upload failed',
        deleteFailed: 'File deletion failed',
        storageError: 'Storage service error'
      }
    }
  },
  
  vi: {
    errors: {
      general: {
        serverError: 'Lỗi máy chủ nội bộ',
        networkError: 'Kết nối mạng thất bại',
        unknownError: 'Lỗi không xác định',
        validationError: 'Xác thực dữ liệu thất bại',
        unauthorized: 'Truy cập không được phép',
        forbidden: 'Truy cập bị cấm',
        notFound: 'Không tìm thấy tài nguyên',
        timeout: 'Yêu cầu quá thời gian',
        maintenance: 'Hệ thống đang bảo trì'
      },
      
      posts: {
        notFound: 'Không tìm thấy bài viết',
        createFailed: 'Tạo bài viết thất bại',
        updateFailed: 'Cập nhật bài viết thất bại',
        deleteFailed: 'Xóa bài viết thất bại',
        fetchFailed: 'Lấy bài viết thất bại',
        titleRequired: 'Tiêu đề không được để trống',
        contentRequired: 'Nội dung không được để trống',
        userIdRequired: 'ID người dùng không được để trống',
        invalidStatus: 'Giá trị trạng thái không hợp lệ',
        permissionDenied: 'Không có quyền thực hiện hành động này'
      },
      
      users: {
        notFound: 'Không tìm thấy người dùng',
        unauthorized: 'Vui lòng đăng nhập trước',
        permissionDenied: 'Quyền không đủ',
        profileNotFound: 'Không tìm thấy hồ sơ người dùng',
        avatarUploadFailed: 'Tải lên avatar thất bại'
      },
      
      comments: {
        notFound: 'Không tìm thấy bình luận',
        createFailed: 'Tạo bình luận thất bại',
        updateFailed: 'Cập nhật bình luận thất bại',
        deleteFailed: 'Xóa bình luận thất bại',
        contentRequired: 'Nội dung bình luận không được để trống',
        postNotFound: 'Không tìm thấy bài viết',
        permissionDenied: 'Không có quyền thực hiện hành động này'
      },
      
      activities: {
        notFound: 'Không tìm thấy hoạt động',
        createFailed: 'Tạo hoạt động thất bại',
        updateFailed: 'Cập nhật hoạt động thất bại',
        deleteFailed: 'Xóa hoạt động thất bại',
        titleRequired: 'Tiêu đề hoạt động không được để trống',
        dateRequired: 'Ngày hoạt động không được để trống',
        permissionDenied: 'Không có quyền thực hiện hành động này'
      },
      
      upload: {
        fileTooLarge: 'Tệp quá lớn',
        invalidFileType: 'Loại tệp không được hỗ trợ',
        uploadFailed: 'Tải lên tệp thất bại',
        deleteFailed: 'Xóa tệp thất bại',
        storageError: 'Lỗi dịch vụ lưu trữ'
      }
    }
  }
}

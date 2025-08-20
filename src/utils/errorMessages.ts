import { useLanguage } from '../contexts/language'

// 错误消息类型
export type ErrorType = 
  | 'posts.notFound'
  | 'posts.createFailed'
  | 'posts.updateFailed'
  | 'posts.deleteFailed'
  | 'posts.fetchFailed'
  | 'posts.titleRequired'
  | 'posts.contentRequired'
  | 'posts.userIdRequired'
  | 'posts.invalidStatus'
  | 'posts.permissionDenied'
  | 'users.notFound'
  | 'users.unauthorized'
  | 'users.permissionDenied'
  | 'users.profileNotFound'
  | 'users.avatarUploadFailed'
  | 'comments.notFound'
  | 'comments.createFailed'
  | 'comments.updateFailed'
  | 'comments.deleteFailed'
  | 'comments.contentRequired'
  | 'comments.postNotFound'
  | 'comments.permissionDenied'
  | 'activities.notFound'
  | 'activities.createFailed'
  | 'activities.updateFailed'
  | 'activities.deleteFailed'
  | 'activities.titleRequired'
  | 'activities.dateRequired'
  | 'activities.permissionDenied'
  | 'upload.fileTooLarge'
  | 'upload.invalidFileType'
  | 'upload.uploadFailed'
  | 'upload.deleteFailed'
  | 'upload.storageError'
  | 'general.serverError'
  | 'general.networkError'
  | 'general.unknownError'
  | 'general.validationError'
  | 'general.unauthorized'
  | 'general.forbidden'
  | 'general.notFound'
  | 'general.timeout'
  | 'general.maintenance'

// 获取错误消息的Hook
export const useErrorMessage = () => {
  const { t } = useLanguage()
  
  const getErrorMessage = (errorType: ErrorType): string => {
    return t(`errors.${errorType}`) || errorType
  }
  
  return { getErrorMessage }
}

// 直接获取错误消息的函数（用于非React组件中）
export const getErrorMessage = (errorType: ErrorType, language: string = 'zh'): string => {
  // 这里可以根据语言返回对应的错误消息
  // 由于这个函数主要用于非React环境，我们返回中文作为默认值
  const errorMessages: Record<string, Record<string, string>> = {
    zh: {
      'posts.notFound': '帖子不存在',
      'posts.createFailed': '创建帖子失败',
      'posts.updateFailed': '更新帖子失败',
      'posts.deleteFailed': '删除帖子失败',
      'posts.fetchFailed': '获取帖子失败',
      'posts.titleRequired': '标题不能为空',
      'posts.contentRequired': '内容不能为空',
      'posts.userIdRequired': '用户ID不能为空',
      'posts.invalidStatus': '无效的状态值',
      'posts.permissionDenied': '没有权限执行此操作',
      'users.notFound': '用户不存在',
      'users.unauthorized': '请先登录',
      'users.permissionDenied': '权限不足',
      'users.profileNotFound': '用户资料不存在',
      'users.avatarUploadFailed': '头像上传失败',
      'comments.notFound': '评论不存在',
      'comments.createFailed': '创建评论失败',
      'comments.updateFailed': '更新评论失败',
      'comments.deleteFailed': '删除评论失败',
      'comments.contentRequired': '评论内容不能为空',
      'comments.postNotFound': '帖子不存在',
      'comments.permissionDenied': '没有权限执行此操作',
      'activities.notFound': '活动不存在',
      'activities.createFailed': '创建活动失败',
      'activities.updateFailed': '更新活动失败',
      'activities.deleteFailed': '删除活动失败',
      'activities.titleRequired': '活动标题不能为空',
      'activities.dateRequired': '活动日期不能为空',
      'activities.permissionDenied': '没有权限执行此操作',
      'upload.fileTooLarge': '文件过大',
      'upload.invalidFileType': '不支持的文件类型',
      'upload.uploadFailed': '文件上传失败',
      'upload.deleteFailed': '文件删除失败',
      'upload.storageError': '存储服务错误',
      'general.serverError': '服务器内部错误',
      'general.networkError': '网络连接失败',
      'general.unknownError': '未知错误',
      'general.validationError': '数据验证失败',
      'general.unauthorized': '未授权访问',
      'general.forbidden': '禁止访问',
      'general.notFound': '资源未找到',
      'general.timeout': '请求超时',
      'general.maintenance': '系统维护中'
    },
    'zh-TW': {
      'posts.notFound': '帖子不存在',
      'posts.createFailed': '建立帖子失敗',
      'posts.updateFailed': '更新帖子失敗',
      'posts.deleteFailed': '刪除帖子失敗',
      'posts.fetchFailed': '取得帖子失敗',
      'posts.titleRequired': '標題不能為空',
      'posts.contentRequired': '內容不能為空',
      'posts.userIdRequired': '使用者ID不能為空',
      'posts.invalidStatus': '無效的狀態值',
      'posts.permissionDenied': '沒有權限執行此操作',
      'users.notFound': '使用者不存在',
      'users.unauthorized': '請先登入',
      'users.permissionDenied': '權限不足',
      'users.profileNotFound': '使用者資料不存在',
      'users.avatarUploadFailed': '頭像上傳失敗',
      'comments.notFound': '評論不存在',
      'comments.createFailed': '建立評論失敗',
      'comments.updateFailed': '更新評論失敗',
      'comments.deleteFailed': '刪除評論失敗',
      'comments.contentRequired': '評論內容不能為空',
      'comments.postNotFound': '帖子不存在',
      'comments.permissionDenied': '沒有權限執行此操作',
      'activities.notFound': '活動不存在',
      'activities.createFailed': '建立活動失敗',
      'activities.updateFailed': '更新活動失敗',
      'activities.deleteFailed': '刪除活動失敗',
      'activities.titleRequired': '活動標題不能為空',
      'activities.dateRequired': '活動日期不能為空',
      'activities.permissionDenied': '沒有權限執行此操作',
      'upload.fileTooLarge': '檔案過大',
      'upload.invalidFileType': '不支援的檔案類型',
      'upload.uploadFailed': '檔案上傳失敗',
      'upload.deleteFailed': '檔案刪除失敗',
      'upload.storageError': '儲存服務錯誤',
      'general.serverError': '伺服器內部錯誤',
      'general.networkError': '網路連接失敗',
      'general.unknownError': '未知錯誤',
      'general.validationError': '資料驗證失敗',
      'general.unauthorized': '未授權存取',
      'general.forbidden': '禁止存取',
      'general.notFound': '資源未找到',
      'general.timeout': '請求逾時',
      'general.maintenance': '系統維護中'
    },
    en: {
      'posts.notFound': 'Post not found',
      'posts.createFailed': 'Failed to create post',
      'posts.updateFailed': 'Failed to update post',
      'posts.deleteFailed': 'Failed to delete post',
      'posts.fetchFailed': 'Failed to fetch post',
      'posts.titleRequired': 'Title is required',
      'posts.contentRequired': 'Content is required',
      'posts.userIdRequired': 'User ID is required',
      'posts.invalidStatus': 'Invalid status value',
      'posts.permissionDenied': 'Permission denied',
      'users.notFound': 'User not found',
      'users.unauthorized': 'Please login first',
      'users.permissionDenied': 'Insufficient permissions',
      'users.profileNotFound': 'User profile not found',
      'users.avatarUploadFailed': 'Failed to upload avatar',
      'comments.notFound': 'Comment not found',
      'comments.createFailed': 'Failed to create comment',
      'comments.updateFailed': 'Failed to update comment',
      'comments.deleteFailed': 'Failed to delete comment',
      'comments.contentRequired': 'Comment content is required',
      'comments.postNotFound': 'Post not found',
      'comments.permissionDenied': 'Permission denied',
      'activities.notFound': 'Activity not found',
      'activities.createFailed': 'Failed to create activity',
      'activities.updateFailed': 'Failed to update activity',
      'activities.deleteFailed': 'Failed to delete activity',
      'activities.titleRequired': 'Activity title is required',
      'activities.dateRequired': 'Activity date is required',
      'activities.permissionDenied': 'Permission denied',
      'upload.fileTooLarge': 'File too large',
      'upload.invalidFileType': 'Unsupported file type',
      'upload.uploadFailed': 'File upload failed',
      'upload.deleteFailed': 'File deletion failed',
      'upload.storageError': 'Storage service error',
      'general.serverError': 'Internal server error',
      'general.networkError': 'Network connection failed',
      'general.unknownError': 'Unknown error',
      'general.validationError': 'Data validation failed',
      'general.unauthorized': 'Unauthorized access',
      'general.forbidden': 'Access forbidden',
      'general.notFound': 'Resource not found',
      'general.timeout': 'Request timeout',
      'general.maintenance': 'System under maintenance'
    },
    vi: {
      'posts.notFound': 'Không tìm thấy bài viết',
      'posts.createFailed': 'Tạo bài viết thất bại',
      'posts.updateFailed': 'Cập nhật bài viết thất bại',
      'posts.deleteFailed': 'Xóa bài viết thất bại',
      'posts.fetchFailed': 'Lấy bài viết thất bại',
      'posts.titleRequired': 'Tiêu đề không được để trống',
      'posts.contentRequired': 'Nội dung không được để trống',
      'posts.userIdRequired': 'ID người dùng không được để trống',
      'posts.invalidStatus': 'Giá trị trạng thái không hợp lệ',
      'posts.permissionDenied': 'Không có quyền thực hiện hành động này',
      'users.notFound': 'Không tìm thấy người dùng',
      'users.unauthorized': 'Vui lòng đăng nhập trước',
      'users.permissionDenied': 'Quyền không đủ',
      'users.profileNotFound': 'Không tìm thấy hồ sơ người dùng',
      'users.avatarUploadFailed': 'Tải lên avatar thất bại',
      'comments.notFound': 'Không tìm thấy bình luận',
      'comments.createFailed': 'Tạo bình luận thất bại',
      'comments.updateFailed': 'Cập nhật bình luận thất bại',
      'comments.deleteFailed': 'Xóa bình luận thất bại',
      'comments.contentRequired': 'Nội dung bình luận không được để trống',
      'comments.postNotFound': 'Không tìm thấy bài viết',
      'comments.permissionDenied': 'Không có quyền thực hiện hành động này',
      'activities.notFound': 'Không tìm thấy hoạt động',
      'activities.createFailed': 'Tạo hoạt động thất bại',
      'activities.updateFailed': 'Cập nhật hoạt động thất bại',
      'activities.deleteFailed': 'Xóa hoạt động thất bại',
      'activities.titleRequired': 'Tiêu đề hoạt động không được để trống',
      'activities.dateRequired': 'Ngày hoạt động không được để trống',
      'activities.permissionDenied': 'Không có quyền thực hiện hành động này',
      'upload.fileTooLarge': 'Tệp quá lớn',
      'upload.invalidFileType': 'Loại tệp không được hỗ trợ',
      'upload.uploadFailed': 'Tải lên tệp thất bại',
      'upload.deleteFailed': 'Xóa tệp thất bại',
      'upload.storageError': 'Lỗi dịch vụ lưu trữ',
      'general.serverError': 'Lỗi máy chủ nội bộ',
      'general.networkError': 'Kết nối mạng thất bại',
      'general.unknownError': 'Lỗi không xác định',
      'general.validationError': 'Xác thực dữ liệu thất bại',
      'general.unauthorized': 'Truy cập không được phép',
      'general.forbidden': 'Truy cập bị cấm',
      'general.notFound': 'Không tìm thấy tài nguyên',
      'general.timeout': 'Yêu cầu quá thời gian',
      'general.maintenance': 'Hệ thống đang bảo trì'
    }
  }
  
  return errorMessages[language]?.[errorType] || errorMessages['zh'][errorType] || errorType
}

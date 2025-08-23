// 用户管理翻译
export const adminUsersTranslations = {
  zh: {
    admin: {
      // 用户管理
      users: {
        title: '用户管理',
        description: '管理平台用户',
        list: '用户列表',
        addUser: '添加用户',
        editUser: '编辑用户',
        loading: '加载中...',
        noUsers: '暂无用户',
        noUsersDesc: '系统中还没有用户',
        confirmDelete: '确认删除',
        confirmDeleteMessage: '确定要删除用户 {username} 吗？此操作无法撤销。',
        search: {
          placeholder: '搜索用户名、邮箱...'
        },
        filter: {
          allStatus: '所有状态',
          allRoles: '所有角色'
        },
        table: {
          user: '用户',
          contact: '联系方式',
          status: '状态',
          role: '角色',
          stats: '统计',
          joined: '加入时间',
          actions: '操作'
        },
        status: {
          active: '活跃',
          suspended: '暂停',
          banned: '已封禁',
          pending: '待审核'
        },
        role: {
          user: '普通用户',
          moderator: '版主',
          admin: '管理员'
        },
        username: '用户名',
        email: '邮箱',
        password: '密码',
        fullName: '全名',
        bio: '个人简介',
        location: '位置',
        website: '网站',
        posts: '帖子数',
        followers: '关注者',
        following: '关注中',
        delete: '删除',
        cancel: '取消',
        save: '保存',
        create: '创建',
        creating: '创建中...',
        saving: '保存中...',
        updating: '更新中...',
        changePassword: '修改密码',
        changePasswordFor: '修改密码',
        newPassword: '新密码',
        confirmPassword: '确认密码',
        updatePassword: '更新密码',
        actions: {
          view: '查看',
          edit: '编辑',
          delete: '删除',
          changePassword: '修改密码'
        },
        validation: {
          usernameRequired: '用户名不能为空',
          emailRequired: '邮箱不能为空',
          passwordRequired: '密码不能为空',
          passwordTooShort: '密码长度至少6位',
          passwordMismatch: '两次输入的密码不一致',
          passwordTooLong: '密码长度不能超过128位',
          passwordEmpty: '密码不能为空'
        },
        // 密码更新相关
        passwordUpdate: {
          success: '密码更新成功',
          error: '密码更新失败',
          errors: {
            invalidPassword: '密码格式无效',
            passwordTooWeak: '密码强度不足',
            userNotFound: '用户不存在',
            rateLimitExceeded: '操作过于频繁',
            serviceUnavailable: '服务暂时不可用',
            networkError: '网络连接失败',
            timeout: '请求超时',
            authenticationFailed: '认证失败'
          },
          details: {
            invalidPassword: '请检查密码格式，确保密码长度在6-128位之间',
            passwordTooWeak: '请使用包含字母、数字和特殊字符的复杂密码',
            userNotFound: '指定的用户可能已被删除或ID无效',
            rateLimitExceeded: '请稍等片刻后再试',
            serviceUnavailable: '认证服务暂时不可用，请稍后重试',
            networkError: '请检查网络连接后重试',
            timeout: '操作耗时过长，请稍后重试',
            authenticationFailed: '登录状态已过期，请重新登录'
          },
          requirements: {
            title: '密码要求：',
            minLength: '密码长度至少6位，建议8位以上',
            complexity: '包含大小写字母、数字和特殊字符',
            avoid: '避免使用常见密码和个人信息'
          },
          strength: {
            weak: '密码强度较弱',
            fair: '密码强度一般',
            good: '密码强度良好',
            strong: '密码强度很强'
          }
        }
      },
      // usersManagement - 为了兼容组件中使用的翻译键格式
      usersManagement: {
        search: {
          placeholder: '搜索用户名、邮箱...'
        },
        filter: {
          allStatus: '所有状态',
          allRoles: '所有角色'
        },
        table: {
          user: '用户',
          contact: '联系方式',
          status: '状态',
          role: '角色',
          stats: '统计',
          joined: '加入时间',
          actions: '操作'
        },
        status: {
          active: '活跃',
          suspended: '暂停',
          banned: '已封禁',
          pending: '待审核'
        },
        role: {
          user: '普通用户',
          moderator: '版主',
          admin: '管理员'
        }
      }
    }
  },
  
  'zh-TW': {
    admin: {
      users: {
        title: '用戶管理',
        description: '管理平台用戶',
        list: '用戶列表',
        addUser: '添加用戶',
        editUser: '編輯用戶',
        loading: '加載中...',
        noUsers: '暫無用戶',
        noUsersDesc: '系統中還沒有用戶',
        confirmDelete: '確認刪除',
        confirmDeleteMessage: '確定要刪除用戶 {username} 嗎？此操作無法撤銷。',
        search: {
          placeholder: '搜索用戶名、郵箱...'
        },
        filter: {
          allStatus: '所有狀態',
          allRoles: '所有角色'
        },
        table: {
          user: '用戶',
          contact: '聯繫方式',
          status: '狀態',
          role: '角色',
          stats: '統計',
          joined: '加入時間',
          actions: '操作'
        },
        status: {
          active: '活躍',
          suspended: '暫停',
          banned: '已封禁',
          pending: '待審核'
        },
        role: {
          user: '普通用戶',
          moderator: '版主',
          admin: '管理員'
        },
        username: '用戶名',
        email: '郵箱',
        password: '密碼',
        fullName: '全名',
        bio: '個人簡介',
        location: '位置',
        website: '網站',
        posts: '帖子數',
        followers: '關注者',
        following: '關注中',
        delete: '刪除',
        cancel: '取消',
        save: '保存',
        create: '創建',
        creating: '創建中...',
        saving: '保存中...',
        updating: '更新中...',
        changePassword: '修改密碼',
        changePasswordFor: '修改密碼',
        newPassword: '新密碼',
        confirmPassword: '確認密碼',
        updatePassword: '更新密碼',
        actions: {
          view: '查看',
          edit: '編輯',
          delete: '刪除',
          changePassword: '修改密碼'
        },
        validation: {
          usernameRequired: '用戶名不能為空',
          emailRequired: '郵箱不能為空',
          passwordRequired: '密碼不能為空',
          passwordTooShort: '密碼長度至少6位',
          passwordMismatch: '兩次輸入的密碼不一致'
        }
      },
      // usersManagement - 為了兼容組件中使用的翻譯鍵格式
      usersManagement: {
        search: {
          placeholder: '搜索用戶名、郵箱...'
        },
        filter: {
          allStatus: '所有狀態',
          allRoles: '所有角色'
        },
        table: {
          user: '用戶',
          contact: '聯繫方式',
          status: '狀態',
          role: '角色',
          stats: '統計',
          joined: '加入時間',
          actions: '操作'
        },
        status: {
          active: '活躍',
          suspended: '暫停',
          banned: '已封禁',
          pending: '待審核'
        },
        role: {
          user: '普通用戶',
          moderator: '版主',
          admin: '管理員'
        }
      }
    }
  },
  
  en: {
    admin: {
      users: {
        title: 'User Management',
        description: 'Manage platform users',
        list: 'User List',
        addUser: 'Add User',
        editUser: 'Edit User',
        loading: 'Loading...',
        noUsers: 'No Users',
        noUsersDesc: 'There are no users in the system yet',
        confirmDelete: 'Confirm Delete',
        confirmDeleteMessage: 'Are you sure you want to delete user {username}? This action cannot be undone.',
        search: {
          placeholder: 'Search username, email...'
        },
        filter: {
          allStatus: 'All Status',
          allRoles: 'All Roles'
        },
        table: {
          user: 'User',
          contact: 'Contact',
          status: 'Status',
          role: 'Role',
          stats: 'Stats',
          joined: 'Joined',
          actions: 'Actions'
        },
        status: {
          active: 'Active',
          suspended: 'Suspended',
          banned: 'Banned',
          pending: 'Pending'
        },
        role: {
          user: 'User',
          moderator: 'Moderator',
          admin: 'Admin'
        },
        username: 'Username',
        email: 'Email',
        password: 'Password',
        fullName: 'Full Name',
        bio: 'Bio',
        location: 'Location',
        website: 'Website',
        posts: 'Posts',
        followers: 'Followers',
        following: 'Following',
        delete: 'Delete',
        cancel: 'Cancel',
        save: 'Save',
        create: 'Create',
        creating: 'Creating...',
        saving: 'Saving...',
        updating: 'Updating...',
        changePassword: 'Change Password',
        changePasswordFor: 'Change Password For',
        newPassword: 'New Password',
        confirmPassword: 'Confirm Password',
        updatePassword: 'Update Password',
        actions: {
          view: 'View',
          edit: 'Edit',
          delete: 'Delete',
          changePassword: 'Change Password'
        },
        validation: {
          usernameRequired: 'Username is required',
          emailRequired: 'Email is required',
          passwordRequired: 'Password is required',
          passwordTooShort: 'Password must be at least 6 characters',
          passwordMismatch: 'Passwords do not match',
          passwordTooLong: 'Password cannot exceed 128 characters',
          passwordEmpty: 'Password cannot be empty'
        },
        // Password update related
        passwordUpdate: {
          success: 'Password updated successfully',
          error: 'Password update failed',
          errors: {
            invalidPassword: 'Invalid password format',
            passwordTooWeak: 'Password strength is insufficient',
            userNotFound: 'User not found',
            rateLimitExceeded: 'Operation too frequent',
            serviceUnavailable: 'Service temporarily unavailable',
            networkError: 'Network connection failed',
            timeout: 'Request timeout',
            authenticationFailed: 'Authentication failed'
          },
          details: {
            invalidPassword: 'Please check password format, ensure password length is between 6-128 characters',
            passwordTooWeak: 'Please use a complex password containing letters, numbers and special characters',
            userNotFound: 'The specified user may have been deleted or ID is invalid',
            rateLimitExceeded: 'Please wait a moment and try again',
            serviceUnavailable: 'Authentication service temporarily unavailable, please try again later',
            networkError: 'Please check network connection and try again',
            timeout: 'Operation took too long, please try again later',
            authenticationFailed: 'Login status has expired, please login again'
          },
          requirements: {
            title: 'Password Requirements:',
            minLength: 'Password must be at least 6 characters, recommended 8+ characters',
            complexity: 'Include uppercase and lowercase letters, numbers and special characters',
            avoid: 'Avoid using common passwords and personal information'
          },
          strength: {
            weak: 'Password strength is weak',
            fair: 'Password strength is fair',
            good: 'Password strength is good',
            strong: 'Password strength is strong'
          }
        }
      },
      // usersManagement - For compatibility with translation keys used in components
      usersManagement: {
        search: {
          placeholder: 'Search username, email...'
        },
        filter: {
          allStatus: 'All Status',
          allRoles: 'All Roles'
        },
        table: {
          user: 'User',
          contact: 'Contact',
          status: 'Status',
          role: 'Role',
          stats: 'Stats',
          joined: 'Joined',
          actions: 'Actions'
        },
        status: {
          active: 'Active',
          suspended: 'Suspended',
          banned: 'Banned',
          pending: 'Pending'
        },
        role: {
          user: 'User',
          moderator: 'Moderator',
          admin: 'Admin'
        }
      }
    }
  },
  
  vi: {
    admin: {
      users: {
        title: 'Quản lý người dùng',
        description: 'Quản lý người dùng nền tảng',
        list: 'Danh sách người dùng',
        addUser: 'Thêm người dùng',
        editUser: 'Chỉnh sửa người dùng',
        loading: 'Đang tải...',
        noUsers: 'Không có người dùng',
        noUsersDesc: 'Chưa có người dùng nào trong hệ thống',
        confirmDelete: 'Xác nhận xóa',
        confirmDeleteMessage: 'Bạn có chắc chắn muốn xóa người dùng {username}? Hành động này không thể hoàn tác.',
        search: {
          placeholder: 'Tìm tên người dùng, email...'
        },
        filter: {
          allStatus: 'Tất cả trạng thái',
          allRoles: 'Tất cả vai trò'
        },
        table: {
          user: 'Người dùng',
          contact: 'Liên hệ',
          status: 'Trạng thái',
          role: 'Vai trò',
          stats: 'Thống kê',
          joined: 'Ngày tham gia',
          actions: 'Thao tác'
        },
        status: {
          active: 'Hoạt động',
          suspended: 'Tạm dừng',
          banned: 'Bị cấm',
          pending: 'Chờ duyệt'
        },
        role: {
          user: 'Người dùng',
          moderator: 'Người kiểm duyệt',
          admin: 'Quản trị viên'
        },
        username: 'Tên người dùng',
        email: 'Email',
        password: 'Mật khẩu',
        fullName: 'Họ và tên',
        bio: 'Tiểu sử',
        location: 'Vị trí',
        website: 'Trang web',
        posts: 'Số bài viết',
        followers: 'Người theo dõi',
        following: 'Đang theo dõi',
        delete: 'Xóa',
        cancel: 'Hủy',
        save: 'Lưu',
        create: 'Tạo',
        creating: 'Đang tạo...',
        saving: 'Đang lưu...',
        updating: 'Đang cập nhật...',
        changePassword: 'Đổi mật khẩu',
        changePasswordFor: 'Đổi mật khẩu cho',
        newPassword: 'Mật khẩu mới',
        confirmPassword: 'Xác nhận mật khẩu',
        updatePassword: 'Cập nhật mật khẩu',
        actions: {
          view: 'Xem',
          edit: 'Chỉnh sửa',
          delete: 'Xóa',
          changePassword: 'Đổi mật khẩu'
        },
        validation: {
          usernameRequired: 'Tên người dùng không được để trống',
          emailRequired: 'Email không được để trống',
          passwordRequired: 'Mật khẩu không được để trống',
          passwordTooShort: 'Mật khẩu phải có ít nhất 6 ký tự',
          passwordMismatch: 'Mật khẩu không khớp'
        }
      },
      // usersManagement - Để tương thích với các khóa dịch được sử dụng trong components
      usersManagement: {
        search: {
          placeholder: 'Tìm tên người dùng, email...'
        },
        filter: {
          allStatus: 'Tất cả trạng thái',
          allRoles: 'Tất cả vai trò'
        },
        table: {
          user: 'Người dùng',
          contact: 'Liên hệ',
          status: 'Trạng thái',
          role: 'Vai trò',
          stats: 'Thống kê',
          joined: 'Ngày tham gia',
          actions: 'Thao tác'
        },
        status: {
          active: 'Hoạt động',
          suspended: 'Tạm dừng',
          banned: 'Bị cấm',
          pending: 'Chờ duyệt'
        },
        role: {
          user: 'Người dùng',
          moderator: 'Người kiểm duyệt',
          admin: 'Quản trị viên'
        }
      }
    }
  }
}

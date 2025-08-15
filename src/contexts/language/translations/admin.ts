// 管理后台翻译
export const adminTranslations = {
  zh: {
    admin: {
      // 基础导航
      title: '管理控制台',
      console: '控制台',
      logout: '退出登录',
      backToFrontend: '返回前台',
      
      // 管理员登录
      login: {
        title: '管理员登录',
        subtitle: '请使用管理员账户登录系统',
        email: '邮箱',
        emailPlaceholder: '请输入管理员邮箱',
        password: '密码',
        passwordPlaceholder: '请输入密码',
        login: '登录',
        backToHome: '返回首页'
      },
      
      // 仪表板
      dashboard: {
        title: '仪表板',
        welcome: '欢迎',
        totalUsers: '总用户数',
        newToday: '今日新增',
        totalPosts: '总帖子数',
        pending: '待审核',
        totalActivities: '总活动数',
        active: '进行中',
        totalViews: '总浏览量',
        thisWeek: '本周',
        quickActions: '快速操作',
        recentActivities: '最近活动',
        interactionStats: '互动统计',
        totalLikes: '总点赞数',
        totalComments: '总评论数',
        interactionRate: '互动率',
        contentReview: '内容审核',
        contentReviewDesc: '审核待发布内容',
        userManagement: '用户管理',
        userManagementDesc: '管理用户权限',
        activityManagement: '活动管理',
        activityManagementDesc: '管理平台活动',
        systemSettings: '系统设置',
        systemSettingsDesc: '配置系统参数',
        viewAllActivities: '查看所有活动'
      },

      // 用户管理
      users: {
        title: '用户管理',
        description: '管理平台用户',
        list: '用户列表',
        addUser: '添加用户',
        loading: '加载中...',
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
      },

      // 内容管理
      content: {
        title: '内容管理',
        description: '管理平台上的所有内容',
        posts: '帖子管理',
        comments: '评论管理',
        status: '状态',
        published: '已发布',
        pending: '待审核',
        rejected: '已拒绝',
        approve: '批准',
        reject: '拒绝',
        searchContent: '搜索内容',
        searchPlaceholder: '搜索帖子、评论...',
        filterByStatus: '按状态筛选',
        allStatus: '所有状态',
        noContent: '暂无内容',
        noContentDesc: '还没有任何内容',
        tabs: {
          content: '内容',
          categories: '分类'
        },
        table: {
          content: '内容',
          author: '作者',
          status: '状态',
          stats: '统计',
          date: '日期',
          actions: '操作'
        },
        categories: {
          manage: '分类管理',
          create: '创建分类',
          searchPlaceholder: '搜索分类...',
          table: {
            category: '分类',
            description: '描述',
            status: '状态',
            order: '排序',
            created: '创建时间',
            actions: '操作'
          },
          noCategories: '暂无分类',
          noCategoriesDesc: '还没有创建任何分类',
          createFirst: '创建第一个分类'
        }
      },

      // 活动管理
      activities: {
        title: '活动管理',
        description: '管理平台活动',
        list: '活动列表',
        create: '创建活动',
        edit: '编辑活动',
        status: '状态',
        upcoming: '即将开始',
        ongoing: '进行中',
        completed: '已结束',
        participants: '参与者',
        totalActivities: '活动总数',
        activeActivities: '进行中活动',
        completedActivities: '已完成活动',
        totalParticipants: '参与人数',
        noActivities: '暂无活动',
        searchPlaceholder: '搜索活动...',
        allStatus: '所有状态',
        allCategories: '所有分类',
        tabs: {
          activities: '活动',
          categories: '分类'
        },
        table: {
          title: '标题',
          organizer: '组织者',
          status: '状态',
          participants: '参与者',
          time: '时间',
          actions: '操作'
        },
        filter: {
          allStatus: '所有状态',
          allCategories: '所有分类'
        },
        search: {
          placeholder: '搜索活动...'
        },
        actions: {
          create: '创建活动'
        }
      },

      // 系统设置
      settings: {
        title: '系统设置',
        description: '配置系统参数和选项',
        general: '常规设置',
        security: '安全设置',
        email: '邮件设置',
        siteName: '网站名称',
        adminEmail: '管理员邮箱',
        timezone: '时区',
        language: '默认语言',
        refresh: '刷新',
        export: '导出',
        import: '导入',
        reset: '重置',
        tabs: {
          basic: '基础设置',
          users: '用户设置',
          content: '内容设置',
          email: '邮件设置',
          security: '安全设置',
          theme: '主题设置'
        },
        basic: {
          title: '基础设置',
          siteName: '站点名称',
          siteNamePlaceholder: '请输入站点名称',
          siteNameDescription: '网站的名称',
          siteDescription: '站点描述',
          siteDescriptionPlaceholder: '请输入站点描述',
          siteDescriptionDescription: '网站的描述信息',
          siteLogo: '站点标志',
          uploadLogo: '上传标志',
          logoDescription: '网站的标志图片',
          siteFavicon: '站点图标',
          uploadFavicon: '上传图标',
          faviconDescription: '浏览器标签页显示的图标'
        },
        user: {
          title: '用户设置',
          allowRegistration: '允许注册',
          allowRegistrationDescription: '是否允许新用户注册',
          requireEmailVerification: '需要邮箱验证',
          requireEmailVerificationDescription: '新用户注册时是否需要验证邮箱',
          defaultRole: '默认角色',
          defaultRoleDescription: '新用户注册时的默认角色',
          maxPostsPerDay: '每日最大发帖数',
          maxPostsPerDayDescription: '用户每天最多可以发布的帖子数量',
          maxFileSize: '最大文件大小',
          maxFileSizeDescription: '用户上传文件的最大大小限制',
          roles: {
            user: '普通用户'
          }
        },
        content: {
          title: '内容设置',
          enableModeration: '启用内容审核',
          enableModerationDescription: '是否对新发布的内容进行审核',
          autoApprove: '自动批准',
          autoApproveDescription: '是否自动批准新发布的内容',
          interactionFeatures: '互动功能',
          enableComments: '启用评论',
          enableCommentsDescription: '是否允许用户评论',
          enableLikes: '启用点赞',
          enableLikesDescription: '是否允许用户点赞',
          enableShares: '启用分享',
          enableSharesDescription: '是否允许用户分享内容'
        }
      }
    }
  },
  
  'zh-TW': {
    admin: {
      title: '管理控制台',
      console: '控制台',
      logout: '退出登錄',
      backToFrontend: '返回前台',
      
      login: {
        title: '管理員登錄',
        subtitle: '請使用管理員帳戶登錄系統',
        email: '郵箱',
        emailPlaceholder: '請輸入管理員郵箱',
        password: '密碼',
        passwordPlaceholder: '請輸入密碼',
        login: '登錄',
        backToHome: '返回首頁'
      },
      
      dashboard: {
        title: '儀表板',
        welcome: '歡迎',
        totalUsers: '總用戶數',
        newToday: '今日新增',
        totalPosts: '總帖子數',
        pending: '待審核',
        totalActivities: '總活動數',
        active: '進行中',
        totalViews: '總瀏覽量',
        thisWeek: '本周',
        quickActions: '快速操作',
        recentActivities: '最近活動',
        interactionStats: '互動統計',
        totalLikes: '總點讚數',
        totalComments: '總評論數',
        interactionRate: '互動率',
        contentReview: '內容審核',
        contentReviewDesc: '審核待發布內容',
        userManagement: '用戶管理',
        userManagementDesc: '管理用戶權限',
        activityManagement: '活動管理',
        activityManagementDesc: '管理平台活動',
        systemSettings: '系統設置',
        systemSettingsDesc: '配置系統參數',
        viewAllActivities: '查看所有活動'
      },

      usersManagement: {
        title: '用戶管理',
        description: '管理平台用戶',
        list: '用戶列表',
        addUser: '添加用戶',
        loading: '加載中...',
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
      },

      content: {
        title: '內容管理',
        description: '管理平台上的所有內容',
        posts: '帖子管理',
        comments: '評論管理',
        status: '狀態',
        published: '已發布',
        pending: '待審核',
        rejected: '已拒絕',
        approve: '批准',
        reject: '拒絕',
        searchContent: '搜索內容',
        searchPlaceholder: '搜索帖子、評論...',
        filterByStatus: '按狀態篩選',
        allStatus: '所有狀態',
        noContent: '暫無內容',
        noContentDesc: '還沒有任何內容',
        tabs: {
          content: '內容',
          categories: '分類'
        },
        table: {
          content: '內容',
          author: '作者',
          status: '狀態',
          stats: '統計',
          date: '日期',
          actions: '操作'
        }
      },

      activities: {
        title: '活動管理',
        description: '管理平台活動',
        list: '活動列表',
        create: '創建活動',
        edit: '編輯活動',
        status: '狀態',
        upcoming: '即將開始',
        ongoing: '進行中',
        completed: '已結束',
        participants: '參與者',
        totalActivities: '活動總數',
        activeActivities: '進行中活動',
        completedActivities: '已完成活動',
        totalParticipants: '參與人數',
        noActivities: '暫無活動',
        tabs: {
          activities: '活動',
          categories: '分類'
        },
        table: {
          title: '標題',
          organizer: '組織者',
          status: '狀態',
          participants: '參與者',
          time: '時間',
          actions: '操作'
        },
        filter: {
          allStatus: '所有狀態',
          allCategories: '所有分類'
        },
        search: {
          placeholder: '搜索活動...'
        },
        actions: {
          create: '創建活動'
        }
      },

      settings: {
        title: '系統設置',
        description: '配置系統參數和選項',
        general: '常規設置',
        security: '安全設置',
        email: '郵件設置',
        siteName: '網站名稱',
        adminEmail: '管理員郵箱',
        timezone: '時區',
        language: '默認語言',
        refresh: '刷新',
        export: '導出',
        import: '導入',
        reset: '重置',
        tabs: {
          basic: '基礎設置',
          users: '用戶設置',
          content: '內容設置',
          email: '郵件設置',
          security: '安全設置',
          theme: '主題設置'
        },
        basic: {
          title: '基礎設置',
          siteName: '站點名稱',
          siteNamePlaceholder: '請輸入站點名稱',
          siteNameDescription: '網站的名稱',
          siteDescription: '站點描述',
          siteDescriptionPlaceholder: '請輸入站點描述',
          siteDescriptionDescription: '網站的描述信息',
          siteLogo: '站點標志',
          uploadLogo: '上傳標志',
          logoDescription: '網站的標志圖片',
          siteFavicon: '站點圖標',
          uploadFavicon: '上傳圖標',
          faviconDescription: '瀏覽器標簽頁顯示的圖標'
        },
        user: {
          title: '用戶設置',
          allowRegistration: '允許註冊',
          allowRegistrationDescription: '是否允許新用戶註冊',
          requireEmailVerification: '需要郵箱驗證',
          requireEmailVerificationDescription: '新用戶註冊時是否需要驗證郵箱',
          defaultRole: '默認角色',
          defaultRoleDescription: '新用戶註冊時的默認角色',
          maxPostsPerDay: '每日最大發帖數',
          maxPostsPerDayDescription: '用戶每天最多可以發布的帖子數量',
          maxFileSize: '最大文件大小',
          maxFileSizeDescription: '用戶上傳文件的最大大小限制',
          roles: {
            user: '普通用戶'
          }
        },
        content: {
          title: '內容設置',
          enableModeration: '啟用內容審核',
          enableModerationDescription: '是否對新發布的內容進行審核',
          autoApprove: '自動批准',
          autoApproveDescription: '是否自動批准新發布的內容',
          interactionFeatures: '互動功能',
          enableComments: '啟用評論',
          enableCommentsDescription: '是否允許用戶評論',
          enableLikes: '啟用點讚',
          enableLikesDescription: '是否允許用戶點讚',
          enableShares: '啟用分享',
          enableSharesDescription: '是否允許用戶分享內容'
        }
      }
    }
  },
  
  en: {
    admin: {
      title: 'Admin Console',
      console: 'Console',
      logout: 'Logout',
      backToFrontend: 'Back to Frontend',
      
      login: {
        title: 'Admin Login',
        subtitle: 'Please login with admin account',
        email: 'Email',
        emailPlaceholder: 'Enter admin email',
        password: 'Password',
        passwordPlaceholder: 'Enter password',
        login: 'Login',
        backToHome: 'Back to Home'
      },
      
      dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome',
        totalUsers: 'Total Users',
        newToday: 'New Today',
        totalPosts: 'Total Posts',
        pending: 'Pending',
        totalActivities: 'Total Activities',
        active: 'Active',
        totalViews: 'Total Views',
        thisWeek: 'This Week',
        quickActions: 'Quick Actions',
        recentActivities: 'Recent Activities',
        interactionStats: 'Interaction Stats',
        totalLikes: 'Total Likes',
        totalComments: 'Total Comments',
        interactionRate: 'Interaction Rate',
        contentReview: 'Content Review',
        contentReviewDesc: 'Review pending content',
        userManagement: 'User Management',
        userManagementDesc: 'Manage user permissions',
        activityManagement: 'Activity Management',
        activityManagementDesc: 'Manage platform activities',
        systemSettings: 'System Settings',
        systemSettingsDesc: 'Configure system parameters',
        viewAllActivities: 'View All Activities'
      },

      usersManagement: {
        title: 'User Management',
        description: 'Manage platform users',
        list: 'User List',
        addUser: 'Add User',
        loading: 'Loading...',
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
      },

      content: {
        title: 'Content Management',
        description: 'Manage all platform content',
        posts: 'Post Management',
        comments: 'Comment Management',
        status: 'Status',
        published: 'Published',
        pending: 'Pending',
        rejected: 'Rejected',
        approve: 'Approve',
        reject: 'Reject',
        searchContent: 'Search Content',
        searchPlaceholder: 'Search posts, comments...',
        filterByStatus: 'Filter by Status',
        allStatus: 'All Status',
        noContent: 'No Content',
        noContentDesc: 'No content available yet',
        tabs: {
          content: 'Content',
          categories: 'Categories'
        },
        table: {
          content: 'Content',
          author: 'Author',
          status: 'Status',
          stats: 'Stats',
          date: 'Date',
          actions: 'Actions'
        }
      },

      activities: {
        title: 'Activity Management',
        description: 'Manage platform activities',
        list: 'Activity List',
        create: 'Create Activity',
        edit: 'Edit Activity',
        status: 'Status',
        upcoming: 'Upcoming',
        ongoing: 'Ongoing',
        completed: 'Completed',
        participants: 'Participants',
        totalActivities: 'Total Activities',
        activeActivities: 'Active Activities',
        completedActivities: 'Completed Activities',
        totalParticipants: 'Total Participants',
        noActivities: 'No Activities',
        tabs: {
          activities: 'Activities',
          categories: 'Categories'
        },
        table: {
          title: 'Title',
          organizer: 'Organizer',
          status: 'Status',
          participants: 'Participants',
          time: 'Time',
          actions: 'Actions'
        },
        filter: {
          allStatus: 'All Status',
          allCategories: 'All Categories'
        },
        search: {
          placeholder: 'Search activities...'
        },
        actions: {
          create: 'Create Activity'
        }
      },

      settings: {
        title: 'System Settings',
        description: 'Configure system parameters and options',
        general: 'General Settings',
        security: 'Security Settings',
        email: 'Email Settings',
        siteName: 'Site Name',
        adminEmail: 'Admin Email',
        timezone: 'Timezone',
        language: 'Default Language',
        refresh: 'Refresh',
        export: 'Export',
        import: 'Import',
        reset: 'Reset',
        tabs: {
          basic: 'Basic Settings',
          users: 'User Settings',
          content: 'Content Settings',
          email: 'Email Settings',
          security: 'Security Settings',
          theme: 'Theme Settings'
        },
        basic: {
          title: 'Basic Settings',
          siteName: 'Site Name',
          siteNamePlaceholder: 'Enter site name',
          siteNameDescription: 'Name of the website',
          siteDescription: 'Site Description',
          siteDescriptionPlaceholder: 'Enter site description',
          siteDescriptionDescription: 'Description of the website',
          siteLogo: 'Site Logo',
          uploadLogo: 'Upload Logo',
          logoDescription: 'Logo image of the website',
          siteFavicon: 'Site Favicon',
          uploadFavicon: 'Upload Favicon',
          faviconDescription: 'Icon displayed in browser tab'
        },
        user: {
          title: 'User Settings',
          allowRegistration: 'Allow Registration',
          allowRegistrationDescription: 'Whether to allow new user registration',
          requireEmailVerification: 'Require Email Verification',
          requireEmailVerificationDescription: 'Whether new users need to verify email',
          defaultRole: 'Default Role',
          defaultRoleDescription: 'Default role for new users',
          maxPostsPerDay: 'Max Posts Per Day',
          maxPostsPerDayDescription: 'Maximum number of posts per user per day',
          maxFileSize: 'Max File Size',
          maxFileSizeDescription: 'Maximum file size for user uploads',
          roles: {
            user: 'User'
          }
        },
        content: {
          title: 'Content Settings',
          enableModeration: 'Enable Moderation',
          enableModerationDescription: 'Whether to moderate new content',
          autoApprove: 'Auto Approve',
          autoApproveDescription: 'Whether to auto-approve new content',
          interactionFeatures: 'Interaction Features',
          enableComments: 'Enable Comments',
          enableCommentsDescription: 'Whether to allow comments',
          enableLikes: 'Enable Likes',
          enableLikesDescription: 'Whether to allow likes',
          enableShares: 'Enable Shares',
          enableSharesDescription: 'Whether to allow content sharing'
        }
      }
    }
  },
  
  vi: {
    admin: {
      title: 'Bảng quản trị',
      console: 'Bảng điều khiển',
      logout: 'Đăng xuất',
      backToFrontend: 'Trở về giao diện',
      
      login: {
        title: 'Đăng nhập quản trị',
        subtitle: 'Vui lòng đăng nhập bằng tài khoản quản trị',
        email: 'Email',
        emailPlaceholder: 'Nhập email quản trị',
        password: 'Mật khẩu',
        passwordPlaceholder: 'Nhập mật khẩu',
        login: 'Đăng nhập',
        backToHome: 'Về trang chủ'
      },
      
      dashboard: {
        title: 'Bảng điều khiển',
        welcome: 'Chào mừng',
        totalUsers: 'Tổng số người dùng',
        newToday: 'Mới hôm nay',
        totalPosts: 'Tổng số bài viết',
        pending: 'Chờ duyệt',
        totalActivities: 'Tổng số hoạt động',
        active: 'Đang hoạt động',
        totalViews: 'Tổng lượt xem',
        thisWeek: 'Tuần này',
        quickActions: 'Thao tác nhanh',
        recentActivities: 'Hoạt động gần đây',
        interactionStats: 'Thống kê tương tác',
        totalLikes: 'Tổng lượt thích',
        totalComments: 'Tổng bình luận',
        interactionRate: 'Tỷ lệ tương tác',
        contentReview: 'Duyệt nội dung',
        contentReviewDesc: 'Duyệt nội dung chờ xử lý',
        userManagement: 'Quản lý người dùng',
        userManagementDesc: 'Quản lý quyền người dùng',
        activityManagement: 'Quản lý hoạt động',
        activityManagementDesc: 'Quản lý hoạt động nền tảng',
        systemSettings: 'Cài đặt hệ thống',
        systemSettingsDesc: 'Cấu hình tham số hệ thống',
        viewAllActivities: 'Xem tất cả hoạt động'
      },

      usersManagement: {
        title: 'Quản lý người dùng',
        description: 'Quản lý người dùng nền tảng',
        list: 'Danh sách người dùng',
        addUser: 'Thêm người dùng',
        loading: 'Đang tải...',
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
      },

      content: {
        title: 'Quản lý nội dung',
        description: 'Quản lý tất cả nội dung nền tảng',
        posts: 'Quản lý bài viết',
        comments: 'Quản lý bình luận',
        status: 'Trạng thái',
        published: 'Đã xuất bản',
        pending: 'Chờ duyệt',
        rejected: 'Bị từ chối',
        approve: 'Duyệt',
        reject: 'Từ chối',
        searchContent: 'Tìm kiếm nội dung',
        searchPlaceholder: 'Tìm bài viết, bình luận...',
        filterByStatus: 'Lọc theo trạng thái',
        allStatus: 'Tất cả trạng thái',
        noContent: 'Không có nội dung',
        noContentDesc: 'Chưa có nội dung nào',
        tabs: {
          content: 'Nội dung',
          categories: 'Danh mục'
        },
        table: {
          content: 'Nội dung',
          author: 'Tác giả',
          status: 'Trạng thái',
          stats: 'Thống kê',
          date: 'Ngày',
          actions: 'Thao tác'
        }
      },

      activities: {
        title: 'Quản lý hoạt động',
        description: 'Quản lý hoạt động nền tảng',
        list: 'Danh sách hoạt động',
        create: 'Tạo hoạt động',
        edit: 'Chỉnh sửa hoạt động',
        status: 'Trạng thái',
        upcoming: 'Sắp diễn ra',
        ongoing: 'Đang diễn ra',
        completed: 'Hoàn thành',
        participants: 'Người tham gia',
        totalActivities: 'Tổng số hoạt động',
        activeActivities: 'Hoạt động đang diễn ra',
        completedActivities: 'Hoạt động đã hoàn thành',
        totalParticipants: 'Tổng số người tham gia',
        noActivities: 'Không có hoạt động',
        tabs: {
          activities: 'Hoạt động',
          categories: 'Danh mục'
        },
        table: {
          title: 'Tiêu đề',
          organizer: 'Người tổ chức',
          status: 'Trạng thái',
          participants: 'Người tham gia',
          time: 'Thời gian',
          actions: 'Thao tác'
        },
        filter: {
          allStatus: 'Tất cả trạng thái',
          allCategories: 'Tất cả danh mục'
        },
        search: {
          placeholder: 'Tìm hoạt động...'
        },
        actions: {
          create: 'Tạo hoạt động'
        }
      },

      settings: {
        title: 'Cài đặt hệ thống',
        description: 'Cấu hình tham số và tùy chọn hệ thống',
        general: 'Cài đặt chung',
        security: 'Cài đặt bảo mật',
        email: 'Cài đặt email',
        siteName: 'Tên trang web',
        adminEmail: 'Email quản trị',
        timezone: 'Múi giờ',
        language: 'Ngôn ngữ mặc định',
        refresh: 'Làm mới',
        export: 'Xuất',
        import: 'Nhập',
        reset: 'Đặt lại',
        tabs: {
          basic: 'Cài đặt cơ bản',
          users: 'Cài đặt người dùng',
          content: 'Cài đặt nội dung',
          email: 'Cài đặt email',
          security: 'Cài đặt bảo mật',
          theme: 'Cài đặt giao diện'
        },
        basic: {
          title: 'Cài đặt cơ bản',
          siteName: 'Tên trang web',
          siteNamePlaceholder: 'Nhập tên trang web',
          siteNameDescription: 'Tên của trang web',
          siteDescription: 'Mô tả trang web',
          siteDescriptionPlaceholder: 'Nhập mô tả trang web',
          siteDescriptionDescription: 'Thông tin mô tả về trang web',
          siteLogo: 'Logo trang web',
          uploadLogo: 'Tải lên logo',
          logoDescription: 'Hình ảnh logo của trang web',
          siteFavicon: 'Favicon trang web',
          uploadFavicon: 'Tải lên favicon',
          faviconDescription: 'Biểu tượng hiển thị trên tab trình duyệt'
        },
        user: {
          title: 'Cài đặt người dùng',
          allowRegistration: 'Cho phép đăng ký',
          allowRegistrationDescription: 'Có cho phép người dùng mới đăng ký không',
          requireEmailVerification: 'Yêu cầu xác minh email',
          requireEmailVerificationDescription: 'Người dùng mới có cần xác minh email không',
          defaultRole: 'Vai trò mặc định',
          defaultRoleDescription: 'Vai trò mặc định cho người dùng mới',
          maxPostsPerDay: 'Số bài viết tối đa mỗi ngày',
          maxPostsPerDayDescription: 'Số lượng bài viết tối đa mỗi người dùng có thể đăng mỗi ngày',
          maxFileSize: 'Kích thước file tối đa',
          maxFileSizeDescription: 'Kích thước file tối đa cho việc tải lên',
          roles: {
            user: 'Người dùng'
          }
        },
        content: {
          title: 'Cài đặt nội dung',
          enableModeration: 'Bật kiểm duyệt',
          enableModerationDescription: 'Có kiểm duyệt nội dung mới không',
          autoApprove: 'Tự động duyệt',
          autoApproveDescription: 'Có tự động duyệt nội dung mới không',
          interactionFeatures: 'Tính năng tương tác',
          enableComments: 'Bật bình luận',
          enableCommentsDescription: 'Có cho phép bình luận không',
          enableLikes: 'Bật thích',
          enableLikesDescription: 'Có cho phép thích không',
          enableShares: 'Bật chia sẻ',
          enableSharesDescription: 'Có cho phép chia sẻ nội dung không'
        }
      }
    }
  }
}

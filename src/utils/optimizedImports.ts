/**
 * 依赖优化配置
 * 用于优化第三方库的导入和打包
 */

// Lucide React 图标按需导入优化
export const optimizedLucideImports = {
  // 常用图标预加载
  common: [
    'User', 'Mail', 'Lock', 'Eye', 'EyeOff', 'Search', 'Plus', 'X', 'Check',
    'Calendar', 'MapPin', 'Users', 'Heart', 'MessageCircle', 'Share2'
  ],
  // 管理员相关图标
  admin: [
    'Shield', 'Settings', 'Trash2', 'Edit2', 'Save', 'Upload', 'Download',
    'Filter', 'RefreshCw', 'ChevronLeft', 'ChevronRight'
  ],
  // 内容相关图标
  content: [
    'FileText', 'Image', 'Video', 'Tag', 'Folder', 'Star', 'Flag',
    'Bookmark', 'Copy', 'Send'
  ]
};

// Date-fns locale 优化配置
export const optimizedDateFnsLocales = {
  'zh-CN': () => import('date-fns/locale/zh-CN'),
  'en-US': () => import('date-fns/locale/en-US'),
  'vi': () => import('date-fns/locale/vi')
};

// Supabase 客户端优化配置
export const supabaseOptimizedConfig = {
  // 只导入需要的功能
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  // 优化实时订阅
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
};

// 代码分割优化配置
export const chunkOptimization = {
  // 第三方库分组
  vendor: {
    react: ['react', 'react-dom'],
    supabase: ['@supabase/supabase-js'],
    utils: ['date-fns', 'lucide-react'],
    router: ['react-router-dom']
  },
  // 页面级别分组
  pages: {
    admin: /src\/pages\/admin/,
    profile: /src\/pages\/profile/,
    public: /src\/pages\/(Home|About|Activities)/
  }
};

// 预加载策略配置
export const preloadStrategy = {
  // 关键资源预加载
  critical: [
    '/api/categories/content',
    '/api/posts?limit=10',
    '/api/activities?limit=5'
  ],
  // 用户交互预加载
  onHover: [
    '/api/posts/',
    '/api/activities/',
    '/api/users/profile/'
  ],
  // 路由预加载
  routes: {
    '/admin': () => import('../pages/admin/AdminDashboard'),
    '/profile': () => import('../pages/profile/Profile'),
    '/activities': () => import('../pages/Activities')
  }
};
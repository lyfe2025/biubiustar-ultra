import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-dev-locator', { 
            sourceRoot: __dirname 
          }],
        ],
      },
    }),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }), 
    tsconfigPaths(),
    // 构建分析工具
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap'
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          // 代理错误处理
          proxy.on('error', (err) => {
            console.error('代理错误:', err);
          });
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('代理请求:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('代理响应:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          // 代理错误处理
          proxy.on('error', (err) => {
            console.error('上传文件代理错误:', err);
          });
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('上传文件代理请求:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('上传文件代理响应:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  build: {
    // 启用代码分割
    rollupOptions: {
      output: {
        // 优化的代码分割策略
        manualChunks: (id) => {
          // 第三方库分组 - 更细粒度的分割
          if (id.includes('node_modules')) {
            // React 核心库
            if (id.includes('react/') && !id.includes('react-dom') && !id.includes('react-router')) {
              return 'vendor-react-core';
            }
            
            // React DOM
            if (id.includes('react-dom')) {
              return 'vendor-react-dom';
            }
            
            // 路由相关
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            
            // Supabase 相关
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            
            // 日期处理库
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }
            
            // 图标库 - 单独分组
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            
            // 状态管理
            if (id.includes('zustand') || id.includes('redux')) {
              return 'vendor-state';
            }
            
            // 工具库
            if (id.includes('lodash') || id.includes('ramda') || id.includes('clsx') || id.includes('classnames')) {
              return 'vendor-utils';
            }
            
            // 其他第三方库
            return 'vendor-misc';
          }
          
          // 应用代码分组 - 按功能模块细分
          if (id.includes('src/')) {
            // 管理员模块细分 - 按子功能分割
            if (id.includes('src/pages/admin') || id.includes('src/components/admin')) {
              // 管理员用户管理
              if (id.includes('admin/users') || id.includes('AdminUsers') || id.includes('UserManagement')) {
                return 'app-admin-users';
              }
              
              // 管理员内容管理
              if (id.includes('admin/content') || id.includes('AdminContent') || id.includes('ContentManagement')) {
                return 'app-admin-content';
              }
              
              // 管理员设置
              if (id.includes('admin/settings') || id.includes('AdminSettings') || id.includes('SystemSettings')) {
                return 'app-admin-settings';
              }
              
              // 管理员性能监控
              if (id.includes('AdminSystemPerformance') || id.includes('AdminCachePerformance') || id.includes('CacheConfigManager')) {
                return 'app-admin-performance';
              }
              
              // 管理员核心功能（仪表板、登录等）
              if (id.includes('AdminDashboard') || id.includes('AdminLogin') || id.includes('AdminLogs') || id.includes('AdminSecurity')) {
                return 'app-admin-core';
              }
              
              // 其他管理员功能
              return 'app-admin-misc';
            }
            
            // 用户相关 - 进一步细分
            if (id.includes('src/pages/profile') || id.includes('src/components/profile')) {
              // 用户设置和管理
              if (id.includes('ProfileSettings') || id.includes('UserProfileManagement') || id.includes('NotificationsList')) {
                return 'app-profile-settings';
              }
              
              // 用户活动和内容
              if (id.includes('UserActivitiesList') || id.includes('UserPostsList') || id.includes('UserStatsPanel')) {
                return 'app-profile-content';
              }
              
              // 用户基础信息
              return 'app-profile-core';
            }
            
            // 活动相关
            if (id.includes('src/pages/Activities') || id.includes('src/pages/ActivityDetail') || id.includes('src/components/activities')) {
              return 'app-activities';
            }
            
            // 帖子相关
            if (id.includes('src/pages/posts') || id.includes('src/components/posts') || id.includes('PostDetail')) {
              return 'app-posts';
            }
            
            // 认证相关
            if (id.includes('src/components/auth') || id.includes('src/contexts/auth')) {
              return 'app-auth';
            }
            
            // 共享组件
            if (id.includes('src/components/ui') || id.includes('src/components/common')) {
              return 'app-ui';
            }
            
            // 工具和服务
            if (id.includes('src/utils') || id.includes('src/services') || id.includes('src/hooks')) {
              return 'app-utils';
            }
            
            // 上下文和状态
            if (id.includes('src/contexts') || id.includes('src/stores')) {
              return 'app-state';
            }
          }
        },
        
        // 优化文件命名
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (assetInfo.name && /\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          if (assetInfo.name && /\.(css)$/i.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          }
          if (assetInfo.name && /\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    // 启用 Terser 压缩 - 优化配置
    minify: 'terser',
    terserOptions: {
      compress: {
        // 生产环境移除 console 和 debugger
        drop_console: true,
        drop_debugger: true,
        // 移除未使用的代码
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        // 移除未使用的变量
        unused: true,
        // 移除死代码
        dead_code: true,
        // 优化条件表达式
        conditionals: true,
        // 优化比较操作
        comparisons: true,
        // 优化求值
        evaluate: true,
        // 优化布尔值
        booleans: true,
        // 优化循环
        loops: true,
        // 移除重复代码
        hoist_funs: false, // 改为 false，避免潜在的作用域问题
        // 内联函数 - 使用更保守的设置
        inline: 1, // 从 2 改为 1，只内联简单函数
        // 优化对象属性访问
        properties: true,
        // 合并变量声明
        join_vars: true,
        // 优化序列表达式
        sequences: true,
        // 添加 ECMAScript 版本支持
        ecma: 2020
      },
      mangle: {
        // 保留类名和函数名以便调试
        keep_classnames: false,
        keep_fnames: false,
        // 混淆属性名 - 更安全的配置
        properties: {
          regex: /^_private/
        },
        // 保留特定标识符
        reserved: ['$', 'exports', 'require', 'global', 'window']
      },
      format: {
        // 移除注释
        comments: false
      }
    },
    // 构建优化选项
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
    cssCodeSplit: true,
    sourcemap: process.env.NODE_ENV === 'development',
    // 设置 chunk 大小警告限制 - 调整到更合理的值
    chunkSizeWarningLimit: 600,
    // 启用实验性功能
    reportCompressedSize: false,
    // 优化资源内联
    assetsInlineLimit: 4096
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      // React 生态系统
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      
      // 状态管理
      'zustand',
      
      // 数据库和API
      '@supabase/supabase-js',
      
      // 日期处理
      'date-fns',
      'date-fns/format',
      'date-fns/formatDistanceToNow',
      'date-fns/locale/zh-CN',
      'date-fns/locale/en-US',
      'date-fns/locale/vi',
      
      // 工具库
      'clsx',
      
      // 常用图标（预加载核心图标）
      'lucide-react/dist/esm/icons/user',
      'lucide-react/dist/esm/icons/calendar',
      'lucide-react/dist/esm/icons/map-pin',
      'lucide-react/dist/esm/icons/users',
      'lucide-react/dist/esm/icons/clock',
      'lucide-react/dist/esm/icons/heart',
      'lucide-react/dist/esm/icons/message-circle',
      'lucide-react/dist/esm/icons/share-2',
      'lucide-react/dist/esm/icons/search',
      'lucide-react/dist/esm/icons/menu',
      'lucide-react/dist/esm/icons/x',
      'lucide-react/dist/esm/icons/plus',
      'lucide-react/dist/esm/icons/edit',
      'lucide-react/dist/esm/icons/trash-2',
      'lucide-react/dist/esm/icons/settings',
      'lucide-react/dist/esm/icons/log-out'
    ],
    exclude: [
      // 排除大型库的某些部分以减少预构建时间
      'lucide-react/dist/esm/icons',
      '@supabase/supabase-js/dist/module/lib/realtime'
    ],
    // 强制预构建
    force: false,
    // 预构建缓存目录
    // 预构建缓存目录（注意：cacheDir 在新版本 Vite 中已被移除）
    // ESBuild 选项
    esbuildOptions: {
      target: 'es2020',
      supported: {
        'top-level-await': true
      }
    }
  },
  
  // 预览服务器配置
  preview: {
    port: 4173,
    strictPort: true,
    host: true
  },
  
  // 环境变量配置
  envPrefix: ['VITE_', 'SUPABASE_'],
  
  // 实验性功能
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/${filename}` }
      } else {
        return { relative: true }
      }
    }
  }
})

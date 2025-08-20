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
            // React 生态系统
            if (id.includes('react') && !id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('react-dom')) {
              return 'vendor-react-dom';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            
            // UI 和图标库
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            
            // 日期和国际化
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }
            
            // 数据库和API
            if (id.includes('@supabase') || id.includes('supabase')) {
              return 'vendor-supabase';
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
          
          // 应用代码分组 - 按功能模块分割
          if (id.includes('src/')) {
            // 管理员相关
            if (id.includes('src/pages/admin') || id.includes('src/components/admin')) {
              return 'app-admin';
            }
            
            // 用户相关
            if (id.includes('src/pages/profile') || id.includes('src/components/profile')) {
              return 'app-profile';
            }
            
            // 活动相关
            if (id.includes('src/pages/activities') || id.includes('src/components/activities')) {
              return 'app-activities';
            }
            
            // 帖子相关
            if (id.includes('src/pages/posts') || id.includes('src/components/posts')) {
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
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/\.(css)$/i.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    // 启用 Terser 压缩 - 增强配置
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
        hoist_funs: true,
        // 内联函数
        inline: 2,
        // 优化对象属性访问
        properties: true,
        // 移除空语句
        drop_empty: true,
        // 合并变量声明
        join_vars: true,
        // 优化序列表达式
        sequences: true
      },
      mangle: {
        // 保留类名（可选，根据需要调整）
        keep_classnames: false,
        keep_fnames: false,
        // 混淆属性名
        properties: {
          regex: /^_/
        },
        // 保留特定标识符
        reserved: ['$', 'exports', 'require']
      },
      format: {
        // 移除注释
        comments: false,
        // 保留许可证注释
        preserve_annotations: false
      }
    },
    // 构建优化选项
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
    cssCodeSplit: true,
    sourcemap: process.env.NODE_ENV === 'development',
    // 设置 chunk 大小警告限制
    chunkSizeWarningLimit: 800,
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
    cacheDir: 'node_modules/.vite',
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

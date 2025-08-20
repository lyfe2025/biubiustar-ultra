import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

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
        manualChunks: {
          // 核心框架库
          vendor: ['react', 'react-dom'],
          // 路由相关
          router: ['react-router-dom'],
          // UI 组件库
          ui: ['lucide-react', 'clsx'],
          // 状态管理
          store: ['zustand'],
          // 国际化
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          // Supabase 相关
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    // 启用 Terser 压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        // 生产环境移除 console 和 debugger
        drop_console: true,
        drop_debugger: true,
        // 移除未使用的代码
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        // 保留类名（可选，根据需要调整）
        keep_classnames: false,
        keep_fnames: false
      }
    },
    // 构建优化选项
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    // 设置 chunk 大小警告限制
    chunkSizeWarningLimit: 1000
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      '@supabase/supabase-js'
    ]
  }
})

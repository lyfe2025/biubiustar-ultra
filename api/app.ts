import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
// Supabase imports removed - not used in main app file
import authRoutes from './routes/auth.js';
import postsRoutes from './routes/posts/index.js';
import usersRoutes from './routes/users/index.js';
import commentsRoutes from './routes/comments/index.js';
import adminRoutes from './routes/admin/index.js';
import activitiesRoutes from './routes/activities.js';
import categoriesRoutes from './routes/categories/index.js';
import followsRoutes from './routes/follows.js';
import contactRoutes from './routes/contact.js';
import settingsRoutes from './routes/settings.js';
import avatarRoutes from './routes/avatar.js';
import batchRoutes from './routes/batch.js';
import healthRoutes from './routes/health.js';
import cacheDebugRoutes from './routes/cache-debug.js';
import cacheTestRoutes from './routes/cache-test.js';
import cacheManagementRoutes from './routes/cache-management.js';
import { createCacheMonitorMiddleware } from './middleware/cacheMonitor.js';

// 条件导入morgan日志中间件
let morgan: any = null;
if (process.env.NODE_ENV === 'development') {
  try {
    morgan = (await import('morgan')).default;
  } catch (error) {
    console.warn('Morgan not available in development mode');
  }
}

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建 Express 应用
const app = express();

// 1. 静态文件服务 - 最高优先级
const staticPath = path.join(__dirname, '../public');
app.use('/uploads', express.static(path.join(staticPath, 'uploads')));
app.use(express.static(path.join(__dirname, '../dist')));

// 2. 开发环境日志中间件
if (process.env.NODE_ENV === 'development' && morgan) {
  app.use(morgan('dev'));
}

// 3. 优化的CORS配置
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://biubiustar-ultra.vercel.app',
    /^https:\/\/.*\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  // 预检请求缓存24小时
  maxAge: 86400
}));

// 4. 基础解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 5. 缓存监控中间件
app.use(createCacheMonitorMiddleware());

// 5. 内存监控中间件（仅开发环境）
if (process.env.NODE_ENV === 'development') {
  // 每5分钟输出一次内存使用情况
  setInterval(() => {
    const memUsage = process.memoryUsage();
    console.log('Memory Usage:', {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
    });
  }, 5 * 60 * 1000);
}

// Health check routes
app.use('/api/health', healthRoutes);

// 缓存调试路由（仅开发环境）
if (process.env.NODE_ENV === 'development') {
  app.use('/api/cache-debug', cacheDebugRoutes);
  app.use('/api/cache-test', cacheTestRoutes);
}

// 缓存管理API路由
app.use('/api/cache-management', cacheManagementRoutes);

// ===== ROUTE MODULES =====
// Use separated route modules
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);

// 认证路由已移至 routes/auth.js

// 帖子路由已移至 routes/posts.js

// Comments API routes
app.use('/api/comments', commentsRoutes);

app.use('/api/activities', activitiesRoutes);

app.use('/api/categories', categoriesRoutes);

// Users API routes
app.use('/api/users', usersRoutes);

app.use('/api/follows', followsRoutes);

app.use('/api/settings', settingsRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/contact', contactRoutes);

app.use('/api/avatar', avatarRoutes);

app.use('/api/batch', batchRoutes);

// API 路由不存在的处理
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// SPA 路由处理
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 错误处理中间件 - 必须放在最后
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  
  // 开发环境显示详细错误信息
  if (process.env.NODE_ENV === 'development') {
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message,
      stack: err.stack
    });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;
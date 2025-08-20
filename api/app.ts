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

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建 Express 应用
const app = express();

// CORS 配置
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://biubiustar-ultra.vercel.app',
    /^https:\/\/.*\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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

// 静态文件服务
const staticPath = path.join(__dirname, '../public');
app.use('/uploads', express.static(path.join(staticPath, 'uploads')));
app.use(express.static(path.join(__dirname, '../dist')));

// API 路由不存在的处理
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// SPA 路由处理
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
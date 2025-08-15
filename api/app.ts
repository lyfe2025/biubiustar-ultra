/**
 * This is a API server
 */

import express, { type Request, type Response, type NextFunction }  from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contact.js';
import commentsRoutes from './routes/comments.js';
import activitiesRoutes from './routes/activities.js';
import postsRoutes from './routes/posts.js';
import usersRoutes from './routes/users.js';
import followsRoutes from './routes/follows.js';
import adminRoutes from './routes/admin.js';
import settingsRoutes from './routes/settings.js';
import { startSecurityCleanupScheduler } from './middleware/security.js';

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load env
dotenv.config();

// 创建 Express 应用
const app = express();

// 信任代理
app.set('trust proxy', true);

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
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/follows', followsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// 静态文件服务
const staticPath = path.join(__dirname, '../public');
app.use('/uploads', express.static(path.join(staticPath, 'uploads')));

// API 路由不存在的处理
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// 前端应用
const frontendPath = path.join(__dirname, '../dist');
app.use(express.static(frontendPath));

// 错误处理中间件
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// SPA 路由回退
app.use('*', (req: Request, res: Response) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 启动安全清理调度器
if (process.env.NODE_ENV !== 'test') {
  startSecurityCleanupScheduler();
}

export default app;
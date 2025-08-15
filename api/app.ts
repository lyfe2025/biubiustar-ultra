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


const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务 - 提供uploads文件夹的图片访问
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/follows', followsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

/**
 * health
 */
app.use('/api/health', (req: Request, res: Response, next: NextFunction): void => {
  res.status(200).json({
    success: true,
    message: 'ok'
  });
});

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error'
  });
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found'
  });
});

// 启动安全数据清理调度器
let cleanupScheduler: NodeJS.Timeout | null = null;

try {
  cleanupScheduler = startSecurityCleanupScheduler();
  console.log('Security cleanup scheduler started successfully');
} catch (error) {
  console.error('Failed to start security cleanup scheduler:', error);
}

// 优雅关闭处理
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  if (cleanupScheduler) {
    clearInterval(cleanupScheduler);
    console.log('Security cleanup scheduler stopped');
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  if (cleanupScheduler) {
    clearInterval(cleanupScheduler);
    console.log('Security cleanup scheduler stopped');
  }
  process.exit(0);
});

export default app;
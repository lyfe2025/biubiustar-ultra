/**
 * Simplified API server for Vercel deployment
 */

import express, { type Request, type Response } from 'express';
import cors from 'cors';

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

// 健康检查端点
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 临时API路由 - 返回维护状态
app.use('/api/auth', (req: Request, res: Response) => {
  res.status(503).json({ error: 'Service temporarily unavailable - under maintenance' });
});

app.use('/api/posts', (req: Request, res: Response) => {
  res.status(503).json({ error: 'Service temporarily unavailable - under maintenance' });
});

app.use('/api/users', (req: Request, res: Response) => {
  res.status(503).json({ error: 'Service temporarily unavailable - under maintenance' });
});

app.use('/api/admin', (req: Request, res: Response) => {
  res.status(503).json({ error: 'Service temporarily unavailable - under maintenance' });
});

app.use('/api/comments', (req: Request, res: Response) => {
  res.status(503).json({ error: 'Service temporarily unavailable - under maintenance' });
});

app.use('/api/activities', (req: Request, res: Response) => {
  res.status(503).json({ error: 'Service temporarily unavailable - under maintenance' });
});

app.use('/api/follows', (req: Request, res: Response) => {
  res.status(503).json({ error: 'Service temporarily unavailable - under maintenance' });
});

app.use('/api/contact', (req: Request, res: Response) => {
  res.status(503).json({ error: 'Service temporarily unavailable - under maintenance' });
});

app.use('/api/settings', (req: Request, res: Response) => {
  res.status(503).json({ error: 'Service temporarily unavailable - under maintenance' });
});

// API 路由不存在的处理
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// 错误处理中间件
app.use((err: Error, req: Request, res: Response) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
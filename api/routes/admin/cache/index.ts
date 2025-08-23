import { Router } from 'express';
import healthRoutes from './health.js';

const router = Router();

// 缓存健康监控路由
router.use('/health', healthRoutes);

export default router;
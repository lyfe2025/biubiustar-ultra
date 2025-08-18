import { Router } from 'express';
import coreRoutes from './core';
import emailRoutes from './email';
import publicRoutes from './public';

const router = Router();

// 挂载各个子模块路由
router.use('/', coreRoutes);      // 系统设置核心功能
router.use('/', emailRoutes);     // 邮件测试功能
router.use('/', publicRoutes);    // 公开设置获取功能

export default router;
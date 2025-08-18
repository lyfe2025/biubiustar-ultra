import { Router } from 'express';
import coreRoutes from './core';
import emailRoutes from './email';
import publicRoutes from './public';
import testRoutes from './test';

const router = Router();

// 挂载各个子模块路由
// 注意：测试路由必须在core路由之前，因为core路由有认证中间件
router.use('/', testRoutes);      // 测试功能（调试用）- 无认证
router.use('/', coreRoutes);      // 系统设置核心功能 - 需要认证
router.use('/', emailRoutes);     // 邮件测试功能
router.use('/', publicRoutes);    // 公开设置获取功能

export default router;
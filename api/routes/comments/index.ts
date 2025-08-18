import express from 'express';
import queryRoutes from './query';
import crudRoutes from './crud';

const router = express.Router();

// 评论查询路由
router.use('/', queryRoutes);

// 评论CRUD路由
router.use('/', crudRoutes);

export default router;
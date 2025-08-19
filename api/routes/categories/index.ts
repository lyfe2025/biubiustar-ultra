import { Router } from 'express';
import activityRouter from './activity';
import contentRouter from './content';

const router = Router();

// 活动分类路由
router.use('/activity', activityRouter);

// 内容分类路由
router.use('/content', contentRouter);

export default router;
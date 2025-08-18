import { Router } from 'express';
import activityRouter from './activity';

const router = Router();

// 活动分类路由
router.use('/activity', activityRouter);

export default router;
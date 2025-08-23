import { Router } from 'express';
import configRoutes from './config';
import monitoringRoutes from './monitoring';
import prewarmingRoutes from './prewarming';
import importExportRoutes from './import-export';
import environmentRoutes from './environment';
import eventsRoutes from './events';
import statusRoutes from './status';

const router = Router();

// 注册所有子路由
router.use('/', configRoutes);
router.use('/', monitoringRoutes);
router.use('/', prewarmingRoutes);
router.use('/', importExportRoutes);
router.use('/', environmentRoutes);
router.use('/', eventsRoutes);
router.use('/', statusRoutes);

export default router;

import { Router } from 'express';
import crudRoutes from './crud.js';
import interactionsRoutes from './interactions.js';
import uploadRoutes from './upload.js';

const router = Router();

// Mount CRUD routes
router.use('/', crudRoutes);

// Mount interaction routes
router.use('/', interactionsRoutes);

// Mount upload routes
router.use('/', uploadRoutes);

export default router;
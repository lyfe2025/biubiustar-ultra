import { Router } from 'express';
import crudRoutes from './crud.js';
import interactionsRoutes from './interactions.js';

const router = Router();

// Mount CRUD routes
router.use('/', crudRoutes);

// Mount interaction routes
router.use('/', interactionsRoutes);

export default router;
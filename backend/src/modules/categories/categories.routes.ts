import { Router } from 'express';
import { categoryController } from './categories.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Public route to list active categories
router.get('/', (req, res, next) => categoryController.getActiveCategories(req, res, next));

// Admin routes
router.get('/all', authenticate, authorize([Role.ADMIN]), (req, res, next) =>
  categoryController.getAllCategories(req, res, next)
);

router.post('/', authenticate, authorize([Role.ADMIN]), (req, res, next) =>
  categoryController.createCategory(req, res, next)
);

router.put('/:id', authenticate, authorize([Role.ADMIN]), (req, res, next) =>
  categoryController.updateCategory(req, res, next)
);

router.delete('/:id', authenticate, authorize([Role.ADMIN]), (req, res, next) =>
  categoryController.deleteCategory(req, res, next)
);

export default router;

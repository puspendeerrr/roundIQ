import { Router } from 'express';
import { cmsController } from './cms.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/:slug', (req, res, next) => cmsController.getPageBySlug(req, res, next));

router.get('/', authenticate, authorize([Role.ADMIN]), (req, res, next) =>
  cmsController.getAllPages(req, res, next)
);

router.post('/', authenticate, authorize([Role.ADMIN]), (req, res, next) =>
  cmsController.createOrUpdatePage(req, res, next)
);

export default router;

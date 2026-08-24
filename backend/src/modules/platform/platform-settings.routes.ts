import { Router } from 'express';
import { platformSettingsController } from './platform-settings.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', (req, res, next) => platformSettingsController.getSettings(req, res, next));

router.patch('/admin', authenticate, authorize([Role.ADMIN]), (req, res, next) =>
  platformSettingsController.updateSettings(req, res, next)
);

export default router;

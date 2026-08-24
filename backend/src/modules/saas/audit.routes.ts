import { Router } from 'express';
import { auditController } from './audit.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(authorize([Role.ADMIN]));

router.get('/', (req, res, next) => auditController.getAuditLogs(req, res, next));

export default router;

import { Router } from 'express';
import { businessReportsController } from './business-reports.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(authorize([Role.ADMIN]));

router.get('/business', (req, res, next) => businessReportsController.getExecutiveReport(req, res, next));

export default router;

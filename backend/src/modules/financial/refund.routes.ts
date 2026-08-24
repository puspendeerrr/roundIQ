import { Router } from 'express';
import { refundController } from './refund.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post('/', (req, res, next) => refundController.processRefund(req, res, next));
router.get('/me', (req, res, next) => refundController.getMyRefunds(req, res, next));

export default router;

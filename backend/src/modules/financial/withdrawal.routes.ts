import { Router } from 'express';
import { withdrawalController } from './withdrawal.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Interviewer Payout Routes
router.post('/', authorize([Role.INTERVIEWER]), (req, res, next) =>
  withdrawalController.requestWithdrawal(req, res, next)
);

router.get('/me', authorize([Role.INTERVIEWER]), (req, res, next) =>
  withdrawalController.getMyWithdrawals(req, res, next)
);

router.get('/:id', authorize([Role.INTERVIEWER]), (req, res, next) =>
  withdrawalController.getWithdrawalById(req, res, next)
);

export default router;

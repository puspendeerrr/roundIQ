import { Router } from 'express';
import { paymentsController } from './payments.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Public Webhook callback endpoint (verified via HMAC-SHA256 signature)
router.post('/webhook', (req, res, next) => paymentsController.handleWebhook(req, res, next));

// Authenticated Student Routes
router.post('/create-order', authenticate, authorize([Role.STUDENT]), (req, res, next) =>
  paymentsController.createPaymentOrder(req, res, next)
);

router.post('/verify', authenticate, authorize([Role.STUDENT]), (req, res, next) =>
  paymentsController.verifyPayment(req, res, next)
);

router.get('/my-payments', authenticate, authorize([Role.STUDENT]), (req, res, next) =>
  paymentsController.getMyPayments(req, res, next)
);

// Admin Payments Monitoring Endpoint
router.get('/admin', authenticate, authorize([Role.ADMIN]), (req, res, next) =>
  paymentsController.getAdminPayments(req, res, next)
);

export default router;

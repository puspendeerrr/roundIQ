import { Router } from 'express';
import { couponController } from './coupon.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.post('/validate', authenticate, (req, res, next) => couponController.validateCoupon(req, res, next));

router.get('/admin', authenticate, authorize([Role.ADMIN]), (req, res, next) =>
  couponController.getAdminCoupons(req, res, next)
);

router.post('/admin', authenticate, authorize([Role.ADMIN]), (req, res, next) =>
  couponController.createCoupon(req, res, next)
);

export default router;

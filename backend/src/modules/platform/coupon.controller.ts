import { Response, NextFunction } from 'express';
import { couponService } from './coupon.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

export class CouponController {
  async validateCoupon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { code, bookingAmount } = req.body;
      const result = await couponService.validateCoupon(code, Number(bookingAmount));
      return sendSuccess(res, result, 'Coupon validated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async createCoupon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { code, type, discountValue, minBookingValue, maxUses, expiresAt } = req.body;
      const coupon = await couponService.createCoupon(
        code,
        type,
        Number(discountValue),
        minBookingValue ? Number(minBookingValue) : 0,
        maxUses ? Number(maxUses) : 100,
        expiresAt ? new Date(expiresAt) : undefined
      );
      return sendSuccess(res, coupon, 'Coupon code created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async getAdminCoupons(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const coupons = await couponService.getAdminCoupons();
      return sendSuccess(res, coupons, 'Admin discount coupons retrieved');
    } catch (error) {
      return next(error);
    }
  }
}

export const couponController = new CouponController();

import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import { CouponType } from '@prisma/client';

export class CouponService {
  async validateCoupon(code: string, bookingAmount: number) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw new AppError('Invalid or expired coupon code', 400, 'INVALID_COUPON');
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw new AppError('Coupon has expired', 400, 'COUPON_EXPIRED');
    }

    if (coupon.usedCount >= coupon.maxUses) {
      throw new AppError('Coupon usage limit reached', 400, 'COUPON_LIMIT_REACHED');
    }

    if (bookingAmount < coupon.minBookingValue) {
      throw new AppError(`Minimum booking amount for this coupon is ₹${coupon.minBookingValue}`, 400, 'MIN_AMOUNT_NOT_MET');
    }

    let discountAmount = 0;
    if (coupon.type === CouponType.PERCENTAGE) {
      discountAmount = Number(((bookingAmount * coupon.discountValue) / 100).toFixed(2));
    } else {
      discountAmount = Math.min(coupon.discountValue, bookingAmount);
    }

    const finalAmount = Math.max(0, bookingAmount - discountAmount);

    return {
      couponId: coupon.id,
      code: coupon.code,
      discountAmount,
      finalAmount,
    };
  }

  async createCoupon(
    code: string,
    type: CouponType,
    discountValue: number,
    minBookingValue = 0,
    maxUses = 100,
    expiresAt?: Date
  ) {
    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      throw new AppError('Coupon code already exists', 409, 'COUPON_EXISTS');
    }

    return prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        discountValue,
        minBookingValue,
        maxUses,
        expiresAt: expiresAt || null,
      },
    });
  }

  async getAdminCoupons() {
    return prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const couponService = new CouponService();

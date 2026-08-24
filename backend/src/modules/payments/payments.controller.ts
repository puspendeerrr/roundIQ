import { Request, Response, NextFunction } from 'express';
import { paymentsService } from './payments.service';
import { sendSuccess } from '../../utils/api-response';
import { createPaymentOrderSchema, verifyPaymentSignatureSchema } from './payments.validation';
import { AuthRequest } from '../../middleware/auth';
import { PaymentStatus } from '@prisma/client';

export class PaymentsController {
  async createPaymentOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const studentUserId = req.user!.userId;
      const validatedData = createPaymentOrderSchema.parse(req.body);
      const result = await paymentsService.createPaymentOrder(studentUserId, validatedData);
      return sendSuccess(res, result, 'Razorpay payment order created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async verifyPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const studentUserId = req.user!.userId;
      const validatedData = verifyPaymentSignatureSchema.parse(req.body);
      const result = await paymentsService.verifyPayment(studentUserId, validatedData);
      return sendSuccess(res, result, 'Payment signature verified successfully');
    } catch (error) {
      return next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const rawBody = JSON.stringify(req.body);
      const signatureHeader = req.headers['x-razorpay-signature'] as string | undefined;
      const result = await paymentsService.handleWebhook(rawBody, signatureHeader, req.body);
      return sendSuccess(res, result, 'Razorpay webhook processed successfully');
    } catch (error) {
      return next(error);
    }
  }

  async getMyPayments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const studentUserId = req.user!.userId;
      const { page, limit } = req.query;
      const result = await paymentsService.getStudentPayments(
        studentUserId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'Student payments retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  async getAdminPayments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search, status, page, limit } = req.query;
      const result = await paymentsService.getAdminPayments(
        search as string,
        status as PaymentStatus | undefined,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'Admin payments retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }
}

export const paymentsController = new PaymentsController();

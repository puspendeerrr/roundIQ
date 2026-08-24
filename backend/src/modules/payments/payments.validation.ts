import { z } from 'zod';

export const createPaymentOrderSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
});

export const verifyPaymentSignatureSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  razorpayOrderId: z.string().min(1, 'Razorpay Order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay Payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay Signature is required'),
});

export type CreatePaymentOrderDTO = z.infer<typeof createPaymentOrderSchema>;
export type VerifyPaymentSignatureDTO = z.infer<typeof verifyPaymentSignatureSchema>;

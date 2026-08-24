import { z } from 'zod';
import { PayoutMethod, WithdrawalStatus } from '@prisma/client';

export const requestWithdrawalSchema = z.object({
  amount: z.number().min(100, 'Minimum withdrawal amount is ₹100'),
  method: z.nativeEnum(PayoutMethod).default(PayoutMethod.UPI),
  accountDetails: z.object({
    upiId: z.string().optional(),
    accountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    accountHolderName: z.string().optional(),
  }),
});

export const adminProcessWithdrawalSchema = z.object({
  status: z.nativeEnum(WithdrawalStatus),
  adminRemarks: z.string().optional(),
});

export type RequestWithdrawalDTO = z.infer<typeof requestWithdrawalSchema>;
export type AdminProcessWithdrawalDTO = z.infer<typeof adminProcessWithdrawalSchema>;

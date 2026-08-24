import { CancelledBy } from '@prisma/client';

export interface CancellationRefundCalculation {
  cancelledBy: CancelledBy;
  hoursUntilStart: number;
  refundPercentage: number;
  refundAmount: number;
  policyDescription: string;
}

export class CancellationPolicyService {
  calculateRefund(
    cancelledBy: CancelledBy,
    scheduledStart: Date,
    totalPaidAmount: number,
    now: Date = new Date()
  ): CancellationRefundCalculation {
    const timeDiffMs = scheduledStart.getTime() - now.getTime();
    const hoursUntilStart = Math.max(0, timeDiffMs / (1000 * 60 * 60));

    let refundPercentage = 0;
    let policyDescription = '';

    if (cancelledBy === CancelledBy.INTERVIEWER || cancelledBy === CancelledBy.ADMIN) {
      refundPercentage = 100;
      policyDescription = 'Full 100% refund guaranteed when cancelled by interviewer or admin.';
    } else {
      // Student Cancellation Rules
      if (hoursUntilStart >= 48) {
        refundPercentage = 100;
        policyDescription = 'Full 100% refund for cancellations notice greater than 48 hours.';
      } else if (hoursUntilStart >= 24) {
        refundPercentage = 50;
        policyDescription = '50% refund for cancellations notice between 24 and 48 hours.';
      } else {
        refundPercentage = 0;
        policyDescription = 'No refund available for cancellations notice less than 24 hours.';
      }
    }

    const refundAmount = Number((totalPaidAmount * (refundPercentage / 100)).toFixed(2));

    return {
      cancelledBy,
      hoursUntilStart: Number(hoursUntilStart.toFixed(1)),
      refundPercentage,
      refundAmount,
      policyDescription,
    };
  }
}

export const cancellationPolicyService = new CancellationPolicyService();

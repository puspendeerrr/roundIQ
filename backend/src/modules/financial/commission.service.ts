import { financialSettingsService } from './financial-settings.service';

export interface CommissionCalculationResult {
  bookingAmount: number;
  commissionPercentage: number;
  platformCommissionAmount: number;
  interviewerEarningAmount: number;
  gstPercentage: number;
  gstAmount: number;
  totalWithTax: number;
  currency: string;
}

export class CommissionService {
  async calculate(bookingAmount: number): Promise<CommissionCalculationResult> {
    const settings = await financialSettingsService.getSettings();

    const commissionPercentage = settings.commissionPercentage;
    const gstPercentage = settings.gstPercentage;

    const platformCommissionAmount = Number(
      (bookingAmount * (commissionPercentage / 100)).toFixed(2)
    );
    const interviewerEarningAmount = Number(
      (bookingAmount - platformCommissionAmount).toFixed(2)
    );
    const gstAmount = Number((platformCommissionAmount * (gstPercentage / 100)).toFixed(2));
    const totalWithTax = Number((bookingAmount + gstAmount).toFixed(2));

    return {
      bookingAmount,
      commissionPercentage,
      platformCommissionAmount,
      interviewerEarningAmount,
      gstPercentage,
      gstAmount,
      totalWithTax,
      currency: settings.currency,
    };
  }
}

export const commissionService = new CommissionService();

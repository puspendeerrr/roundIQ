import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import { Currency } from '@prisma/client';

export interface UpdatePlatformSettingsDTO {
  commissionPercentage?: number;
  gstPercentage?: number;
  minWithdrawalAmount?: number;
  currency?: Currency;
  autoApproveWithdrawals?: boolean;
  invoicePrefix?: string;
  paymentTimeoutMins?: number;
}

export class FinancialSettingsService {
  async getSettings() {
    let settings = await prisma.platformSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: {
          id: 'default',
          commissionPercentage: 20.0,
          gstPercentage: 18.0,
          minWithdrawalAmount: 500.0,
          currency: Currency.INR,
          autoApproveWithdrawals: false,
          invoicePrefix: 'INV',
          paymentTimeoutMins: 30,
        },
      });
    }

    return settings;
  }

  async updateSettings(adminUserId: string, dto: UpdatePlatformSettingsDTO, ipAddress?: string) {
    if (dto.commissionPercentage !== undefined && (dto.commissionPercentage < 0 || dto.commissionPercentage > 100)) {
      throw new AppError('Commission percentage must be between 0 and 100', 400, 'INVALID_COMMISSION');
    }

    if (dto.gstPercentage !== undefined && (dto.gstPercentage < 0 || dto.gstPercentage > 100)) {
      throw new AppError('GST percentage must be between 0 and 100', 400, 'INVALID_GST');
    }

    const currentSettings = await this.getSettings();

    const updatedSettings = await prisma.platformSettings.update({
      where: { id: 'default' },
      data: {
        ...(dto.commissionPercentage !== undefined && { commissionPercentage: dto.commissionPercentage }),
        ...(dto.gstPercentage !== undefined && { gstPercentage: dto.gstPercentage }),
        ...(dto.minWithdrawalAmount !== undefined && { minWithdrawalAmount: dto.minWithdrawalAmount }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.autoApproveWithdrawals !== undefined && { autoApproveWithdrawals: dto.autoApproveWithdrawals }),
        ...(dto.invoicePrefix !== undefined && { invoicePrefix: dto.invoicePrefix }),
        ...(dto.paymentTimeoutMins !== undefined && { paymentTimeoutMins: dto.paymentTimeoutMins }),
      },
    });

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: adminUserId,
        action: 'FINANCIAL_SETTINGS_UPDATED',
        entity: 'PlatformSettings',
        entityId: 'default',
        details: {
          oldSettings: currentSettings,
          newSettings: updatedSettings,
        },
        ipAddress: ipAddress || null,
      },
    });

    return updatedSettings;
  }
}

export const financialSettingsService = new FinancialSettingsService();

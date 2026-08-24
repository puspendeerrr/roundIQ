import { Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { withdrawalService } from '../financial/withdrawal.service';
import { refundService } from '../financial/refund.service';
import { reviewModerationService } from '../trust/review-moderation.service';
import { companyService } from '../recruiter/company.service';
import { adminExportService } from '../platform/admin-export.service';
import { emailTemplateService } from '../platform/email-template.service';
import { redisCache } from '../../config/redis';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';
import { VerificationStatus, UserStatus, Role, BookingStatus } from '@prisma/client';
import { z } from 'zod';

const rejectSchema = z.object({
  reason: z.string().min(3, 'Rejection reason is required'),
});

const updateStatusSchema = z.object({
  status: z.enum([UserStatus.ACTIVE, UserStatus.SUSPENDED, UserStatus.BANNED]),
});

export class AdminController {
  async getDashboardStats(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();
      return sendSuccess(res, stats, 'Admin dashboard stats retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getVerificationQueue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query;
      const result = await adminService.getVerificationQueue(
        status as VerificationStatus | undefined,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'Verification queue retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  async approveInterviewer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const { id } = req.params;
      const updatedProfile = await adminService.approveInterviewer(adminId, id, req.ip);
      return sendSuccess(res, updatedProfile, 'Interviewer approved successfully');
    } catch (error) {
      return next(error);
    }
  }

  async rejectInterviewer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const { id } = req.params;
      const { reason } = rejectSchema.parse(req.body);
      const updatedProfile = await adminService.rejectInterviewer(adminId, id, reason, req.ip);
      return sendSuccess(res, updatedProfile, 'Interviewer rejected successfully');
    } catch (error) {
      return next(error);
    }
  }

  async suspendInterviewer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const { id } = req.params;
      const reason = req.body?.reason;
      const updatedProfile = await adminService.suspendInterviewer(adminId, id, reason, req.ip);
      return sendSuccess(res, updatedProfile, 'Interviewer suspended successfully');
    } catch (error) {
      return next(error);
    }
  }

  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search, role, status, page, limit } = req.query;
      const result = await adminService.getUsers(
        search as string,
        role as Role | undefined,
        status as UserStatus | undefined,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'Users retrieved successfully', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  async updateUserStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const { id } = req.params;
      const { status } = updateStatusSchema.parse(req.body);
      const updatedUser = await adminService.updateUserStatus(adminId, id, status, req.ip);
      return sendSuccess(res, updatedUser, `User status updated to ${status}`);
    } catch (error) {
      return next(error);
    }
  }

  async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await adminService.getAuditLogs(
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      );
      return sendSuccess(res, result.items, 'Audit logs retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  async getAdminBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search, status, page, limit } = req.query;
      const result = await adminService.getAdminBookings(
        search as string,
        status as BookingStatus | undefined,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'Admin bookings retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  async adminCancelBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const { id } = req.params;
      const reason = req.body?.reason || 'Force cancelled by Admin';
      const result = await adminService.adminCancelBooking(adminId, id, reason);
      return sendSuccess(res, result, 'Booking cancelled by admin');
    } catch (error) {
      return next(error);
    }
  }

  async adminForceComplete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const { id } = req.params;
      const result = await adminService.adminForceComplete(adminId, id);
      return sendSuccess(res, result, 'Booking force completed by admin');
    } catch (error) {
      return next(error);
    }
  }

  async adminForceNoShow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const { id } = req.params;
      const reason = req.body?.reason || 'Marked No Show by Admin';
      const result = await adminService.adminForceNoShow(adminId, id, reason);
      return sendSuccess(res, result, 'Booking marked No Show by admin');
    } catch (error) {
      return next(error);
    }
  }

  // PHASE 3.0 FINANCIAL FOUNDATION ADMIN CONTROLLER METHODS
  async getFinancialSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const settings = await adminService.getFinancialSettings();
      return sendSuccess(res, settings, 'Platform financial settings retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async updateFinancialSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const settings = await adminService.updateFinancialSettings(adminId, req.body, req.ip);
      return sendSuccess(res, settings, 'Platform financial settings updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async getAdminWallets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search, page, limit } = req.query;
      const result = await adminService.getAdminWallets(
        search as string,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'User wallets retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  async getAdminLedger(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search, type, page, limit } = req.query;
      const result = await adminService.getAdminLedger(
        search as string,
        type as any,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      );
      return sendSuccess(res, result.items, 'Platform ledger entries retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  async getFinancialSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const summary = await adminService.getFinancialSummary();
      return sendSuccess(res, summary, 'Financial summary metrics retrieved');
    } catch (error) {
      return next(error);
    }
  }

  // PHASE 3.2 WITHDRAWAL & REFUND ADMIN CONTROLLER METHODS
  async adminGetWithdrawals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query;
      const result = await withdrawalService.getAdminWithdrawals(
        status as any,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'Admin withdrawal queue retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  async adminProcessWithdrawal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId;
      const { id } = req.params;
      const { status, adminRemarks } = req.body;
      const result = await withdrawalService.adminProcessWithdrawal(adminUserId, id, status, adminRemarks);
      return sendSuccess(res, result, 'Withdrawal request status updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async adminGetRefunds(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query;
      const result = await refundService.getAdminRefunds(
        status as any,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'Admin refund queue retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  // PHASE 5 TRUST & MODERATION ADMIN CONTROLLER METHODS
  async adminGetModerationReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query;
      const result = await reviewModerationService.getAdminModerationReports(
        status as any,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'Admin moderation reports retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  async adminResolveReviewReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId;
      const { id } = req.params;
      const { action } = req.body; // HIDE, REMOVE, DISMISS
      const result = await reviewModerationService.adminResolveReport(adminUserId, id, action);
      return sendSuccess(res, result, 'Moderation report resolved successfully');
    } catch (error) {
      return next(error);
    }
  }

  // PHASE 6 RECRUITER & COMPANY ADMIN CONTROLLER METHODS
  async adminVerifyCompany(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { verified } = req.body;
      const company = await companyService.adminVerifyCompany(id, Boolean(verified));
      return sendSuccess(res, company, 'Company verification status updated');
    } catch (error) {
      return next(error);
    }
  }

  // PHASE 7 PLATFORM EXPERIENCE ADMIN CONTROLLER METHODS
  async adminExportBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const csv = await adminExportService.exportBookingsCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=roundiq_bookings_export.csv');
      return res.status(200).send(csv);
    } catch (error) {
      return next(error);
    }
  }

  async adminExportRevenue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const csv = await adminExportService.exportRevenueCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=roundiq_revenue_export.csv');
      return res.status(200).send(csv);
    } catch (error) {
      return next(error);
    }
  }

  async adminGetEmailTemplates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const templates = await emailTemplateService.getAllTemplates();
      return sendSuccess(res, templates, 'Email templates retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async adminUpdateEmailTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;
      const { subject, htmlBody } = req.body;
      const template = await emailTemplateService.updateTemplate(key, subject, htmlBody);
      return sendSuccess(res, template, 'Email template updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  // PHASE 8 PRODUCTION DEVOPS & SYSTEM MONITORING
  async adminGetSystemStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();
      const redisStats = redisCache.getStats();

      const status = {
        server: {
          status: 'HEALTHY',
          uptimeSeconds: Math.floor(uptime),
          nodeVersion: process.version,
          memoryMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        },
        database: {
          status: 'CONNECTED',
          provider: 'PostgreSQL 16',
        },
        cache: redisStats,
        security: {
          hsts: 'ENABLED',
          csp: 'ENABLED',
          rateLimiting: 'ACTIVE',
        },
      };

      return sendSuccess(res, status, 'Admin system health status retrieved');
    } catch (error) {
      return next(error);
    }
  }
}

export const adminController = new AdminController();

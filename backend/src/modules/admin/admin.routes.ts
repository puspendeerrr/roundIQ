import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Require Admin role for all routes
router.use(authenticate, authorize([Role.ADMIN]));

router.get('/stats', (req, res, next) => adminController.getDashboardStats(req, res, next));
router.get('/verifications', (req, res, next) => adminController.getVerificationQueue(req, res, next));
router.post('/verifications/:id/approve', (req, res, next) => adminController.approveInterviewer(req, res, next));
router.post('/verifications/:id/reject', (req, res, next) => adminController.rejectInterviewer(req, res, next));
router.post('/verifications/:id/suspend', (req, res, next) => adminController.suspendInterviewer(req, res, next));

router.get('/users', (req, res, next) => adminController.getUsers(req, res, next));
router.patch('/users/:id/status', (req, res, next) => adminController.updateUserStatus(req, res, next));

router.get('/audit-logs', (req, res, next) => adminController.getAuditLogs(req, res, next));

router.get('/bookings', (req, res, next) => adminController.getAdminBookings(req, res, next));
router.post('/bookings/:id/cancel', (req, res, next) => adminController.adminCancelBooking(req, res, next));
router.post('/bookings/:id/force-complete', (req, res, next) => adminController.adminForceComplete(req, res, next));
router.post('/bookings/:id/force-noshow', (req, res, next) => adminController.adminForceNoShow(req, res, next));

// Phase 3.0 Financial Foundation Admin Routes
router.get('/financial-settings', (req, res, next) => adminController.getFinancialSettings(req, res, next));
router.put('/financial-settings', (req, res, next) => adminController.updateFinancialSettings(req, res, next));
router.get('/wallets', (req, res, next) => adminController.getAdminWallets(req, res, next));
router.get('/ledger', (req, res, next) => adminController.getAdminLedger(req, res, next));
router.get('/financial-summary', (req, res, next) => adminController.getFinancialSummary(req, res, next));

// Phase 3.2 Withdrawal & Refund Admin Routes
router.get('/withdrawals', (req, res, next) => adminController.adminGetWithdrawals(req, res, next));
router.patch('/withdrawals/:id', (req, res, next) => adminController.adminProcessWithdrawal(req, res, next));
router.get('/refunds', (req, res, next) => adminController.adminGetRefunds(req, res, next));

// Phase 5 Trust & Moderation Admin Routes
router.get('/moderation', (req, res, next) => adminController.adminGetModerationReports(req, res, next));
router.patch('/moderation/:id', (req, res, next) => adminController.adminResolveReviewReport(req, res, next));

// Phase 6 Recruiter & Company Admin Routes
router.patch('/companies/:id/verify', (req, res, next) => adminController.adminVerifyCompany(req, res, next));

// Phase 7 Platform Experience Admin Routes
router.get('/export/bookings', (req, res, next) => adminController.adminExportBookings(req, res, next));
router.get('/export/revenue', (req, res, next) => adminController.adminExportRevenue(req, res, next));
router.get('/email-templates', (req, res, next) => adminController.adminGetEmailTemplates(req, res, next));
// Phase 8 Production DevOps Admin Routes
router.get('/system', (req, res, next) => adminController.adminGetSystemStatus(req, res, next));

export default router;

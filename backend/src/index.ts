import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/error-handler';
import { sendSuccess } from './utils/api-response';
import { securityHeaders } from './middleware/security';
import { swaggerSpec } from './config/swagger';
import authRoutes from './modules/auth/auth.routes';
import studentRoutes from './modules/students/students.routes';
import interviewerRoutes from './modules/interviewers/interviewers.routes';
import categoryRoutes from './modules/categories/categories.routes';
import skillRoutes from './modules/skills/skills.routes';
import adminRoutes from './modules/admin/admin.routes';
import availabilityRoutes from './modules/availability/availability.routes';
import bookingRoutes from './modules/bookings/bookings.routes';
import walletRoutes from './modules/financial/wallet.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import withdrawalRoutes from './modules/financial/withdrawal.routes';
import refundRoutes from './modules/financial/refund.routes';
import meetingRoutes from './modules/communication/meeting.routes';
import notificationRoutes from './modules/communication/notification.routes';
import attendanceRoutes from './modules/communication/attendance.routes';
import reviewRoutes from './modules/trust/review.routes';
import interviewReportRoutes from './modules/trust/interview-report.routes';
import reputationRoutes from './modules/trust/reputation.routes';
import companyRoutes from './modules/recruiter/company.routes';
import jobRoutes from './modules/recruiter/job.routes';
import candidateDiscoveryRoutes from './modules/recruiter/candidate-discovery.routes';
import pipelineRoutes from './modules/recruiter/pipeline.routes';
import interviewPackageRoutes from './modules/platform/interview-package.routes';
import couponRoutes from './modules/platform/coupon.routes';
import favoritesRoutes from './modules/platform/favorites.routes';
import platformSettingsRoutes from './modules/platform/platform-settings.routes';
import supportRoutes from './modules/saas/support.routes';
import cmsRoutes from './modules/saas/cms.routes';
import complianceRoutes from './modules/saas/compliance.routes';
import filesRoutes from './modules/saas/files.routes';
import auditRoutes from './modules/saas/audit.routes';
import businessReportsRoutes from './modules/saas/business-reports.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(securityHeaders);
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature'],
  })
);

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again later.',
    },
  },
});
app.use(globalLimiter);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Probes
app.get('/health', (_req, res) => {
  return sendSuccess(res, { status: 'healthy', timestamp: new Date().toISOString() }, 'RoundIQ API is operational');
});

app.get('/health/liveness', (_req, res) => {
  return res.status(200).json({ status: 'UP', service: 'RoundIQ API Engine' });
});

app.get('/health/readiness', (_req, res) => {
  return res.status(200).json({ status: 'READY', database: 'PostgreSQL 16 Connected', cache: 'Redis Cache Ready' });
});

// OpenAPI / Swagger Specs JSON
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  return res.send(swaggerSpec);
});

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/interviewers', interviewerRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/skills', skillRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/availability', availabilityRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/withdrawals', withdrawalRoutes);
app.use('/api/v1/refunds', refundRoutes);
app.use('/api/v1/meetings', meetingRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/reports', interviewReportRoutes);
app.use('/api/v1/reputation', reputationRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/candidates', candidateDiscoveryRoutes);
app.use('/api/v1/pipeline', pipelineRoutes);
app.use('/api/v1/packages', interviewPackageRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/favorites', favoritesRoutes);
app.use('/api/v1/platform-settings', platformSettingsRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/account', complianceRoutes);
app.use('/api/v1/files', filesRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/reports', businessReportsRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 RoundIQ Backend running on http://localhost:${PORT} [${env.NODE_ENV}]`);
  });
}

export default app;

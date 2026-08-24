import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import { ReportStatus, ReviewStatus } from '@prisma/client';

export class ReviewModerationService {
  async reportReview(reporterId: string, reviewId: string, reason: string) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
    }

    const report = await prisma.reviewReport.create({
      data: {
        reviewId,
        reporterId,
        reason,
        status: ReportStatus.OPEN,
      },
    });

    await prisma.review.update({
      where: { id: reviewId },
      data: { status: ReviewStatus.FLAGGED },
    });

    return report;
  }

  async adminResolveReport(adminUserId: string, reportId: string, action: 'HIDE' | 'REMOVE' | 'DISMISS') {
    const report = await prisma.reviewReport.findUnique({
      where: { id: reportId },
      include: { review: true },
    });

    if (!report) {
      throw new AppError('Moderation report not found', 404, 'REPORT_NOT_FOUND');
    }

    let reviewStatus: ReviewStatus = ReviewStatus.PUBLISHED;
    if (action === 'HIDE') reviewStatus = ReviewStatus.HIDDEN;
    if (action === 'REMOVE') reviewStatus = ReviewStatus.REMOVED;

    await prisma.review.update({
      where: { id: report.reviewId },
      data: { status: reviewStatus },
    });

    const updatedReport = await prisma.reviewReport.update({
      where: { id: reportId },
      data: { status: ReportStatus.RESOLVED },
    });

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: adminUserId,
        action: `REVIEW_MODERATION_${action}`,
        entity: 'ReviewReport',
        entityId: reportId,
        details: {
          reviewId: report.reviewId,
          action,
        },
      },
    });

    return updatedReport;
  }

  async getAdminModerationReports(status?: ReportStatus, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.reviewReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          review: {
            include: {
              reviewer: { select: { id: true, email: true } },
              reviewee: { select: { id: true, email: true } },
            },
          },
          reporter: { select: { id: true, email: true } },
        },
      }),
      prisma.reviewReport.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}

export const reviewModerationService = new ReviewModerationService();

import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import { reputationEngine } from './reputation.engine';
import { BookingStatus, ReviewVisibility, ReviewStatus } from '@prisma/client';

export interface CreateReviewParams {
  reviewerId: string;
  bookingId: string;
  rating: number;
  title: string;
  review: string;
  wouldRecommend?: boolean;
  tags?: string[];
  visibility?: ReviewVisibility;
}

export class ReviewService {
  async createReview(params: CreateReviewParams) {
    if (params.rating < 1 || params.rating > 5) {
      throw new AppError('Rating must be between 1 and 5 stars', 400, 'INVALID_RATING');
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.bookingId },
      include: { interviewer: true },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new AppError('Only COMPLETED interviews may be reviewed', 400, 'BOOKING_NOT_COMPLETED');
    }

    // Identify reviewee
    const isStudent = booking.studentId === params.reviewerId;
    const isInterviewer = booking.interviewer.userId === params.reviewerId;

    if (!isStudent && !isInterviewer) {
      throw new AppError('Unauthorized to review this booking session', 403, 'FORBIDDEN');
    }

    const revieweeId = isStudent ? booking.interviewer.userId : booking.studentId;

    if (params.reviewerId === revieweeId) {
      throw new AppError('Cannot review yourself', 400, 'SELF_REVIEW_FORBIDDEN');
    }

    // Check if review already submitted
    const existingReview = await prisma.review.findUnique({
      where: { bookingId: params.bookingId },
    });

    if (existingReview) {
      throw new AppError('A review has already been submitted for this session', 400, 'DUPLICATE_REVIEW');
    }

    const reviewRecord = await prisma.review.create({
      data: {
        bookingId: booking.id,
        reviewerId: params.reviewerId,
        revieweeId,
        rating: params.rating,
        title: params.title,
        review: params.review,
        wouldRecommend: params.wouldRecommend ?? true,
        tags: params.tags || [],
        visibility: params.visibility || ReviewVisibility.PUBLIC,
        status: ReviewStatus.PUBLISHED,
      },
    });

    // Recalculate reviewee reputation
    await reputationEngine.recalculateReputation(revieweeId);

    // Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: params.reviewerId,
        action: 'REVIEW_SUBMITTED',
        entity: 'Review',
        entityId: reviewRecord.id,
        details: {
          bookingId: booking.id,
          rating: params.rating,
          revieweeId,
        },
      },
    });

    return reviewRecord;
  }

  async getInterviewerReviews(interviewerUserId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where: { revieweeId: interviewerUserId, status: ReviewStatus.PUBLISHED },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: {
            select: {
              id: true,
              email: true,
              studentProfile: { select: { fullName: true } },
            },
          },
        },
      }),
      prisma.review.count({ where: { revieweeId: interviewerUserId, status: ReviewStatus.PUBLISHED } }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getReviewByBookingId(bookingId: string) {
    return prisma.review.findUnique({
      where: { bookingId },
      include: {
        reviewer: { select: { id: true, email: true } },
        reviewee: { select: { id: true, email: true } },
      },
    });
  }
}

export const reviewService = new ReviewService();

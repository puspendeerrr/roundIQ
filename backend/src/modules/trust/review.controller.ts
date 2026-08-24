import { Response, NextFunction } from 'express';
import { reviewService } from './review.service';
import { reviewModerationService } from './review-moderation.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

export class ReviewController {
  async createReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reviewerId = req.user!.userId;
      const { bookingId, rating, title, review, wouldRecommend, tags, visibility } = req.body;
      const result = await reviewService.createReview({
        reviewerId,
        bookingId,
        rating: Number(rating),
        title,
        review,
        wouldRecommend,
        tags,
        visibility,
      });
      return sendSuccess(res, result, 'Review submitted successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async getInterviewerReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { page, limit } = req.query;
      const result = await reviewService.getInterviewerReviews(
        id,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'Interviewer reviews retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  async getReviewByBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const review = await reviewService.getReviewByBookingId(bookingId);
      return sendSuccess(res, review, 'Booking review retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async reportReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reporterId = req.user!.userId;
      const { id } = req.params;
      const { reason } = req.body;
      const report = await reviewModerationService.reportReview(reporterId, id, reason);
      return sendSuccess(res, report, 'Review reported for moderation review', 201);
    } catch (error) {
      return next(error);
    }
  }
}

export const reviewController = new ReviewController();

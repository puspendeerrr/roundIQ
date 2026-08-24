import { Router } from 'express';
import { reviewController } from './review.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/interviewer/:id', (req, res, next) => reviewController.getInterviewerReviews(req, res, next));
router.get('/booking/:bookingId', (req, res, next) => reviewController.getReviewByBooking(req, res, next));

router.post('/', authenticate, (req, res, next) => reviewController.createReview(req, res, next));
router.post('/:id/report', authenticate, (req, res, next) => reviewController.reportReview(req, res, next));

export default router;

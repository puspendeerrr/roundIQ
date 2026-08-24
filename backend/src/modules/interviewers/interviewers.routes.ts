import { Router } from 'express';
import { interviewerController } from './interviewers.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Public routes (no auth required)
router.get('/directory', (req, res, next) => interviewerController.searchDirectory(req, res, next));
router.get('/profile/:id', (req, res, next) => interviewerController.getPublicProfileById(req, res, next));

// Authenticated interviewer routes
router.get('/me/profile', authenticate, authorize([Role.INTERVIEWER, Role.ADMIN]), (req, res, next) =>
  interviewerController.getProfile(req, res, next)
);

router.put('/me/profile', authenticate, authorize([Role.INTERVIEWER, Role.ADMIN]), (req, res, next) =>
  interviewerController.updateProfile(req, res, next)
);

router.post('/me/apply', authenticate, authorize([Role.INTERVIEWER]), (req, res, next) =>
  interviewerController.applyForVerification(req, res, next)
);

export default router;

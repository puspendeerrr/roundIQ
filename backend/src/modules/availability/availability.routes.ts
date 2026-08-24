import { Router } from 'express';
import { availabilityController } from './availability.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Public route to get open slots for a specific interviewer and date
router.get('/interviewers/:id/slots', (req, res, next) =>
  availabilityController.getPublicAvailableSlots(req, res, next)
);

// Authenticated interviewer routes
router.get('/me', authenticate, authorize([Role.INTERVIEWER, Role.ADMIN]), (req, res, next) =>
  availabilityController.getMyAvailability(req, res, next)
);

router.put('/me', authenticate, authorize([Role.INTERVIEWER, Role.ADMIN]), (req, res, next) =>
  availabilityController.setWeeklyRules(req, res, next)
);

router.post('/exceptions', authenticate, authorize([Role.INTERVIEWER, Role.ADMIN]), (req, res, next) =>
  availabilityController.addException(req, res, next)
);

router.delete('/exceptions/:id', authenticate, authorize([Role.INTERVIEWER, Role.ADMIN]), (req, res, next) =>
  availabilityController.deleteException(req, res, next)
);

export default router;

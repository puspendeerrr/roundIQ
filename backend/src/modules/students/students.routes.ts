import { Router } from 'express';
import { studentController } from './students.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/me/profile', authenticate, authorize([Role.STUDENT, Role.ADMIN]), (req, res, next) =>
  studentController.getProfile(req, res, next)
);

router.put('/me/profile', authenticate, authorize([Role.STUDENT, Role.ADMIN]), (req, res, next) =>
  studentController.updateProfile(req, res, next)
);

export default router;

import { Router } from 'express';
import { interviewPackageController } from './interview-package.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/interviewer/:interviewerId', (req, res, next) =>
  interviewPackageController.getInterviewerPackages(req, res, next)
);

router.post('/', authenticate, authorize([Role.INTERVIEWER, Role.ADMIN]), (req, res, next) =>
  interviewPackageController.createPackage(req, res, next)
);

export default router;

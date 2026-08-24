import { Router } from 'express';
import { jobController } from './job.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/public', (req, res, next) => jobController.getPublicJobs(req, res, next));

router.use(authenticate);

router.post('/', authorize([Role.RECRUITER, Role.ADMIN]), (req, res, next) =>
  jobController.createJob(req, res, next)
);

router.get('/my-jobs', authorize([Role.RECRUITER, Role.ADMIN]), (req, res, next) =>
  jobController.getMyJobs(req, res, next)
);

router.patch('/:id/status', authorize([Role.RECRUITER, Role.ADMIN]), (req, res, next) =>
  jobController.updateJobStatus(req, res, next)
);

export default router;

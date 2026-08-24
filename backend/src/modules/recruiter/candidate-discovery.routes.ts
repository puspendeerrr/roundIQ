import { Router } from 'express';
import { candidateDiscoveryController } from './candidate-discovery.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(authorize([Role.RECRUITER, Role.ADMIN]));

router.get('/discovery', (req, res, next) =>
  candidateDiscoveryController.discoverCandidates(req, res, next)
);

export default router;

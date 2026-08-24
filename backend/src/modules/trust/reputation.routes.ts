import { Router } from 'express';
import { reputationController } from './reputation.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/user/:userId', (req, res, next) => reputationController.getPublicReputation(req, res, next));
router.get('/me', authenticate, (req, res, next) => reputationController.getMyReputation(req, res, next));

export default router;

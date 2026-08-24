import { Router } from 'express';
import { complianceController } from './compliance.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/export-data', (req, res, next) => complianceController.exportUserData(req, res, next));
router.delete('/me', (req, res, next) => complianceController.deleteAccount(req, res, next));
router.get('/login-history', (req, res, next) => complianceController.getLoginHistory(req, res, next));

export default router;

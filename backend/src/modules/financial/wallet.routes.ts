import { Router } from 'express';
import { walletController } from './wallet.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// All wallet endpoints require user authentication
router.use(authenticate);

router.get('/me', (req, res, next) => walletController.getMyWallet(req, res, next));
router.get('/transactions', (req, res, next) => walletController.getMyTransactions(req, res, next));
router.get('/summary', (req, res, next) => walletController.getMySummary(req, res, next));

export default router;

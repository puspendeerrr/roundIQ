import { Router } from 'express';
import { filesController } from './files.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/record', (req, res, next) => filesController.recordFileUpload(req, res, next));
router.get('/me', (req, res, next) => filesController.getMyFiles(req, res, next));

export default router;

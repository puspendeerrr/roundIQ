import { Router } from 'express';
import { pipelineController } from './pipeline.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(authorize([Role.RECRUITER, Role.ADMIN]));

router.post('/', (req, res, next) => pipelineController.addToPipeline(req, res, next));
router.patch('/:id/stage', (req, res, next) => pipelineController.updateStage(req, res, next));
router.get('/job/:jobId', (req, res, next) => pipelineController.getJobPipeline(req, res, next));

export default router;

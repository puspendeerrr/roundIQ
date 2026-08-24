import { Router } from 'express';
import { skillController } from './skills.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Public route to list active skills
router.get('/', (req, res, next) => skillController.getActiveSkills(req, res, next));

// Admin routes
router.get('/all', authenticate, authorize([Role.ADMIN]), (req, res, next) =>
  skillController.getAllSkills(req, res, next)
);

router.post('/', authenticate, authorize([Role.ADMIN]), (req, res, next) =>
  skillController.createSkill(req, res, next)
);

router.put('/:id', authenticate, authorize([Role.ADMIN]), (req, res, next) =>
  skillController.updateSkill(req, res, next)
);

router.delete('/:id', authenticate, authorize([Role.ADMIN]), (req, res, next) =>
  skillController.deleteSkill(req, res, next)
);

export default router;

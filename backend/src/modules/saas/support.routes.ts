import { Router } from 'express';
import { supportController } from './support.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post('/', (req, res, next) => supportController.createTicket(req, res, next));
router.get('/me', (req, res, next) => supportController.getMyTickets(req, res, next));
router.post('/:id/message', (req, res, next) => supportController.addTicketMessage(req, res, next));

// Admin Ticket Desk
router.get('/admin', authorize([Role.ADMIN]), (req, res, next) =>
  supportController.getAdminTickets(req, res, next)
);

router.patch('/admin/:id', authorize([Role.ADMIN]), (req, res, next) =>
  supportController.updateTicketStatus(req, res, next)
);

export default router;

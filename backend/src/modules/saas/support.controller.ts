import { Response, NextFunction } from 'express';
import { supportService } from './support.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

export class SupportController {
  async createTicket(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { category, priority, subject, message } = req.body;
      const ticket = await supportService.createTicket({
        userId,
        category,
        priority,
        subject,
        message,
      });
      return sendSuccess(res, ticket, 'Support ticket created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async addTicketMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const senderId = req.user!.userId;
      const { id } = req.params;
      const { message, isInternalNote } = req.body;
      const msg = await supportService.addTicketMessage(id, senderId, message, Boolean(isInternalNote));
      return sendSuccess(res, msg, 'Ticket message added successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async getMyTickets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const tickets = await supportService.getUserTickets(userId);
      return sendSuccess(res, tickets, 'User support tickets retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getAdminTickets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query;
      const result = await supportService.getAdminTickets(
        status as any,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'Admin support tickets retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  async updateTicketStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, assignedToId } = req.body;
      const ticket = await supportService.updateTicketStatus(id, status, assignedToId);
      return sendSuccess(res, ticket, 'Ticket status updated');
    } catch (error) {
      return next(error);
    }
  }
}

export const supportController = new SupportController();

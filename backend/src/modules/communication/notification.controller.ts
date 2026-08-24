import { Response, NextFunction } from 'express';
import { notificationService } from './notification.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

export class NotificationController {
  async getMyNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { page, limit } = req.query;
      const result = await notificationService.getUserNotifications(
        userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'User notifications retrieved', 200, {
        ...result.meta,
        unreadCount: result.unreadCount,
      });
    } catch (error) {
      return next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const notification = await notificationService.markAsRead(userId, id);
      return sendSuccess(res, notification, 'Notification marked as read');
    } catch (error) {
      return next(error);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await notificationService.markAllAsRead(userId);
      return sendSuccess(res, result, 'All notifications marked as read');
    } catch (error) {
      return next(error);
    }
  }
}

export const notificationController = new NotificationController();

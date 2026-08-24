import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import { Prisma } from '@prisma/client';

export interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  body: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  async createNotification(params: CreateNotificationParams) {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body,
        metadata: params.metadata || Prisma.JsonNull,
      },
    });

    return notification;
  }

  async getUserNotifications(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      items,
      unreadCount,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { success: true };
  }
}

export const notificationService = new NotificationService();

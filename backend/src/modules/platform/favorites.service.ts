import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';

export class FavoritesService {
  async toggleFavorite(userId: string, interviewerId: string) {
    const existing = await prisma.interviewerFavorite.findUnique({
      where: {
        userId_interviewerId: { userId, interviewerId },
      },
    });

    if (existing) {
      await prisma.interviewerFavorite.delete({ where: { id: existing.id } });
      return { isFavorited: false };
    } else {
      await prisma.interviewerFavorite.create({
        data: { userId, interviewerId },
      });
      return { isFavorited: true };
    }
  }

  async getUserFavorites(userId: string) {
    const favorites = await prisma.interviewerFavorite.findMany({
      where: { userId },
      include: {
        interviewer: {
          include: {
            user: { select: { id: true, email: true, avatarUrl: true } },
            categories: { include: { category: true } },
            skills: { include: { skill: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((f) => f.interviewer);
  }
}

export const favoritesService = new FavoritesService();

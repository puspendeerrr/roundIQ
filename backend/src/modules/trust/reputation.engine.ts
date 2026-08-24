import { prisma } from '../../utils/prisma';
import { achievementEngine } from './achievement.engine';
import { BookingStatus } from '@prisma/client';

export class ReputationEngine {
  async recalculateReputation(userId: string) {
    // 1. Calculate Review Ratings
    const reviewStats = await prisma.review.aggregate({
      where: { revieweeId: userId, status: 'PUBLISHED' },
      _avg: { rating: true },
      _count: { id: true },
    });

    const averageRating = Number((reviewStats._avg.rating || 5.0).toFixed(2));
    const totalReviews = reviewStats._count.id || 0;

    // 2. Calculate Booking Stats
    const [completedInterviews, cancelledInterviews, totalBookings] = await Promise.all([
      prisma.booking.count({
        where: {
          OR: [{ studentId: userId }, { interviewer: { userId } }],
          status: BookingStatus.COMPLETED,
        },
      }),
      prisma.booking.count({
        where: {
          OR: [{ studentId: userId }, { interviewer: { userId } }],
          status: BookingStatus.CANCELLED,
        },
      }),
      prisma.booking.count({
        where: {
          OR: [{ studentId: userId }, { interviewer: { userId } }],
        },
      }),
    ]);

    const completionRate =
      totalBookings > 0
        ? Number(((completedInterviews / totalBookings) * 100).toFixed(1))
        : 100.0;

    // 3. Compute Overall Reputation Score (0 to 100)
    // Rating weight: 60%, Completion Rate weight: 40%
    const ratingComponent = (averageRating / 5.0) * 60;
    const completionComponent = (completionRate / 100.0) * 40;
    const reputationScore = Number((ratingComponent + completionComponent).toFixed(1));

    // 4. Update Reputation Table
    const reputation = await prisma.reputation.upsert({
      where: { userId },
      update: {
        averageRating,
        totalReviews,
        completedInterviews,
        cancelledInterviews,
        completionRate,
        reputationScore,
      },
      create: {
        userId,
        averageRating,
        totalReviews,
        completedInterviews,
        cancelledInterviews,
        completionRate,
        reputationScore,
      },
    });

    // 5. Trigger Achievement evaluation
    await achievementEngine.evaluateAchievements(userId);

    return reputation;
  }
}

export const reputationEngine = new ReputationEngine();

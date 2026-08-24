import { prisma } from '../../utils/prisma';
import { notificationService } from '../communication/notification.service';

export class AchievementEngine {
  async evaluateAchievements(userId: string) {
    const reputation = await prisma.reputation.findUnique({ where: { userId } });
    if (!reputation) return;

    const allBadges = await prisma.achievement.findMany();
    const existingBadges = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });

    const earnedIds = new Set(existingBadges.map((b) => b.achievementId));

    for (const badge of allBadges) {
      if (earnedIds.has(badge.id)) continue;

      let isEligible = false;

      switch (badge.criteria) {
        case 'AVG_RATING_4_8':
          if (reputation.averageRating >= 4.8 && reputation.totalReviews >= 3) isEligible = true;
          break;
        case 'COMPLETED_50':
          if (reputation.completedInterviews >= 50) isEligible = true;
          break;
        case 'COMPLETED_100':
          if (reputation.completedInterviews >= 100) isEligible = true;
          break;
        case 'ZERO_CANCELLATION':
          if (reputation.cancelledInterviews === 0 && reputation.completedInterviews >= 5) isEligible = true;
          break;
        default:
          break;
      }

      if (isEligible) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: badge.id,
          },
        });

        // Notify user of unlocked badge
        await notificationService.createNotification({
          userId,
          type: 'ACHIEVEMENT_UNLOCKED',
          title: `🏆 Badge Unlocked: ${badge.badgeName}!`,
          body: `Congratulations! You unlocked the "${badge.badgeName}" achievement badge on RoundIQ.`,
          metadata: { badgeName: badge.badgeName, level: badge.level },
        });
      }
    }
  }
}

export const achievementEngine = new AchievementEngine();

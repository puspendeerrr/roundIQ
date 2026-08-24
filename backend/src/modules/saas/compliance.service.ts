import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';

export class ComplianceService {
  async exportUserData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        interviewerProfile: true,
        recruiterProfile: true,
        wallet: { include: { transactions: true } },
        reputation: true,
        studentBookings: true,
        givenReviews: true,
        receivedReviews: true,
        loginHistories: true,
      },
    });

    if (!user) {
      throw new AppError('User account not found', 404, 'USER_NOT_FOUND');
    }

    return {
      exportTimestamp: new Date().toISOString(),
      userProfile: {
        id: user.id,
        email: user.email,
        role: user.role,
        timezone: user.timezone,
        createdAt: user.createdAt,
      },
      studentProfile: user.studentProfile,
      interviewerProfile: user.interviewerProfile,
      recruiterProfile: user.recruiterProfile,
      wallet: user.wallet,
      reputation: user.reputation,
      bookings: user.studentBookings,
      reviewsGiven: user.givenReviews,
      loginHistory: user.loginHistories,
    };
  }

  async deleteAccount(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        status: 'SUSPENDED',
      },
    });

    return { message: 'Account soft-deleted successfully in compliance with GDPR standards.' };
  }

  async recordLoginHistory(userId: string, ipAddress?: string, userAgent?: string) {
    return prisma.loginHistory.create({
      data: {
        userId,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        device: userAgent?.includes('Mobile') ? 'Mobile Device' : 'Desktop Workstation',
      },
    });
  }

  async getLoginHistory(userId: string) {
    return prisma.loginHistory.findMany({
      where: { userId },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const complianceService = new ComplianceService();

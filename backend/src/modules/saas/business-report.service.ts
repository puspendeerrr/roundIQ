import { prisma } from '../../utils/prisma';

export class BusinessReportService {
  async getExecutiveBusinessReport() {
    const [totalUsers, totalBookings, totalPayments, totalCompanies, totalJobs] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.payment.aggregate({
        where: { status: 'CAPTURED' },
        _sum: { amount: true, platformCommission: true },
      }),
      prisma.company.count(),
      prisma.job.count(),
    ]);

    return {
      summary: {
        totalUsers,
        totalBookings,
        grossMarketplaceVolume: totalPayments._sum.amount || 0,
        netPlatformCommission: totalPayments._sum.platformCommission || 0,
        registeredCompanies: totalCompanies,
        publishedJobs: totalJobs,
      },
      generatedAt: new Date().toISOString(),
    };
  }
}

export const businessReportService = new BusinessReportService();

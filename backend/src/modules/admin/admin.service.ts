import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import { VerificationStatus, UserStatus, Role, Prisma, BookingStatus, CancelledBy, WalletTransactionType } from '@prisma/client';
import { financialSettingsService } from '../financial/financial-settings.service';

export class AdminService {
  async getDashboardStats() {
    const [
      totalUsers,
      totalStudents,
      totalInterviewers,
      pendingVerifications,
      approvedInterviewers,
      activeCategories,
      activeSkills,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.STUDENT } }),
      prisma.user.count({ where: { role: Role.INTERVIEWER } }),
      prisma.interviewerProfile.count({ where: { verificationStatus: VerificationStatus.PENDING } }),
      prisma.interviewerProfile.count({ where: { verificationStatus: VerificationStatus.APPROVED } }),
      prisma.category.count({ where: { isActive: true } }),
      prisma.skill.count({ where: { isActive: true } }),
    ]);

    return {
      totalUsers,
      totalStudents,
      totalInterviewers,
      pendingVerifications,
      approvedInterviewers,
      activeCategories,
      activeSkills,
    };
  }

  async getVerificationQueue(status?: VerificationStatus, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: Prisma.InterviewerProfileWhereInput = {};

    if (status) {
      where.verificationStatus = status;
    }

    const [items, total] = await Promise.all([
      prisma.interviewerProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, role: true, status: true, avatarUrl: true, createdAt: true },
          },
          skills: { include: { skill: true } },
          categories: { include: { category: true } },
        },
      }),
      prisma.interviewerProfile.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async approveInterviewer(adminId: string, profileId: string, ipAddress?: string) {
    const profile = await prisma.interviewerProfile.findUnique({
      where: { id: profileId },
      include: { user: true },
    });

    if (!profile) {
      throw new AppError('Interviewer profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    const updatedProfile = await prisma.interviewerProfile.update({
      where: { id: profileId },
      data: {
        verificationStatus: VerificationStatus.APPROVED,
        verificationReason: null,
        verifiedAt: new Date(),
      },
      include: {
        user: { select: { id: true, email: true, avatarUrl: true } },
        skills: { include: { skill: true } },
        categories: { include: { category: true } },
      },
    });

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'INTERVIEWER_APPROVED',
        entity: 'InterviewerProfile',
        entityId: profileId,
        details: { interviewerEmail: profile.user.email, fullName: profile.fullName },
        ipAddress: ipAddress || null,
      },
    });

    return updatedProfile;
  }

  async rejectInterviewer(adminId: string, profileId: string, reason: string, ipAddress?: string) {
    const profile = await prisma.interviewerProfile.findUnique({
      where: { id: profileId },
      include: { user: true },
    });

    if (!profile) {
      throw new AppError('Interviewer profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    const updatedProfile = await prisma.interviewerProfile.update({
      where: { id: profileId },
      data: {
        verificationStatus: VerificationStatus.REJECTED,
        verificationReason: reason,
      },
      include: {
        user: { select: { id: true, email: true, avatarUrl: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'INTERVIEWER_REJECTED',
        entity: 'InterviewerProfile',
        entityId: profileId,
        details: { interviewerEmail: profile.user.email, reason },
        ipAddress: ipAddress || null,
      },
    });

    return updatedProfile;
  }

  async suspendInterviewer(adminId: string, profileId: string, reason?: string, ipAddress?: string) {
    const profile = await prisma.interviewerProfile.findUnique({
      where: { id: profileId },
      include: { user: true },
    });

    if (!profile) {
      throw new AppError('Interviewer profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    const updatedProfile = await prisma.interviewerProfile.update({
      where: { id: profileId },
      data: {
        verificationStatus: VerificationStatus.SUSPENDED,
        verificationReason: reason || 'Suspended by Administrator',
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'INTERVIEWER_SUSPENDED',
        entity: 'InterviewerProfile',
        entityId: profileId,
        details: { interviewerEmail: profile.user.email, reason },
        ipAddress: ipAddress || null,
      },
    });

    return updatedProfile;
  }

  async getUsers(search?: string, role?: Role, status?: UserStatus, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.email = { contains: search.trim(), mode: 'insensitive' };
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          isEmailVerified: true,
          avatarUrl: true,
          createdAt: true,
          studentProfile: { select: { fullName: true, college: true } },
          interviewerProfile: { select: { id: true, fullName: true, currentCompany: true, verificationStatus: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserStatus(adminId: string, userId: string, status: UserStatus, ipAddress?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (user.role === Role.ADMIN) {
      throw new AppError('Cannot modify status of Admin accounts', 403, 'ADMIN_PROTECTED');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: { id: true, email: true, role: true, status: true },
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: `USER_STATUS_${status}`,
        entity: 'User',
        entityId: userId,
        details: { targetEmail: user.email, oldStatus: user.status, newStatus: status },
        ipAddress: ipAddress || null,
      },
    });

    return updatedUser;
  }

  async getAuditLogs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { id: true, email: true } },
        },
      }),
      prisma.auditLog.count(),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ADMIN BOOKING MONITORING & OVERRIDES
  async getAdminBookings(search?: string, status?: BookingStatus, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: Prisma.BookingWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { referenceCode: { contains: search.trim(), mode: 'insensitive' } },
        { student: { email: { contains: search.trim(), mode: 'insensitive' } } },
        { interviewer: { fullName: { contains: search.trim(), mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledStart: 'desc' },
        include: {
          student: { select: { id: true, email: true, studentProfile: true } },
          interviewer: { select: { id: true, fullName: true, currentCompany: true } },
          category: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async adminCancelBooking(adminId: string, bookingId: string, reason: string) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledBy: CancelledBy.ADMIN,
        cancellationReason: reason,
        statusHistory: {
          create: {
            fromStatus: booking.status,
            toStatus: BookingStatus.CANCELLED,
            changedById: adminId,
            reason: `Admin force cancelled: ${reason}`,
          },
        },
      },
    });

    return updatedBooking;
  }

  async adminForceComplete(adminId: string, bookingId: string) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.COMPLETED,
        statusHistory: {
          create: {
            fromStatus: booking.status,
            toStatus: BookingStatus.COMPLETED,
            changedById: adminId,
            reason: 'Admin force completed booking',
          },
        },
      },
    });

    return updatedBooking;
  }

  async adminForceNoShow(adminId: string, bookingId: string, reason: string) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.NO_SHOW,
        statusHistory: {
          create: {
            fromStatus: booking.status,
            toStatus: BookingStatus.NO_SHOW,
            changedById: adminId,
            reason: `Admin marked No Show: ${reason}`,
          },
        },
      },
    });

    return updatedBooking;
  }

  // PHASE 3.0 FINANCIAL FOUNDATION ADMIN METHODS
  async getFinancialSettings() {
    return financialSettingsService.getSettings();
  }

  async updateFinancialSettings(adminUserId: string, dto: any, ipAddress?: string) {
    return financialSettingsService.updateSettings(adminUserId, dto, ipAddress);
  }

  async getAdminWallets(search?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: Prisma.WalletWhereInput = {};

    if (search) {
      where.user = {
        email: { contains: search.trim(), mode: 'insensitive' },
      };
    }

    const [items, total] = await Promise.all([
      prisma.wallet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, role: true, status: true },
          },
        },
      }),
      prisma.wallet.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAdminLedger(search?: string, type?: WalletTransactionType, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: Prisma.WalletTransactionWhereInput = {};

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { referenceCode: { contains: search.trim(), mode: 'insensitive' } },
        { wallet: { user: { email: { contains: search.trim(), mode: 'insensitive' } } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          wallet: {
            include: {
              user: { select: { id: true, email: true, role: true } },
            },
          },
        },
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getFinancialSummary() {
    const settings = await financialSettingsService.getSettings();

    const [
      totalWallets,
      aggregateBalances,
      totalTransactions,
      aggregateTransactions,
      invoiceStats,
    ] = await Promise.all([
      prisma.wallet.count(),
      prisma.wallet.aggregate({
        _sum: {
          balance: true,
          pendingBalance: true,
          withdrawableBalance: true,
          lifetimeCredits: true,
          lifetimeDebits: true,
          totalRefunds: true,
        },
      }),
      prisma.walletTransaction.count(),
      prisma.walletTransaction.aggregate({
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        _sum: { total: true },
        _count: { id: true },
      }),
    ]);

    return {
      settings,
      totalWallets,
      totalSystemBalance: aggregateBalances._sum.balance || 0,
      totalPendingBalance: aggregateBalances._sum.pendingBalance || 0,
      totalWithdrawableBalance: aggregateBalances._sum.withdrawableBalance || 0,
      totalLifetimeCredits: aggregateBalances._sum.lifetimeCredits || 0,
      totalLifetimeDebits: aggregateBalances._sum.lifetimeDebits || 0,
      totalRefunds: aggregateBalances._sum.totalRefunds || 0,
      totalTransactions,
      totalTransactionVolume: aggregateTransactions._sum.amount || 0,
      totalInvoices: invoiceStats._count.id || 0,
      totalInvoicedVolume: invoiceStats._sum.total || 0,
    };
  }
}

export const adminService = new AdminService();

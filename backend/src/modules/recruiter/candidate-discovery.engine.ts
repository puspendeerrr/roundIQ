import { prisma } from '../../utils/prisma';
import { FinalVerdict, Role } from '@prisma/client';

export interface CandidateDiscoveryQueryParams {
  search?: string;
  verdict?: FinalVerdict;
  minScore?: number;
  minTrustScore?: number;
  college?: string;
  page?: number;
  limit?: number;
}

export class CandidateDiscoveryEngine {
  async discoverCandidates(params: CandidateDiscoveryQueryParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      role: Role.STUDENT,
    };

    if (params.search) {
      where.OR = [
        { email: { contains: params.search.trim(), mode: 'insensitive' } },
        { studentProfile: { fullName: { contains: params.search.trim(), mode: 'insensitive' } } },
        { studentProfile: { college: { contains: params.search.trim(), mode: 'insensitive' } } },
      ];
    }

    if (params.college) {
      where.studentProfile = {
        college: { contains: params.college.trim(), mode: 'insensitive' },
      };
    }

    if (params.minTrustScore) {
      where.reputation = {
        reputationScore: { gte: Number(params.minTrustScore) },
      };
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          studentProfile: true,
          reputation: true,
          achievements: { include: { achievement: true } },
          interviewReportsReceived: {
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Filter by interview report verdict and minScore if specified
    const filteredCandidates = students.filter((s) => {
      if (params.verdict) {
        const hasVerdict = s.interviewReportsReceived.some((r) => r.finalVerdict === params.verdict);
        if (!hasVerdict) return false;
      }

      if (params.minScore) {
        const hasScore = s.interviewReportsReceived.some((r) => r.overallScore >= Number(params.minScore));
        if (!hasScore && s.interviewReportsReceived.length > 0) return false;
      }

      return true;
    });

    return {
      items: filteredCandidates,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const candidateDiscoveryEngine = new CandidateDiscoveryEngine();

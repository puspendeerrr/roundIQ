import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import { UpdateInterviewerProfileDTO } from './interviewers.validation';
import { VerificationStatus, UserStatus, Prisma } from '@prisma/client';

export interface DirectoryQueryDTO {
  search?: string;
  category?: string;
  skills?: string[];
  company?: string;
  minExperience?: number;
  maxExperience?: number;
  page?: number;
  limit?: number;
  sortBy?: 'experience_desc' | 'experience_asc' | 'newest';
}

export class InterviewerService {
  async getProfile(userId: string) {
    const profile = await prisma.interviewerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, email: true, role: true, status: true, avatarUrl: true },
        },
        skills: {
          include: { skill: true },
        },
        categories: {
          include: { category: true },
        },
      },
    });

    if (!profile) {
      throw new AppError('Interviewer profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateInterviewerProfileDTO) {
    const profile = await prisma.interviewerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new AppError('Interviewer profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    if (dto.avatarUrl !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: dto.avatarUrl || null },
      });
    }

    if (dto.skillIds) {
      await prisma.interviewerSkill.deleteMany({
        where: { interviewerId: profile.id },
      });
      if (dto.skillIds.length > 0) {
        await prisma.interviewerSkill.createMany({
          data: dto.skillIds.map((skillId) => ({
            interviewerId: profile.id,
            skillId,
          })),
        });
      }
    }

    if (dto.categoryIds) {
      await prisma.interviewerCategory.deleteMany({
        where: { interviewerId: profile.id },
      });
      if (dto.categoryIds.length > 0) {
        await prisma.interviewerCategory.createMany({
          data: dto.categoryIds.map((categoryId) => ({
            interviewerId: profile.id,
            categoryId,
          })),
        });
      }
    }

    const updatedProfile = await prisma.interviewerProfile.update({
      where: { userId },
      data: {
        fullName: dto.fullName,
        headline: dto.headline || null,
        bio: dto.bio || null,
        currentCompany: dto.currentCompany || null,
        previousCompanies: dto.previousCompanies,
        yearsOfExperience: dto.yearsOfExperience,
        languages: dto.languages,
        linkedinUrl: dto.linkedinUrl || null,
        githubUrl: dto.githubUrl || null,
        portfolioUrl: dto.portfolioUrl || null,
        resumeUrl: dto.resumeUrl || null,
      },
      include: {
        user: {
          select: { id: true, email: true, role: true, status: true, avatarUrl: true },
        },
        skills: {
          include: { skill: true },
        },
        categories: {
          include: { category: true },
        },
      },
    });

    return updatedProfile;
  }

  async applyForVerification(userId: string) {
    const profile = await prisma.interviewerProfile.findUnique({
      where: { userId },
      include: {
        skills: true,
        categories: true,
      },
    });

    if (!profile) {
      throw new AppError('Interviewer profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    if (profile.verificationStatus === VerificationStatus.PENDING) {
      throw new AppError('Verification request is already under review', 400, 'ALREADY_PENDING');
    }

    if (profile.verificationStatus === VerificationStatus.APPROVED) {
      throw new AppError('Profile is already approved', 400, 'ALREADY_APPROVED');
    }

    if (!profile.fullName || !profile.currentCompany || profile.yearsOfExperience <= 0) {
      throw new AppError(
        'Please complete required fields (Full Name, Current Company, Years of Experience) before submitting for verification',
        400,
        'INCOMPLETE_PROFILE'
      );
    }

    if (!profile.linkedinUrl && !profile.githubUrl && !profile.resumeUrl) {
      throw new AppError(
        'Please provide at least one professional link (LinkedIn, GitHub, or Resume) for verification',
        400,
        'MISSING_VERIFICATION_DOCS'
      );
    }

    const updatedProfile = await prisma.interviewerProfile.update({
      where: { userId },
      data: {
        verificationStatus: VerificationStatus.PENDING,
        verificationReason: null,
      },
      include: {
        user: {
          select: { id: true, email: true, role: true, status: true, avatarUrl: true },
        },
        skills: { include: { skill: true } },
        categories: { include: { category: true } },
      },
    });

    return updatedProfile;
  }

  // PUBLIC MARKETPLACE DIRECTORY API
  async searchDirectory(query: DirectoryQueryDTO) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 12));
    const skip = (page - 1) * limit;

    const whereConditions: Prisma.InterviewerProfileWhereInput = {
      verificationStatus: VerificationStatus.APPROVED,
      user: {
        status: UserStatus.ACTIVE,
      },
    };

    if (query.search) {
      const searchTerm = query.search.trim();
      whereConditions.OR = [
        { fullName: { contains: searchTerm, mode: 'insensitive' } },
        { headline: { contains: searchTerm, mode: 'insensitive' } },
        { currentCompany: { contains: searchTerm, mode: 'insensitive' } },
        { bio: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (query.company) {
      whereConditions.currentCompany = { contains: query.company.trim(), mode: 'insensitive' };
    }

    if (query.minExperience !== undefined || query.maxExperience !== undefined) {
      whereConditions.yearsOfExperience = {};
      if (query.minExperience !== undefined) {
        whereConditions.yearsOfExperience.gte = Number(query.minExperience);
      }
      if (query.maxExperience !== undefined) {
        whereConditions.yearsOfExperience.lte = Number(query.maxExperience);
      }
    }

    if (query.category) {
      whereConditions.categories = {
        some: {
          category: {
            OR: [
              { slug: query.category },
              { id: query.category },
            ],
          },
        },
      };
    }

    if (query.skills && query.skills.length > 0) {
      const skillList = Array.isArray(query.skills) ? query.skills : [query.skills];
      whereConditions.skills = {
        some: {
          skill: {
            OR: [
              { slug: { in: skillList } },
              { id: { in: skillList } },
            ],
          },
        },
      };
    }

    let orderBy: Prisma.InterviewerProfileOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'experience_desc') {
      orderBy = { yearsOfExperience: 'desc' };
    } else if (query.sortBy === 'experience_asc') {
      orderBy = { yearsOfExperience: 'asc' };
    }

    const [items, total] = await Promise.all([
      prisma.interviewerProfile.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: { id: true, email: true, avatarUrl: true },
          },
          skills: { include: { skill: true } },
          categories: { include: { category: true } },
        },
      }),
      prisma.interviewerProfile.count({ where: whereConditions }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  // PUBLIC INTERVIEWER DETAIL API
  async getPublicProfileById(id: string) {
    const profile = await prisma.interviewerProfile.findFirst({
      where: {
        id,
        verificationStatus: VerificationStatus.APPROVED,
        user: { status: UserStatus.ACTIVE },
      },
      include: {
        user: {
          select: { id: true, email: true, avatarUrl: true },
        },
        skills: { include: { skill: true } },
        categories: { include: { category: true } },
      },
    });

    if (!profile) {
      throw new AppError('Interviewer profile not found or not currently available', 404, 'INTERVIEWER_NOT_FOUND');
    }

    return profile;
  }
}

export const interviewerService = new InterviewerService();

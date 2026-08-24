import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import { VerificationStatus } from '@prisma/client';

export class RecruiterService {
  async getOrCreateRecruiterProfile(userId: string) {
    let profile = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: {
        company: true,
        user: { select: { id: true, email: true, role: true } },
      },
    });

    if (!profile) {
      profile = await prisma.recruiterProfile.create({
        data: {
          userId,
          verificationStatus: VerificationStatus.PENDING,
        },
        include: {
          company: true,
          user: { select: { id: true, email: true, role: true } },
        },
      });
    }

    return profile;
  }

  async updateRecruiterProfile(
    userId: string,
    companyId?: string,
    designation?: string,
    workEmail?: string,
    phone?: string,
    linkedin?: string
  ) {
    const profile = await this.getOrCreateRecruiterProfile(userId);

    return prisma.recruiterProfile.update({
      where: { id: profile.id },
      data: {
        ...(companyId !== undefined && { companyId }),
        ...(designation !== undefined && { designation }),
        ...(workEmail !== undefined && { workEmail }),
        ...(phone !== undefined && { phone }),
        ...(linkedin !== undefined && { linkedin }),
      },
      include: { company: true },
    });
  }
}

export const recruiterService = new RecruiterService();

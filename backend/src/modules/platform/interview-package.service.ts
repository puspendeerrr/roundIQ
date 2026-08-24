import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';

export interface CreatePackageParams {
  interviewerUserId: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
  preparationInstructions?: string;
}

export class InterviewPackageService {
  async createPackage(params: CreatePackageParams) {
    const interviewerProfile = await prisma.interviewerProfile.findUnique({
      where: { userId: params.interviewerUserId },
    });

    if (!interviewerProfile) {
      throw new AppError('Interviewer profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    const pkg = await prisma.interviewPackage.create({
      data: {
        interviewerId: interviewerProfile.id,
        title: params.title,
        description: params.description,
        durationMinutes: params.durationMinutes,
        price: params.price,
        preparationInstructions: params.preparationInstructions || null,
      },
    });

    return pkg;
  }

  async getInterviewerPackages(interviewerId: string) {
    return prisma.interviewPackage.findMany({
      where: { interviewerId, isActive: true },
      orderBy: { durationMinutes: 'asc' },
    });
  }
}

export const interviewPackageService = new InterviewPackageService();

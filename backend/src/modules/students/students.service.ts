import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import { UpdateStudentProfileDTO } from './students.validation';

export class StudentService {
  async getProfile(userId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, email: true, role: true, avatarUrl: true },
        },
      },
    });

    if (!profile) {
      throw new AppError('Student profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateStudentProfileDTO) {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!studentProfile) {
      throw new AppError('Student profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    // Update avatarUrl on User model if provided
    if (dto.avatarUrl !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: dto.avatarUrl || null },
      });
    }

    const updatedProfile = await prisma.studentProfile.update({
      where: { userId },
      data: {
        fullName: dto.fullName,
        college: dto.college || null,
        degree: dto.degree || null,
        experience: dto.experience || null,
        bio: dto.bio || null,
        resumeUrl: dto.resumeUrl || null,
      },
      include: {
        user: {
          select: { id: true, email: true, role: true, avatarUrl: true },
        },
      },
    });

    return updatedProfile;
  }
}

export const studentService = new StudentService();

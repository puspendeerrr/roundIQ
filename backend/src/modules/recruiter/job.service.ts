import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import { JobStatus, EmploymentType, WorkMode } from '@prisma/client';

export interface CreateJobParams {
  recruiterUserId: string;
  title: string;
  description: string;
  employmentType?: EmploymentType;
  experience?: string;
  salaryMin?: number;
  salaryMax?: number;
  location?: string;
  workMode?: WorkMode;
  skills?: string[];
  openings?: number;
}

export class JobService {
  async createJob(params: CreateJobParams) {
    const recruiterProfile = await prisma.recruiterProfile.findUnique({
      where: { userId: params.recruiterUserId },
    });

    if (!recruiterProfile || !recruiterProfile.companyId) {
      throw new AppError('Recruiter must belong to a registered company before posting jobs', 400, 'COMPANY_REQUIRED');
    }

    const job = await prisma.job.create({
      data: {
        companyId: recruiterProfile.companyId,
        recruiterId: params.recruiterUserId,
        title: params.title,
        description: params.description,
        employmentType: params.employmentType || EmploymentType.FULL_TIME,
        experience: params.experience || null,
        salaryMin: params.salaryMin || null,
        salaryMax: params.salaryMax || null,
        location: params.location || null,
        workMode: params.workMode || WorkMode.REMOTE,
        skills: params.skills || [],
        openings: params.openings || 1,
        status: JobStatus.OPEN,
      },
      include: {
        company: true,
      },
    });

    return job;
  }

  async getRecruiterJobs(recruiterUserId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.job.findMany({
        where: { recruiterId: recruiterUserId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: true,
          _count: { select: { pipelines: true } },
        },
      }),
      prisma.job.count({ where: { recruiterId: recruiterUserId } }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateJobStatus(recruiterUserId: string, jobId: string, status: JobStatus) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.recruiterId !== recruiterUserId) {
      throw new AppError('Job posting not found or unauthorized', 404, 'JOB_NOT_FOUND');
    }

    return prisma.job.update({
      where: { id: jobId },
      data: { status },
    });
  }

  async getPublicJobs(search?: string, location?: string, workMode?: WorkMode, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: any = { status: JobStatus.OPEN };

    if (search) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    if (location) where.location = { contains: location.trim(), mode: 'insensitive' };
    if (workMode) where.workMode = workMode;

    const [items, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: true,
        },
      }),
      prisma.job.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}

export const jobService = new JobService();

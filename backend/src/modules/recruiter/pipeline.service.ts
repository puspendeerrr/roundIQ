import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import { PipelineStage } from '@prisma/client';

export class PipelineService {
  async addToPipeline(jobId: string, candidateId: string, stage: PipelineStage = PipelineStage.DISCOVERED, remarks?: string) {
    const existing = await prisma.hiringPipeline.findUnique({
      where: {
        jobId_candidateId: { jobId, candidateId },
      },
    });

    if (existing) {
      return prisma.hiringPipeline.update({
        where: { id: existing.id },
        data: { stage, remarks: remarks || existing.remarks },
      });
    }

    return prisma.hiringPipeline.create({
      data: {
        jobId,
        candidateId,
        stage,
        remarks: remarks || null,
      },
    });
  }

  async updateStage(pipelineId: string, stage: PipelineStage, remarks?: string) {
    const item = await prisma.hiringPipeline.findUnique({ where: { id: pipelineId } });
    if (!item) {
      throw new AppError('Pipeline candidate entry not found', 404, 'PIPELINE_NOT_FOUND');
    }

    return prisma.hiringPipeline.update({
      where: { id: pipelineId },
      data: {
        stage,
        ...(remarks !== undefined && { remarks }),
      },
    });
  }

  async getJobPipeline(jobId: string) {
    const items = await prisma.hiringPipeline.findMany({
      where: { jobId },
      orderBy: { updatedAt: 'desc' },
      include: {
        candidate: {
          select: {
            id: true,
            email: true,
            studentProfile: true,
            reputation: true,
          },
        },
      },
    });

    // Group into Kanban columns
    const stages: Record<PipelineStage, typeof items> = {
      DISCOVERED: [],
      SHORTLISTED: [],
      CONTACTED: [],
      INTERVIEWING: [],
      FINAL_ROUND: [],
      SELECTED: [],
      OFFERED: [],
      HIRED: [],
      REJECTED: [],
    };

    items.forEach((item) => {
      if (stages[item.stage]) {
        stages[item.stage].push(item);
      }
    });

    return {
      all: items,
      stages,
    };
  }
}

export const pipelineService = new PipelineService();

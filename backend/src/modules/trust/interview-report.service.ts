import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import { FinalVerdict } from '@prisma/client';

export interface CreateInterviewReportParams {
  interviewerUserId: string;
  bookingId: string;
  technicalScore: number;
  problemSolvingScore: number;
  codingScore: number;
  communicationScore: number;
  confidenceScore: number;
  strengths: string;
  weaknesses: string;
  recommendations: string;
  finalVerdict: FinalVerdict;
  privateNotes?: string;
}

export class InterviewReportService {
  async createReport(params: CreateInterviewReportParams) {
    const booking = await prisma.booking.findUnique({
      where: { id: params.bookingId },
      include: { interviewer: true },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    if (booking.interviewer.userId !== params.interviewerUserId) {
      throw new AppError('Only the assigned interviewer may submit an interview report', 403, 'FORBIDDEN');
    }

    const existingReport = await prisma.interviewReport.findUnique({
      where: { bookingId: params.bookingId },
    });

    if (existingReport) {
      throw new AppError('An interview report has already been generated for this session', 400, 'DUPLICATE_REPORT');
    }

    const overallScore = Number(
      (
        (params.technicalScore +
          params.problemSolvingScore +
          params.codingScore +
          params.communicationScore +
          params.confidenceScore) /
        5
      ).toFixed(1)
    );

    const report = await prisma.interviewReport.create({
      data: {
        bookingId: booking.id,
        interviewerId: params.interviewerUserId,
        studentId: booking.studentId,
        technicalScore: params.technicalScore,
        problemSolvingScore: params.problemSolvingScore,
        codingScore: params.codingScore,
        communicationScore: params.communicationScore,
        confidenceScore: params.confidenceScore,
        overallScore,
        strengths: params.strengths,
        weaknesses: params.weaknesses,
        recommendations: params.recommendations,
        finalVerdict: params.finalVerdict,
        privateNotes: params.privateNotes || null,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: params.interviewerUserId,
        action: 'INTERVIEW_REPORT_CREATED',
        entity: 'InterviewReport',
        entityId: report.id,
        details: {
          bookingId: booking.id,
          overallScore,
          finalVerdict: params.finalVerdict,
        },
      },
    });

    return report;
  }

  async getReportByBookingId(userId: string, bookingId: string) {
    const report = await prisma.interviewReport.findUnique({
      where: { bookingId },
      include: {
        interviewer: { select: { id: true, email: true } },
        student: { select: { id: true, email: true } },
      },
    });

    if (!report) {
      throw new AppError('Interview report not found for this session', 404, 'REPORT_NOT_FOUND');
    }

    if (report.studentId !== userId && report.interviewerId !== userId) {
      throw new AppError('Unauthorized to view this candidate evaluation report', 403, 'FORBIDDEN');
    }

    return report;
  }

  async getStudentReports(studentUserId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.interviewReport.findMany({
        where: { studentId: studentUserId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: { select: { id: true, referenceCode: true, scheduledStart: true } },
        },
      }),
      prisma.interviewReport.count({ where: { studentId: studentUserId } }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}

export const interviewReportService = new InterviewReportService();

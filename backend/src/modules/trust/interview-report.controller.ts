import { Response, NextFunction } from 'express';
import { interviewReportService } from './interview-report.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

export class InterviewReportController {
  async createReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const interviewerUserId = req.user!.userId;
      const {
        bookingId,
        technicalScore,
        problemSolvingScore,
        codingScore,
        communicationScore,
        confidenceScore,
        strengths,
        weaknesses,
        recommendations,
        finalVerdict,
        privateNotes,
      } = req.body;

      const report = await interviewReportService.createReport({
        interviewerUserId,
        bookingId,
        technicalScore: Number(technicalScore),
        problemSolvingScore: Number(problemSolvingScore),
        codingScore: Number(codingScore),
        communicationScore: Number(communicationScore),
        confidenceScore: Number(confidenceScore),
        strengths,
        weaknesses,
        recommendations,
        finalVerdict,
        privateNotes,
      });

      return sendSuccess(res, report, 'Interview report generated successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async getReportByBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { bookingId } = req.params;
      const report = await interviewReportService.getReportByBookingId(userId, bookingId);
      return sendSuccess(res, report, 'Interview evaluation report retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getMyReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const studentUserId = req.user!.userId;
      const { page, limit } = req.query;
      const result = await interviewReportService.getStudentReports(
        studentUserId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'Student interview reports retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }
}

export const interviewReportController = new InterviewReportController();

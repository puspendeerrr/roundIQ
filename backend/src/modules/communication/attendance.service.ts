import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';

export class AttendanceService {
  async recordJoin(bookingId: string, participantId: string, device?: string, ipAddress?: string) {
    const attendance = await prisma.sessionAttendance.create({
      data: {
        bookingId,
        participantId,
        joinedAt: new Date(),
        device: device || 'Web Browser',
        ipAddress: ipAddress || null,
      },
    });

    return attendance;
  }

  async recordLeave(attendanceId: string) {
    const attendance = await prisma.sessionAttendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new AppError('Attendance record not found', 404, 'ATTENDANCE_NOT_FOUND');
    }

    const leftAt = new Date();
    const durationSeconds = Math.round((leftAt.getTime() - attendance.joinedAt.getTime()) / 1000);

    return prisma.sessionAttendance.update({
      where: { id: attendanceId },
      data: {
        leftAt,
        durationSeconds,
      },
    });
  }

  async getSessionAttendance(bookingId: string) {
    return prisma.sessionAttendance.findMany({
      where: { bookingId },
      orderBy: { joinedAt: 'asc' },
      include: {
        participant: { select: { id: true, email: true, role: true } },
      },
    });
  }
}

export const attendanceService = new AttendanceService();

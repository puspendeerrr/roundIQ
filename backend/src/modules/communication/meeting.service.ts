import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import { meetingProviderFactory } from './meeting-provider.factory';
import { notificationService } from './notification.service';
import { emailService } from './email.service';
import { MeetingStatus, BookingStatus } from '@prisma/client';

export class MeetingService {
  async createMeetingForBooking(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: true,
        interviewer: { include: { user: true } },
      },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    const existingMeeting = await prisma.meeting.findUnique({
      where: { bookingId },
    });

    if (existingMeeting) {
      return existingMeeting;
    }

    const provider = meetingProviderFactory.getProvider('GOOGLE_MEET');
    const createdResult = await provider.createMeeting(
      booking.id,
      booking.scheduledStart,
      booking.scheduledEnd,
      `1-on-1 Mock Technical Interview (${booking.referenceCode})`
    );

    const meeting = await prisma.meeting.create({
      data: {
        bookingId: booking.id,
        provider: createdResult.provider,
        meetingId: createdResult.meetingId,
        meetingUrl: createdResult.meetingUrl,
        hostUrl: createdResult.hostUrl || createdResult.meetingUrl,
        status: MeetingStatus.SCHEDULED,
        scheduledStart: booking.scheduledStart,
        scheduledEnd: booking.scheduledEnd,
      },
    });

    // Notify Student
    await notificationService.createNotification({
      userId: booking.studentId,
      type: 'MEETING_CREATED',
      title: 'Google Meet Link Generated 🚀',
      body: `Your interview session ${booking.referenceCode} is ready. Click to view meeting details.`,
      metadata: { bookingId: booking.id, meetingUrl: meeting.meetingUrl },
    });

    await emailService.sendEmail({
      recipient: booking.student.email,
      subject: `Google Meet Link: Mock Interview (${booking.referenceCode})`,
      template: 'MEETING_INVITE',
      data: {
        title: 'Your Interview Session Google Meet Link',
        message: `Your session with ${booking.interviewer.fullName} is confirmed for ${new Date(
          booking.scheduledStart
        ).toLocaleString()}.`,
        meetingUrl: meeting.meetingUrl,
      },
    });

    // Notify Interviewer
    await notificationService.createNotification({
      userId: booking.interviewer.userId,
      type: 'MEETING_CREATED',
      title: 'Interview Session Scheduled',
      body: `Mock interview ${booking.referenceCode} with candidate is ready. Link: ${meeting.meetingUrl}`,
      metadata: { bookingId: booking.id, meetingUrl: meeting.meetingUrl },
    });

    return meeting;
  }

  async getMeetingByBookingId(userId: string, bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { interviewer: true },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    if (booking.studentId !== userId && booking.interviewer.userId !== userId) {
      throw new AppError('Unauthorized to view this meeting', 403, 'FORBIDDEN');
    }

    let meeting = await prisma.meeting.findUnique({
      where: { bookingId },
    });

    if (!meeting) {
      meeting = await this.createMeetingForBooking(bookingId);
    }

    return meeting;
  }

  async updateMeetingStatus(bookingId: string, status: MeetingStatus) {
    return prisma.meeting.update({
      where: { bookingId },
      data: { status },
    });
  }
}

export const meetingService = new MeetingService();

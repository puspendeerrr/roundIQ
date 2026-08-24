import crypto from 'crypto';
import { IMeetingProvider, CreatedMeetingResult } from './meeting-provider.interface';

export class GoogleMeetProvider implements IMeetingProvider {
  name = 'GOOGLE_MEET';

  private generateMeetCode(): string {
    const part1 = crypto.randomBytes(2).toString('hex').substring(0, 3);
    const part2 = crypto.randomBytes(2).toString('hex').substring(0, 4);
    const part3 = crypto.randomBytes(2).toString('hex').substring(0, 3);
    return `${part1}-${part2}-${part3}`;
  }

  async createMeeting(
    bookingId: string,
    scheduledStart: Date,
    scheduledEnd: Date,
    title: string,
    description?: string
  ): Promise<CreatedMeetingResult> {
    const code = this.generateMeetCode();
    const meetingId = `meet_${code}`;
    const meetingUrl = `https://meet.google.com/${code}`;

    return {
      provider: this.name,
      meetingId,
      meetingUrl,
      hostUrl: meetingUrl,
      scheduledStart,
      scheduledEnd,
    };
  }

  async cancelMeeting(meetingId: string): Promise<boolean> {
    return true;
  }

  async updateMeeting(
    meetingId: string,
    newStart: Date,
    newEnd: Date
  ): Promise<CreatedMeetingResult> {
    const code = meetingId.replace('meet_', '');
    const meetingUrl = `https://meet.google.com/${code}`;

    return {
      provider: this.name,
      meetingId,
      meetingUrl,
      hostUrl: meetingUrl,
      scheduledStart: newStart,
      scheduledEnd: newEnd,
    };
  }
}

export const googleMeetProvider = new GoogleMeetProvider();

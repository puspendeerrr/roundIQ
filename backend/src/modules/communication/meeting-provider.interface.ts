export interface CreatedMeetingResult {
  provider: string;
  meetingId: string;
  meetingUrl: string;
  hostUrl?: string;
  scheduledStart: Date;
  scheduledEnd: Date;
}

export interface IMeetingProvider {
  name: string;
  createMeeting(
    bookingId: string,
    scheduledStart: Date,
    scheduledEnd: Date,
    title: string,
    description?: string
  ): Promise<CreatedMeetingResult>;

  cancelMeeting(meetingId: string): Promise<boolean>;

  updateMeeting(
    meetingId: string,
    newStart: Date,
    newEnd: Date
  ): Promise<CreatedMeetingResult>;
}

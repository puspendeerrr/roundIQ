import { IMeetingProvider } from './meeting-provider.interface';
import { googleMeetProvider } from './google-meet.provider';

export class MeetingProviderFactory {
  getProvider(providerName = 'GOOGLE_MEET'): IMeetingProvider {
    switch (providerName.toUpperCase()) {
      case 'GOOGLE_MEET':
      default:
        return googleMeetProvider;
    }
  }
}

export const meetingProviderFactory = new MeetingProviderFactory();

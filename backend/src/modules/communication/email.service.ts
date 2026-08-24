import { prisma } from '../../utils/prisma';

export interface SendEmailParams {
  recipient: string;
  subject: string;
  template: 'BOOKING_CONFIRMED' | 'MEETING_INVITE' | 'REMINDER' | 'CANCELLATION' | 'RESCHEDULE' | 'COMPLETED';
  data: Record<string, any>;
}

export class EmailService {
  private renderHtmlTemplate(template: SendEmailParams['template'], data: Record<string, any>): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
            .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e4e4e7; }
            .header { border-bottom: 2px solid #c2410c; padding-bottom: 12px; margin-bottom: 20px; }
            .logo { font-size: 20px; font-weight: 900; color: #18181b; }
            .logo span { color: #c2410c; }
            .content { font-size: 14px; color: #3f3f46; line-height: 1.6; }
            .btn { display: inline-block; background-color: #c2410c; color: #ffffff; font-weight: 700; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; }
            .footer { margin-top: 32px; font-size: 12px; color: #71717a; text-align: center; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div class="logo">Round<span>IQ</span> — Interview Platform</div>
            </div>
            <div class="content">
              <h2>${data.title || 'Session Notification'}</h2>
              <p>${data.message || 'Thank you for using RoundIQ for your mock technical interview.'}</p>
              ${data.meetingUrl ? `<a href="${data.meetingUrl}" class="btn">Join Interview Meeting</a>` : ''}
            </div>
            <div class="footer">
              <p>&copy; 2026 RoundIQ Inc. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async sendEmail(params: SendEmailParams) {
    const html = this.renderHtmlTemplate(params.template, params.data);

    // Record in EmailLog table
    const emailLog = await prisma.emailLog.create({
      data: {
        recipient: params.recipient,
        subject: params.subject,
        template: params.template,
        status: 'SENT',
        provider: 'ROUNDIQ_SMTP',
      },
    });

    return { success: true, emailLogId: emailLog.id };
  }
}

export const emailService = new EmailService();

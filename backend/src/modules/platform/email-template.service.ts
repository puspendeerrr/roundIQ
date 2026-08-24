import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';

export class EmailTemplateService {
  async getAllTemplates() {
    return prisma.emailTemplate.findMany({
      orderBy: { templateKey: 'asc' },
    });
  }

  async updateTemplate(templateKey: string, subject: string, htmlBody: string) {
    const template = await prisma.emailTemplate.findUnique({ where: { templateKey } });
    if (!template) {
      throw new AppError('Email template not found', 404, 'TEMPLATE_NOT_FOUND');
    }

    return prisma.emailTemplate.update({
      where: { templateKey },
      data: { subject, htmlBody },
    });
  }
}

export const emailTemplateService = new EmailTemplateService();

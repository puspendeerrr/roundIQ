import { prisma } from '../../utils/prisma';

export class PlatformSettingsService {
  async getSettings() {
    let settings = await prisma.platformSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: { id: 'default' },
      });
    }

    return settings;
  }

  async updateSettings(data: any) {
    const settings = await this.getSettings();

    return prisma.platformSettings.update({
      where: { id: settings.id },
      data: {
        ...(data.maintenanceMode !== undefined && { maintenanceMode: Boolean(data.maintenanceMode) }),
        ...(data.announcementBanner !== undefined && { announcementBanner: data.announcementBanner }),
        ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
        ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
        ...(data.commissionPercentage !== undefined && { commissionPercentage: Number(data.commissionPercentage) }),
      },
    });
  }
}

export const platformSettingsService = new PlatformSettingsService();

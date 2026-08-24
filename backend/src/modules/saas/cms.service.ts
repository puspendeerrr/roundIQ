import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';

export class CmsService {
  async getPageBySlug(slug: string) {
    const page = await prisma.cmsPage.findUnique({ where: { slug } });
    if (!page || !page.published) {
      throw new AppError('CMS Page not found', 404, 'PAGE_NOT_FOUND');
    }
    return page;
  }

  async getAllPages() {
    return prisma.cmsPage.findMany({
      orderBy: { title: 'asc' },
    });
  }

  async createOrUpdatePage(slug: string, title: string, category: string, content: string, published = true) {
    return prisma.cmsPage.upsert({
      where: { slug },
      update: { title, category, content, published },
      create: { slug, title, category, content, published },
    });
  }
}

export const cmsService = new CmsService();

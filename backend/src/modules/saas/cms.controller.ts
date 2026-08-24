import { Response, NextFunction } from 'express';
import { cmsService } from './cms.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

export class CmsController {
  async getPageBySlug(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const page = await cmsService.getPageBySlug(slug);
      return sendSuccess(res, page, 'CMS page content retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getAllPages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pages = await cmsService.getAllPages();
      return sendSuccess(res, pages, 'All CMS pages retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createOrUpdatePage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { slug, title, category, content, published } = req.body;
      const page = await cmsService.createOrUpdatePage(
        slug,
        title,
        category,
        content,
        published !== undefined ? Boolean(published) : true
      );
      return sendSuccess(res, page, 'CMS page saved successfully');
    } catch (error) {
      return next(error);
    }
  }
}

export const cmsController = new CmsController();

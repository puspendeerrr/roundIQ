import { Response, NextFunction } from 'express';
import { platformSettingsService } from './platform-settings.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

export class PlatformSettingsController {
  async getSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const settings = await platformSettingsService.getSettings();
      return sendSuccess(res, settings, 'Platform settings retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const settings = await platformSettingsService.updateSettings(req.body);
      return sendSuccess(res, settings, 'Platform settings updated successfully');
    } catch (error) {
      return next(error);
    }
  }
}

export const platformSettingsController = new PlatformSettingsController();

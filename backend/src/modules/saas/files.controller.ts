import { Response, NextFunction } from 'express';
import { fileStorageService } from './file-storage.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

export class FilesController {
  async recordFileUpload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { filename, originalName, mimeType, sizeBytes, url } = req.body;
      const record = await fileStorageService.recordFileUpload(
        userId,
        filename,
        originalName,
        mimeType,
        Number(sizeBytes),
        url
      );
      return sendSuccess(res, record, 'File upload recorded successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async getMyFiles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const files = await fileStorageService.getUserFiles(userId);
      return sendSuccess(res, files, 'User file records retrieved');
    } catch (error) {
      return next(error);
    }
  }
}

export const filesController = new FilesController();

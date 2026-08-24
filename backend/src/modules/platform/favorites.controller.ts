import { Response, NextFunction } from 'express';
import { favoritesService } from './favorites.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

export class FavoritesController {
  async toggleFavorite(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { interviewerId } = req.body;
      const result = await favoritesService.toggleFavorite(userId, interviewerId);
      return sendSuccess(res, result, result.isFavorited ? 'Interviewer saved to favorites' : 'Interviewer removed from favorites');
    } catch (error) {
      return next(error);
    }
  }

  async getMyFavorites(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const favorites = await favoritesService.getUserFavorites(userId);
      return sendSuccess(res, favorites, 'Saved interviewers retrieved');
    } catch (error) {
      return next(error);
    }
  }
}

export const favoritesController = new FavoritesController();

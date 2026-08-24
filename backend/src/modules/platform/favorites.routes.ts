import { Router } from 'express';
import { favoritesController } from './favorites.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/toggle', (req, res, next) => favoritesController.toggleFavorite(req, res, next));
router.get('/me', (req, res, next) => favoritesController.getMyFavorites(req, res, next));

export default router;

import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/api-response';

export function swaggerAuthMiddleware(_req: Request, res: Response, next: NextFunction) {
  // Allow in development mode OR when ENABLE_SWAGGER environment variable is explicitly set to 'true'
  if (process.env.NODE_ENV === 'development' || process.env.ENABLE_SWAGGER === 'true') {
    return next();
  }

  return sendError(
    res,
    'FORBIDDEN',
    'Swagger UI documentation is currently disabled in production. Set ENABLE_SWAGGER=true to enable.',
    403
  );
}

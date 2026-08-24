import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/api-response';
import { env } from '../config/env';

export function swaggerAuthMiddleware(_req: Request, res: Response, next: NextFunction) {
  const rawEnv = process.env.ENABLE_SWAGGER ?? env.ENABLE_SWAGGER ?? '';
  const val = String(rawEnv).trim().toLowerCase();
  const isEnabled = process.env.NODE_ENV === 'development' || val === 'true' || val === '1';

  if (isEnabled) {
    return next();
  }

  return sendError(
    res,
    'FORBIDDEN',
    'Swagger UI documentation is currently disabled in production. Set ENABLE_SWAGGER=true to enable.',
    403
  );
}

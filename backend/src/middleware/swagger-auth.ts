import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/api-response';

export function swaggerAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  // Always allow in development or when ENABLE_SWAGGER is explicitly true
  if (process.env.NODE_ENV === 'development' || process.env.ENABLE_SWAGGER === 'true') {
    return next();
  }

  // In production, check for valid Admin JWT authentication
  try {
    const authHeader = req.headers.authorization || req.query.token as string;
    if (authHeader) {
      const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : (authHeader as string);

      const payload = verifyAccessToken(token);
      if (payload && payload.role === 'ADMIN') {
        return next();
      }
    }
  } catch (err) {
    // Fallthrough to forbidden response
  }

  return sendError(
    res,
    'FORBIDDEN',
    'Swagger UI documentation is restricted in production. Set ENABLE_SWAGGER=true or authenticate as Admin.',
    403
  );
}

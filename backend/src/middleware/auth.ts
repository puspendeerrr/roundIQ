import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { sendError } from '../utils/api-response';
import { prisma } from '../utils/prisma';
import { Role, UserStatus } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: JwtPayload & { status?: UserStatus };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'UNAUTHENTICATED', 'Missing or invalid Authorization header', 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user) {
      return sendError(res, 'UNAUTHENTICATED', 'User no longer exists', 401);
    }

    if (user.status === UserStatus.SUSPENDED) {
      return sendError(res, 'USER_SUSPENDED', 'Your account has been suspended', 403);
    }

    if (user.status === UserStatus.BANNED) {
      return sendError(res, 'USER_BANNED', 'Your account has been banned', 403);
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    return next();
  } catch (error: any) {
    return sendError(res, 'UNAUTHENTICATED', 'Invalid or expired access token', 401);
  }
}

export function authorize(allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHENTICATED', 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        'FORBIDDEN',
        `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`,
        403
      );
    }

    return next();
  };
}

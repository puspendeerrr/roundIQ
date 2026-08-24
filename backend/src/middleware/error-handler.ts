import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/api-response';
import { ZodError } from 'zod';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  console.error('💥 Error caught in errorHandler:', err);

  if (err instanceof AppError) {
    return sendError(res, err.code, err.message, err.statusCode, err.details);
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'VALIDATION_ERROR', 'Input validation failed', 400, formattedErrors);
  }

  // Handle Prisma Known Request Errors if applicable
  if (err?.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      return sendError(
        res,
        'DUPLICATE_ENTRY',
        'A record with this field already exists',
        409,
        err.meta
      );
    }
    if (err.code === 'P2025') {
      return sendError(res, 'NOT_FOUND', 'Requested record not found', 404);
    }
  }

  return sendError(
    res,
    'INTERNAL_SERVER_ERROR',
    process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message || 'Internal Server Error',
    500
  );
}

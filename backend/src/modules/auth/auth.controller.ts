import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../utils/api-response';
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.validation';
import { AuthRequest } from '../../middleware/auth';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);

      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      return sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
          verificationToken: result.verificationToken,
        },
        'Registration successful',
        201
      );
    } catch (error) {
      return next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);

      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      return sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        'Login successful'
      );
    } catch (error) {
      return next(error);
    }
  }

  async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = googleAuthSchema.parse(req.body);
      const result = await authService.googleAuth(validatedData);

      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      return sendSuccess(res, {
        user: result.user,
        accessToken: result.accessToken,
      }, 'Google authentication successful');
    } catch (error) {
      return next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenFromCookie = req.cookies?.refreshToken;
      const tokenFromBody = req.body?.refreshToken;
      const token = tokenFromCookie || tokenFromBody;

      if (!token) {
        return res.status(401).json({
          success: false,
          error: { code: 'NO_REFRESH_TOKEN', message: 'Refresh token is missing' },
        });
      }

      const result = await authService.refreshToken(token);

      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      return sendSuccess(res, { accessToken: result.accessToken }, 'Token refreshed successfully');
    } catch (error) {
      return next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      await authService.logout(token);

      res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);

      return sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      return next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(email);
      return sendSuccess(res, result, result.message);
    } catch (error) {
      return next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(validatedData);
      return sendSuccess(res, null, result.message);
    } catch (error) {
      return next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = verifyEmailSchema.parse(req.body);
      const result = await authService.verifyEmail(validatedData);
      return sendSuccess(res, null, result.message);
    } catch (error) {
      return next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHENTICATED', message: 'Not authenticated' },
        });
      }
      const user = await authService.getCurrentUser(req.user.userId);
      return sendSuccess(res, { user }, 'Current user retrieved');
    } catch (error) {
      return next(error);
    }
  }
}

export const authController = new AuthController();

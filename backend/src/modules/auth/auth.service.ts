import { prisma } from '../../utils/prisma';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../middleware/error-handler';
import { Role, UserStatus, VerificationStatus } from '@prisma/client';
import {
  RegisterDTO,
  LoginDTO,
  GoogleAuthDTO,
  ResetPasswordDTO,
  VerifyEmailDTO,
} from './auth.validation';
import crypto from 'crypto';

export class AuthService {
  async register(dto: RegisterDTO) {
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await hashPassword(dto.password);

    const user = await prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role,
        status: UserStatus.ACTIVE,
        isEmailVerified: false,
        wallet: {
          create: {},
        },
        ...(dto.role === Role.STUDENT && {
          studentProfile: {
            create: {
              fullName: dto.fullName,
            },
          },
        }),
        ...(dto.role === Role.INTERVIEWER && {
          interviewerProfile: {
            create: {
              fullName: dto.fullName,
              verificationStatus: VerificationStatus.DRAFT,
            },
          },
        }),
      },
      include: {
        studentProfile: true,
        interviewerProfile: true,
        wallet: true,
      },
    });

    // Generate Verification Token
    const rawVerificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawVerificationToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerificationToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    // Generate Auth JWTs
    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId: user.id,
        expiresAt: refreshExpiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        avatarUrl: user.avatarUrl,
        studentProfile: user.studentProfile,
        interviewerProfile: user.interviewerProfile,
      },
      accessToken,
      refreshToken,
      verificationToken: rawVerificationToken,
    };
  }

  async login(dto: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        studentProfile: true,
        interviewerProfile: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await comparePassword(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppError('Your account has been suspended by an administrator', 403, 'USER_SUSPENDED');
    }

    if (user.status === UserStatus.BANNED) {
      throw new AppError('Your account has been banned', 403, 'USER_BANNED');
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId: user.id,
        expiresAt: refreshExpiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        avatarUrl: user.avatarUrl,
        studentProfile: user.studentProfile,
        interviewerProfile: user.interviewerProfile,
      },
      accessToken,
      refreshToken,
    };
  }

  async googleAuth(dto: GoogleAuthDTO) {
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: dto.googleId }, { email: dto.email.toLowerCase() }],
      },
      include: {
        studentProfile: true,
        interviewerProfile: true,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          googleId: dto.googleId,
          role: dto.role,
          status: UserStatus.ACTIVE,
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          avatarUrl: dto.avatarUrl,
          wallet: {
            create: {},
          },
          ...(dto.role === Role.STUDENT && {
            studentProfile: {
              create: {
                fullName: dto.fullName,
              },
            },
          }),
          ...(dto.role === Role.INTERVIEWER && {
            interviewerProfile: {
              create: {
                fullName: dto.fullName,
                verificationStatus: VerificationStatus.DRAFT,
              },
            },
          }),
        },
        include: {
          studentProfile: true,
          interviewerProfile: true,
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: dto.googleId, isEmailVerified: true },
        include: { studentProfile: true, interviewerProfile: true },
      });
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError(`Account is ${user.status.toLowerCase()}`, 403, `USER_${user.status}`);
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        avatarUrl: user.avatarUrl,
        studentProfile: user.studentProfile,
        interviewerProfile: user.interviewerProfile,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(tokenString: string) {
    let payload;
    try {
      payload = verifyRefreshToken(tokenString);
    } catch (err) {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    const tokenHash = crypto.createHash('sha256').update(tokenString).digest('hex');
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      throw new AppError('Refresh token has been revoked or expired', 401, 'TOKEN_REVOKED');
    }

    // Revoke old refresh token (rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new AppError('User account is disabled or missing', 403, 'USER_INACTIVE');
    }

    const newAccessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    await prisma.refreshToken.create({
      data: {
        tokenHash: newRefreshTokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(tokenString?: string) {
    if (tokenString) {
      const tokenHash = crypto.createHash('sha256').update(tokenString).digest('hex');
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { isRevoked: true },
      });
    }
    return { success: true };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Return success without revealing user existence (security best practice)
      return { message: 'If an account exists with this email, a password reset link has been sent.' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      message: 'If an account exists with this email, a password reset link has been sent.',
      resetToken: rawToken, // For development/testing return
    };
  }

  async resetPassword(dto: ResetPasswordDTO) {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired password reset token', 400, 'INVALID_RESET_TOKEN');
    }

    const newPasswordHash = await hashPassword(dto.newPassword);
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: newPasswordHash },
    });

    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    // Revoke all refresh tokens for security
    await prisma.refreshToken.updateMany({
      where: { userId: resetToken.userId },
      data: { isRevoked: true },
    });

    return { message: 'Password has been reset successfully' };
  }

  async verifyEmail(dto: VerifyEmailDTO) {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
    });

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired email verification token', 400, 'INVALID_VERIFICATION_TOKEN');
    }

    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    return { message: 'Email verified successfully' };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        interviewerProfile: {
          include: {
            skills: { include: { skill: true } },
            categories: { include: { category: true } },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      studentProfile: user.studentProfile,
      interviewerProfile: user.interviewerProfile,
    };
  }
}

export const authService = new AuthService();

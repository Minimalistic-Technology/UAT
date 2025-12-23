import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  signupSchema,
  loginSchema,
  passwordResetInitSchema,
  passwordResetCompleteSchema
} from '../validators/authValidator';
import * as userService from '../services/userService';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from '../utils/jwt';
import {
  replaceRefreshToken,
  storeResetToken,
  verifyStoredToken,
  deleteToken,
  invalidateTokens,
  createTokenString
} from '../services/tokenService';
import { env } from '../config/env';
import { durationToMs } from '../utils/time';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = signupSchema.parse(req.body) as userService.CreateUserPayload;

    const existing = await userService.findByEmail(payload.email);
    if (existing) {
      return res.status(StatusCodes.CONFLICT).json({ message: 'Email already in use' });
    }

    const user = await userService.createUser(payload);

    return res.status(StatusCodes.CREATED).json({
      user: userService.toPublicUser(user)
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const credentials = loginSchema.parse(req.body);

    const user = await userService.findByEmail(credentials.email);
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(credentials.password);
    if (!isPasswordValid) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await replaceRefreshToken(user.id, refreshToken, env.REFRESH_TOKEN_EXPIRE);

    const cookieBase = {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'lax' as const
    };

    res
      .cookie('access_token', accessToken, {
        ...cookieBase,
        maxAge: durationToMs(env.ACCESS_TOKEN_EXPIRE)
      })
      .cookie('refresh_token', refreshToken, {
        ...cookieBase,
        maxAge: durationToMs(env.REFRESH_TOKEN_EXPIRE)
      })
      .status(StatusCodes.OK)
      .json({
        user: userService.toPublicUser(user),
        tokens: {
          accessToken,
          refreshToken
        }
      });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenFromCookie = req.cookies?.refresh_token as string | undefined;
    const tokenFromBody = req.body?.refreshToken as string | undefined;

    const refreshTokenValue = tokenFromBody || tokenFromCookie;
    if (!refreshTokenValue) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Refresh token missing' });
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshTokenValue);
    } catch {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid refresh token' });
    }

    const tokenDoc = await verifyStoredToken(payload.sub, refreshTokenValue, 'refresh');
    if (!tokenDoc) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Refresh token invalid or expired' });
    }

    const user = await userService.findById(payload.sub);
    if (!user) {
      await deleteToken(tokenDoc);
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'User no longer exists' });
    }

    await deleteToken(tokenDoc);

    const accessToken = signAccessToken(user.id);
    const newRefreshToken = signRefreshToken(user.id);

    await replaceRefreshToken(user.id, newRefreshToken, env.REFRESH_TOKEN_EXPIRE);

    const cookieBase = {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'lax' as const
    };

    res
      .cookie('access_token', accessToken, {
        ...cookieBase,
        maxAge: durationToMs(env.ACCESS_TOKEN_EXPIRE)
      })
      .cookie('refresh_token', newRefreshToken, {
        ...cookieBase,
        maxAge: durationToMs(env.REFRESH_TOKEN_EXPIRE)
      })
      .status(StatusCodes.OK)
      .json({
        accessToken,
        refreshToken: newRefreshToken
      });
  } catch (error) {
    next(error);
  }
};

export const initiatePasswordReset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = passwordResetInitSchema.parse(req.body);

    const user = await userService.findByEmail(email);
    if (!user) {
      return res.status(StatusCodes.OK).json({ message: 'If the email exists, a reset token has been sent.' });
    }

    const resetToken = createTokenString();
    await storeResetToken(user.id, resetToken, env.PASSWORD_RESET_EXPIRE);

    return res.status(StatusCodes.OK).json({
      message: 'Password reset token generated successfully.',
      resetToken
    });
  } catch (error) {
    next(error);
  }
};

export const completePasswordReset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = passwordResetCompleteSchema.parse(req.body);

    const user = await userService.findByEmail(payload.email);
    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Invalid or expired password reset token.' });
    }

    const tokenDoc = await verifyStoredToken(user.id, payload.token, 'reset');
    if (!tokenDoc) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Invalid or expired password reset token.' });
    }

    await userService.updatePassword(user, payload.password);
    await deleteToken(tokenDoc);
    await invalidateTokens(user.id, 'refresh');

    return res.status(StatusCodes.OK).json({ message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};



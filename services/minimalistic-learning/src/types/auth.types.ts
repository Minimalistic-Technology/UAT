import { z } from 'zod';
import {
  signupSchema,
  loginSchema,
  passwordResetInitSchema,
  passwordResetCompleteSchema,
  refreshSchema
} from '../validators/authValidator';

// ---------------------------------------------------------------------------
// REQUESTS — inferred from Zod validators
// ---------------------------------------------------------------------------

/** Body sent by the user when registering. */
export type SignupBody = z.infer<typeof signupSchema>;

/** Body sent by the user when logging in. */
export type LoginBody = z.infer<typeof loginSchema>;

/** Body sent when requesting a password reset (email only). */
export type PasswordResetInitBody = z.infer<typeof passwordResetInitSchema>;

/** Body sent when completing a password reset (email + token + new password). */
export type PasswordResetCompleteBody = z.infer<typeof passwordResetCompleteSchema>;

/** Body optionally sent when refreshing tokens (alternative to cookie). */
export type RefreshTokenBody = z.infer<typeof refreshSchema>;

// ---------------------------------------------------------------------------
// RESPONSES — shapes of the data returned to the user
// ---------------------------------------------------------------------------

/**
 * The public-safe representation of a user returned in auth responses.
 * Password and internal fields are excluded.
 */
export interface PublicUser {
  _id: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  email: string;
  role: string;
  createdAt: Date;
}

/**
 * Token pair issued on login or refresh.
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Data returned on a successful login.
 */
export interface LoginResponseData {
  user: PublicUser;
  tokens: TokenPair;
}

/**
 * Data returned on a successful signup.
 */
export interface SignupResponseData {
  user: PublicUser;
  tokens: TokenPair;
}

/**
 * Data returned on a successful token refresh.
 */
export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
}

/**
 * Data returned when a password reset is initiated.
 * `resetToken` is included in dev/testing; omit in production (send via email).
 */
export interface PasswordResetInitResponseData {
  resetToken?: string;
}

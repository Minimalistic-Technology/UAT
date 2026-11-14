import crypto from 'crypto';

export function generateOtpCode(): string {
  // 6-digit numeric OTP
  return crypto.randomInt(100000, 1000000).toString();
}

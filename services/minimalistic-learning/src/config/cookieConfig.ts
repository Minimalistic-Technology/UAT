import { env } from './env';

export const getCookieConfig = () => {
  const isDev = env.NODE_ENV === 'development';
  
  return {
    httpOnly: true,
    secure: true, // ALWAYS true for production/staging to ensure HTTPS
    sameSite: "none" as const, // Required for cross-site cookie sharing (Vercel + Render)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
};

import { env } from './env';

export const getCookieConfig = () => {
  const isProd = env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: true, // Always true for HTTPS (Render/Production)
    sameSite: "none" as const, // "none" is required for cross-domain cookies if not proxied
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    // domain: isProd ? '.onrender.com' : undefined, // Optional: share across subdomains
  };
};

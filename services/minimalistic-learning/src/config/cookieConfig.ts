import { env } from './env';

export const getCookieConfig = () => {
  const isDev = env.NODE_ENV === 'development';
  
  return {
    httpOnly: true,
    secure: isDev ? false : true, // Allow HTTP in development, require HTTPS in production
    sameSite: "none" as const,
    domain: undefined // Don't set domain explicitly - let the browser handle it
  };
};

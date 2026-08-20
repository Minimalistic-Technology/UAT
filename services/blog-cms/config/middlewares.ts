import type { Core } from '@strapi/strapi';

// Frontend origins allowed to call this CMS's API, e.g. "https://blog.rajmane.dev,http://localhost:3000".
// Set FRONTEND_ORIGINS in .env - this file never needs to change when the domain changes.
const frontendOrigins = (process.env.FRONTEND_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', ...frontendOrigins],
          'media-src': ["'self'", 'data:', 'blob:', ...frontendOrigins],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: frontendOrigins,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;

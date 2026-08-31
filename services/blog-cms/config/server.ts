import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // Public URL of this CMS as seen from outside the container (behind nginx).
  // Change PUBLIC_URL in .env when the domain changes - nothing else needs to be touched.
  url: env('PUBLIC_URL', 'http://localhost:1337'),
  // Required so Strapi trusts the X-Forwarded-* headers set by the nginx reverse proxy.
  proxy: env.bool('IS_PROXIED', true),
  app: {
    keys: env.array('APP_KEYS')!,
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});

export default config;

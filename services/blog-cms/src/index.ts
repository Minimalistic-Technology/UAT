import type { Core } from '@strapi/strapi';

// Content types + actions the public blog frontend is allowed to read without auth.
// Only "find" and "findOne" are opened up - writes always require an authenticated token.
const PUBLIC_READ_APIS = ['article', 'category', 'author', 'tag'];

async function grantPublicReadAccess(strapi: Core.Strapi) {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) {
    strapi.log.warn('[blog-cms] public role not found, skipping permission bootstrap');
    return;
  }

  for (const apiName of PUBLIC_READ_APIS) {
    for (const action of ['find', 'findOne']) {
      const actionId = `api::${apiName}.${apiName}.${action}`;

      const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
        where: { action: actionId, role: publicRole.id },
      });

      if (!existing) {
        await strapi.db.query('plugin::users-permissions.permission').create({
          data: { action: actionId, role: publicRole.id },
        });
        strapi.log.info(`[blog-cms] granted public access: ${actionId}`);
      }
    }
  }
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await grantPublicReadAccess(strapi);
  },
};

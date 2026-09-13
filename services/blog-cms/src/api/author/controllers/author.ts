import { factories } from '@strapi/strapi';
import { getCache, setCache } from '../../../utils/cache';

const NAMESPACE = 'author';

export default factories.createCoreController('api::author.author', ({ strapi }) => ({
  async find(ctx) {
    const cacheKey = JSON.stringify(ctx.query);
    const cached = await getCache(NAMESPACE, cacheKey);
    if (cached) return cached;

    const result = await super.find(ctx);
    await setCache(NAMESPACE, cacheKey, result);
    return result;
  },

  async findOne(ctx) {
    const cacheKey = `${ctx.params.id}:${JSON.stringify(ctx.query)}`;
    const cached = await getCache(NAMESPACE, cacheKey);
    if (cached) return cached;

    const result = await super.findOne(ctx);
    if (result) await setCache(NAMESPACE, cacheKey, result);
    return result;
  },
}));

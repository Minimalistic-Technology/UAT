import { invalidateNamespace } from '../../../../utils/cache';

// Author data is embedded in cached article responses, so writes here
// must also bust the article cache, not just the author cache.
const invalidate = async () => {
  await Promise.all([invalidateNamespace('author'), invalidateNamespace('article')]);
};

export default {
  afterCreate: invalidate,
  afterCreateMany: invalidate,
  afterUpdate: invalidate,
  afterUpdateMany: invalidate,
  afterDelete: invalidate,
  afterDeleteMany: invalidate,
};

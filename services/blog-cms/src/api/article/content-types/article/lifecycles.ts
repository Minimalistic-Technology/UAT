import { invalidateNamespace } from '../../../../utils/cache';

const invalidate = async () => {
  await invalidateNamespace('article');
};

export default {
  afterCreate: invalidate,
  afterCreateMany: invalidate,
  afterUpdate: invalidate,
  afterUpdateMany: invalidate,
  afterDelete: invalidate,
  afterDeleteMany: invalidate,
  afterPublish: invalidate,
  afterUnpublish: invalidate,
  afterDiscardDraft: invalidate,
};

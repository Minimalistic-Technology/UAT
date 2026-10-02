import cloudinary from '../config/cloudinary';
import Product from '../models/Product';

// Pulls the Cloudinary public_id (e.g. "products/abc123") out of a secure_url so it can be
// passed to uploader.destroy. Returns null for anything not actually hosted on Cloudinary
// (e.g. a manually-pasted external image URL), which must never be sent to destroy().
export const extractCloudinaryPublicId = (url: string): string | null => {
    if (!url || !url.includes('res.cloudinary.com')) return null;
    const afterUpload = url.split('/upload/')[1];
    if (!afterUpload) return null;
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    const withoutExtension = withoutVersion.replace(/\.[a-zA-Z0-9]+$/, '');
    return withoutExtension || null;
};

// Best-effort delete of Cloudinary-hosted images; failures are logged, not thrown, so a
// Cloudinary outage never blocks the delete/update operation that triggered the cleanup.
export const deleteCloudinaryImages = async (urls: string[]) => {
    const publicIds = Array.from(new Set(urls.map(extractCloudinaryPublicId).filter((id): id is string => Boolean(id))));
    if (!publicIds.length) return;
    await Promise.all(publicIds.map(async (id) => {
        try {
            await cloudinary.uploader.destroy(id);
        } catch (err) {
            console.error(`Failed to delete Cloudinary image "${id}":`, err);
        }
    }));
};

// Some records (e.g. a QuotationItem) can end up holding the *exact same* Cloudinary URL as
// a live Product — the "Prefill from Product" flow copies `product.image` verbatim rather
// than re-uploading it. Deleting such a URL from Cloudinary would silently break the
// product's own listing. Call this before deleting any image whose ownership isn't
// guaranteed to be exclusive to the record being cleaned up.
export const isImageUsedByAnyProduct = async (url: string): Promise<boolean> => {
    if (!url) return false;
    const product = await Product.findOne({ $or: [{ image: url }, { images: url }] }).select('_id').lean();
    return Boolean(product);
};

// Filters a list of candidate URLs down to the ones safe to delete — i.e. not currently
// referenced by any Product — then deletes those from Cloudinary.
export const deleteCloudinaryImagesNotUsedByProducts = async (urls: string[]) => {
    const candidates = urls.filter(Boolean);
    if (!candidates.length) return;
    const usageChecks = await Promise.all(candidates.map(async (url) => ({ url, inUse: await isImageUsedByAnyProduct(url) })));
    const safeToDelete = usageChecks.filter((c) => !c.inUse).map((c) => c.url);
    await deleteCloudinaryImages(safeToDelete);
};

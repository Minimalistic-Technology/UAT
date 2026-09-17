import axios from 'axios';
import FormData from 'form-data';

const getBaseUrl = () => (process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');

const getHeaders = (extra: Record<string, string> = {}) => ({
    Authorization: `Bearer ${process.env.STRAPI_API_TOKEN || ''}`,
    ...extra
});

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 200) || `item-${Date.now()}`;

export interface StrapiBlock {
    type: string;
    children: Array<{ type: string; text: string }>;
}

export interface StrapiArticle {
    documentId: string;
    title: string;
    slug: string;
    content: StrapiBlock[];
    author?: { name: string } | null;
    tags?: Array<{ name: string }>;
    cover?: { url: string } | null;
    createdAt: string;
    updatedAt: string;
}

export interface BlogDTO {
    _id: string;
    title: string;
    content: string;
    author: string;
    image: string;
    slug: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

class StrapiService {
    /** Converts a plain-text blog body into Strapi's rich-text "blocks" format (one paragraph per line). */
    static textToBlocks(text: string): StrapiBlock[] {
        const lines = (text || '').split('\n').filter((line) => line.trim().length > 0);
        if (lines.length === 0) {
            return [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }];
        }
        return lines.map((line) => ({ type: 'paragraph', children: [{ type: 'text', text: line }] }));
    }

    /** Flattens Strapi's rich-text "blocks" format back into plain text for the admin textarea. */
    static blocksToText(blocks: StrapiBlock[] | undefined): string {
        if (!Array.isArray(blocks)) return '';
        return blocks
            .map((block) => (block.children || []).map((child) => child.text || '').join(''))
            .join('\n');
    }

    static mediaUrl(cover: { url: string } | null | undefined): string {
        if (!cover?.url) return '';
        return cover.url.startsWith('http') ? cover.url : `${getBaseUrl()}${cover.url}`;
    }

    static toBlogDTO(article: StrapiArticle): BlogDTO {
        return {
            _id: article.documentId,
            title: article.title,
            content: StrapiService.blocksToText(article.content),
            author: article.author?.name || '',
            image: StrapiService.mediaUrl(article.cover),
            slug: article.slug,
            tags: (article.tags || []).map((tag) => tag.name),
            createdAt: article.createdAt,
            updatedAt: article.updatedAt
        };
    }

    /** Finds an author/tag by exact name (case-insensitive) in the given collection, creating it if missing. */
    static async findOrCreateRelation(collection: 'authors' | 'tags', name: string): Promise<string> {
        const trimmed = name.trim();
        const existing = await axios.get(`${getBaseUrl()}/api/${collection}`, {
            headers: getHeaders(),
            params: { 'filters[name][$eqi]': trimmed, 'fields[0]': 'name' }
        });
        const found = existing.data?.data?.[0];
        if (found) return found.documentId;

        const created = await axios.post(
            `${getBaseUrl()}/api/${collection}`,
            { data: { name: trimmed, slug: slugify(trimmed) } },
            { headers: getHeaders({ 'Content-Type': 'application/json' }) }
        );
        return created.data.data.documentId;
    }

    static async findOrCreateTagIds(tagNames: string[]): Promise<string[]> {
        const ids: string[] = [];
        for (const name of tagNames || []) {
            if (!name.trim()) continue;
            ids.push(await StrapiService.findOrCreateRelation('tags', name));
        }
        return ids;
    }

    /** Downloads an image from an external URL and uploads it into Strapi's media library, returning the file id. */
    static async uploadImageFromUrl(imageUrl: string): Promise<number | null> {
        if (!/^https?:\/\//i.test(imageUrl)) return null;

        const download = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 15000,
            maxContentLength: 15 * 1024 * 1024
        });
        const contentType = String(download.headers['content-type'] || 'image/jpeg');
        const filename = imageUrl.split('/').pop()?.split('?')[0] || `cover-${Date.now()}.jpg`;

        const form = new FormData();
        form.append('files', Buffer.from(download.data), { filename, contentType });

        const uploaded = await axios.post(`${getBaseUrl()}/api/upload`, form, {
            headers: getHeaders(form.getHeaders())
        });
        return uploaded.data?.[0]?.id ?? null;
    }

    static async listArticles(): Promise<StrapiArticle[]> {
        const res = await axios.get(`${getBaseUrl()}/api/articles`, {
            headers: getHeaders(),
            params: { populate: 'cover,author,tags', sort: 'createdAt:desc', 'pagination[pageSize]': 100 }
        });
        return res.data.data;
    }

    static async getArticleByDocumentId(documentId: string): Promise<StrapiArticle | null> {
        try {
            const res = await axios.get(`${getBaseUrl()}/api/articles/${documentId}`, {
                headers: getHeaders(),
                params: { populate: 'cover,author,tags' }
            });
            return res.data.data;
        } catch (err: any) {
            if (err.response?.status === 404) return null;
            throw err;
        }
    }

    static async getArticleBySlug(slug: string): Promise<StrapiArticle | null> {
        const res = await axios.get(`${getBaseUrl()}/api/articles`, {
            headers: getHeaders(),
            params: { 'filters[slug][$eq]': slug, populate: 'cover,author,tags' }
        });
        return res.data.data?.[0] ?? null;
    }

    static async createArticle(input: {
        title: string;
        content: string;
        author: string;
        image?: string;
        slug: string;
        tags?: string[];
    }): Promise<StrapiArticle> {
        const [authorId, tagIds, coverId] = await Promise.all([
            StrapiService.findOrCreateRelation('authors', input.author),
            StrapiService.findOrCreateTagIds(input.tags || []),
            input.image ? StrapiService.uploadImageFromUrl(input.image) : Promise.resolve(null)
        ]);

        const res = await axios.post(
            `${getBaseUrl()}/api/articles`,
            {
                data: {
                    title: input.title,
                    slug: input.slug,
                    content: StrapiService.textToBlocks(input.content),
                    author: authorId,
                    tags: tagIds,
                    ...(coverId ? { cover: coverId } : {})
                }
            },
            { headers: getHeaders({ 'Content-Type': 'application/json' }) }
        );
        return res.data.data;
    }

    static async updateArticle(
        documentId: string,
        input: { title: string; content: string; author: string; image?: string; slug: string; tags?: string[] }
    ): Promise<StrapiArticle> {
        const current = await StrapiService.getArticleByDocumentId(documentId);
        const currentImageUrl = current ? StrapiService.mediaUrl(current.cover) : '';

        const [authorId, tagIds] = await Promise.all([
            StrapiService.findOrCreateRelation('authors', input.author),
            StrapiService.findOrCreateTagIds(input.tags || [])
        ]);

        let coverUpdate: Record<string, unknown> = {};
        if (!input.image) {
            coverUpdate = { cover: null };
        } else if (input.image !== currentImageUrl) {
            const coverId = await StrapiService.uploadImageFromUrl(input.image);
            if (coverId) coverUpdate = { cover: coverId };
        }

        const res = await axios.put(
            `${getBaseUrl()}/api/articles/${documentId}`,
            {
                data: {
                    title: input.title,
                    slug: input.slug,
                    content: StrapiService.textToBlocks(input.content),
                    author: authorId,
                    tags: tagIds,
                    ...coverUpdate
                }
            },
            { headers: getHeaders({ 'Content-Type': 'application/json' }) }
        );
        return res.data.data;
    }

    static async deleteArticle(documentId: string): Promise<void> {
        await axios.delete(`${getBaseUrl()}/api/articles/${documentId}`, { headers: getHeaders() });
    }
}

export default StrapiService;

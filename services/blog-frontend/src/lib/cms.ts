// Change NEXT_PUBLIC_CMS_URL in .env when the CMS domain changes.
const PUBLIC_CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:1337';
// Use internal Docker URL for server-side fetches if configured, otherwise fallback to public URL
const INTERNAL_CMS_URL = process.env.INTERNAL_CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:1337';

export type StrapiMedia = {
  url: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
};

export type StrapiBlock = {
  type: string;
  level?: number;
  format?: string;
  children: Array<{ type: string; text?: string; bold?: boolean; italic?: boolean; [key: string]: unknown }>;
  [key: string]: unknown;
};

export type Article = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: StrapiBlock[];
  publishedAt: string;
  cover?: StrapiMedia | null;
  author?: { name: string; slug: string; avatar?: StrapiMedia | null } | null;
  category?: { name: string; slug: string } | null;
  tags?: Array<{ name: string; slug: string }>;
  seo?: { metaTitle?: string; metaDescription?: string } | null;
};

export function mediaUrl(media?: StrapiMedia | null): string | null {
  if (!media?.url) return null;
  return media.url.startsWith('http') ? media.url : `${PUBLIC_CMS_URL}${media.url}`;
}

async function cmsFetch<T>(path: string, revalidateSeconds = 60): Promise<T> {
  const res = await fetch(`${INTERNAL_CMS_URL}/api${path}`, {
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    throw new Error(`CMS request failed (${res.status}): ${path}`);
  }

  return res.json();
}

const ARTICLE_POPULATE =
  'populate[cover]=true&populate[author][populate]=avatar&populate[category]=true&populate[tags]=true&populate[seo][populate]=shareImage';

export async function getArticles(): Promise<Article[]> {
  try {
    const data = await cmsFetch<{ data: Article[] }>(
      `/articles?${ARTICLE_POPULATE}&sort=publishedAt:desc`
    );
    return data?.data ?? [];
  } catch (error) {
    console.error('Failed to fetch articles from CMS:', error);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const data = await cmsFetch<{ data: Article[] }>(
      `/articles?filters[slug][$eq]=${encodeURIComponent(slug)}&${ARTICLE_POPULATE}`
    );
    return data?.data?.[0] ?? null;
  } catch (error) {
    console.error(`Failed to fetch article with slug "${slug}" from CMS:`, error);
    return null;
  }
}

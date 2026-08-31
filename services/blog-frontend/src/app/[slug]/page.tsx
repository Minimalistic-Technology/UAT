import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticleBySlug, mediaUrl } from '@/lib/cms';
import BlocksRenderer from '@/components/BlocksRenderer';

// The CMS isn't reachable at Docker build time, so this page renders per-request
// instead of being statically prerendered; the fetch in lib/cms.ts still revalidates.
export const dynamic = 'force-dynamic';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return {};

  return {
    title: article.seo?.metaTitle || article.title,
    description: article.seo?.metaDescription || article.excerpt,
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const cover = mediaUrl(article.cover);

  return (
    <main>
      <article>
        <h1>{article.title}</h1>
        {article.author && <p>By {article.author.name}</p>}
        {article.category && <p>{article.category.name}</p>}
        {cover && (
          <Image
            src={cover}
            alt={article.cover?.alternativeText || article.title}
            width={960}
            height={540}
            priority
          />
        )}
        <BlocksRenderer content={article.content} />
        {!!article.tags?.length && (
          <ul>
            {article.tags.map((tag) => (
              <li key={tag.slug}>{tag.name}</li>
            ))}
          </ul>
        )}
      </article>
    </main>
  );
}

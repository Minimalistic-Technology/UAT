import Image from 'next/image';
import Link from 'next/link';
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
    <article className="article">
      <Link href="/" className="article__back">
        &larr; Back to articles
      </Link>
      <h1 className="article__title">{article.title}</h1>
      <div className="article__meta">
        {article.author && <span>By {article.author.name}</span>}
        {article.category && <span className="badge">{article.category.name}</span>}
      </div>
      {cover && (
        <div className="article__cover">
          <Image
            src={cover}
            alt={article.cover?.alternativeText || article.title}
            width={960}
            height={540}
            priority
          />
        </div>
      )}
      <BlocksRenderer content={article.content} />
      {!!article.tags?.length && (
        <ul className="tag-list">
          {article.tags.map((tag) => (
            <li key={tag.slug}>{tag.name}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

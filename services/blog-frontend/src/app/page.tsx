import Link from 'next/link';
import Image from 'next/image';
import { getArticles, mediaUrl } from '@/lib/cms';

// The CMS isn't reachable at Docker build time, so this page renders per-request
// instead of being statically prerendered; the fetch in lib/cms.ts still revalidates.
export const dynamic = 'force-dynamic';

export default async function BlogIndexPage() {
  const articles = await getArticles();

  return (
    <>
      <h1 className="page-title">Blog</h1>
      <p className="page-lead">Insights, updates, and stories from the DDTEC team.</p>

      {articles.length === 0 && (
        <p className="empty-state">No articles published yet.</p>
      )}

      <ul className="article-list">
        {articles.map((article) => {
          const cover = mediaUrl(article.cover);
          return (
            <li key={article.id} className="article-card">
              <Link href={`/${article.slug}`}>
                {cover && (
                  <div className="article-card__media">
                    <Image
                      src={cover}
                      alt={article.cover?.alternativeText || article.title}
                      width={480}
                      height={270}
                    />
                  </div>
                )}
                <div className="article-card__body">
                  <h2 className="article-card__title">{article.title}</h2>
                  {article.excerpt && (
                    <p className="article-card__excerpt">{article.excerpt}</p>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

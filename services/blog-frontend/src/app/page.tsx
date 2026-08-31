import Link from 'next/link';
import Image from 'next/image';
import { getArticles, mediaUrl } from '@/lib/cms';

// The CMS isn't reachable at Docker build time, so this page renders per-request
// instead of being statically prerendered; the fetch in lib/cms.ts still revalidates.
export const dynamic = 'force-dynamic';

export default async function BlogIndexPage() {
  const articles = await getArticles();

  return (
    <main>
      <h1>Blog</h1>
      {articles.length === 0 && <p>No articles published yet.</p>}
      <ul>
        {articles.map((article) => {
          const cover = mediaUrl(article.cover);
          return (
            <li key={article.id}>
              <Link href={`/${article.slug}`}>
                {cover && (
                  <Image
                    src={cover}
                    alt={article.cover?.alternativeText || article.title}
                    width={480}
                    height={270}
                  />
                )}
                <h2>{article.title}</h2>
                {article.excerpt && <p>{article.excerpt}</p>}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

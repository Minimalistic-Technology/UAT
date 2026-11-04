import { notFound } from 'next/navigation';
import ClickableLink from '@/components/ClickableLink';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010/api';

interface PublicProfile {
  profile: { username: string; displayName: string; bio: string; avatarUrl: string };
  links: { id: string; type: 'link' | 'pdf'; title: string; url: string; thumbnailUrl: string }[];
}

async function getProfile(username: string): Promise<PublicProfile | null> {
  const res = await fetch(`${API_URL}/public/${username}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const data = await getProfile(params.username);
  if (!data) notFound();

  const { profile, links } = data;

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 to-white px-4 py-16">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="h-24 w-24 overflow-hidden rounded-full bg-brand-100 flex items-center justify-center text-2xl font-semibold text-brand-700">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" />
          ) : (
            (profile.displayName || profile.username).charAt(0).toUpperCase()
          )}
        </div>
        <h1 className="mt-4 text-xl font-semibold text-gray-900">
          {profile.displayName || `@${profile.username}`}
        </h1>
        <p className="text-sm text-gray-500">@{profile.username}</p>
        {profile.bio ? <p className="mt-2 text-center text-sm text-gray-600">{profile.bio}</p> : null}

        <div className="mt-8 flex w-full flex-col gap-3">
          {links.length === 0 ? (
            <p className="text-center text-sm text-gray-400">No links yet.</p>
          ) : (
            links.map((link) => (
              <ClickableLink key={link.id} username={profile.username} link={link} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}

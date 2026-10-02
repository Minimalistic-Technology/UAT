'use client';

import { publicApi } from '@/lib/api';

interface Props {
  username: string;
  link: { id: string; type: 'link' | 'pdf'; title: string; url: string; thumbnailUrl: string };
}

export default function ClickableLink({ username, link }: Props) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => publicApi.trackClick(username, link.id)}
      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition hover:border-brand-400 hover:shadow"
    >
      <span>{link.type === 'pdf' ? '📄' : '🔗'}</span>
      <span className="truncate">{link.title}</span>
    </a>
  );
}

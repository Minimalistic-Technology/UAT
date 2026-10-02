'use client';

import { useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { linksApi, uploadApi } from '@/lib/api';
import { LinkItem } from '@/lib/types';
import { linkSchema } from '@/lib/validations';

export default function LinkManager() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [mode, setMode] = useState<'link' | 'pdf'>('link');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    linksApi
      .list()
      .then((res) => setLinks(res.links))
      .catch(() => setError('Could not load links'))
      .finally(() => setLoading(false));
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const result = await uploadApi.upload(file);
      setUrl(result.url);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    } catch (err) {
      setError(isAxiosError(err) ? err.response?.data?.message || 'Upload failed' : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const parsed = linkSchema.safeParse({ type: mode, title, url });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Invalid link');
      return;
    }

    setSubmitting(true);
    try {
      const { link } = await linksApi.create(parsed.data);
      setLinks((prev) => [...prev, link]);
      setTitle('');
      setUrl('');
    } catch (err) {
      setError(isAxiosError(err) ? err.response?.data?.message || 'Could not add link' : 'Could not add link');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const prev = links;
    setLinks((cur) => cur.filter((l) => l._id !== id));
    try {
      await linksApi.remove(id);
    } catch {
      setLinks(prev);
      setError('Could not delete link');
    }
  }

  async function handleToggleActive(link: LinkItem) {
    const next = !link.isActive;
    setLinks((cur) => cur.map((l) => (l._id === link._id ? { ...l, isActive: next } : l)));
    try {
      await linksApi.update(link._id, { isActive: next });
    } catch {
      setLinks((cur) => cur.map((l) => (l._id === link._id ? { ...l, isActive: !next } : l)));
      setError('Could not update link');
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="text-base font-semibold text-gray-900">Your links</h2>

      <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-3 rounded-xl border border-dashed border-gray-300 p-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('link')}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              mode === 'link' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Link
          </button>
          <button
            type="button"
            onClick={() => setMode('pdf')}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              mode === 'pdf' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            PDF
          </button>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />

        {mode === 'link' ? (
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : url ? 'Replace PDF' : 'Upload PDF'}
            </button>
            {url ? <span className="text-xs text-green-600">PDF ready</span> : null}
            <input ref={fileInputRef} type="file" accept="application/pdf" hidden onChange={handleFileUpload} />
          </div>
        )}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting || uploading}
          className="self-start rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? 'Adding…' : 'Add'}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-3">
        {loading ? (
          <p className="text-sm text-gray-400">Loading links…</p>
        ) : links.length === 0 ? (
          <p className="text-sm text-gray-400">No links yet — add your first one above.</p>
        ) : (
          links.map((link) => (
            <div
              key={link._id}
              className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  {link.type === 'pdf' ? '📄 ' : '🔗 '}
                  {link.title}
                </p>
                <p className="truncate text-xs text-gray-400">{link.url}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => handleToggleActive(link)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    link.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {link.isActive ? 'Active' : 'Hidden'}
                </button>
                <button
                  onClick={() => handleDelete(link._id)}
                  className="rounded-full px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

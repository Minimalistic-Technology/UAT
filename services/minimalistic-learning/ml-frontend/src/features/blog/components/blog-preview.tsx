import React from "react";

interface BlogPreviewProps {
  title: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  tags: string[];
}

export const BlogPreview: React.FC<BlogPreviewProps> = ({
  title,
  content,
  excerpt,
  coverImageUrl,
  tags,
}) => {
  const safeTags = Array.isArray(tags) ? tags : [];

  return (
    <div className="h-full w-full bg-white">
      <div className="w-full space-y-12 px-8 py-16 md:px-24">
        <div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-4">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
          <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
            Live Preview
          </h2>
        </div>

        {coverImageUrl ? (
          <div className="aspect-[2/1] w-full overflow-hidden rounded-2xl border border-gray-200/50 bg-gray-100 shadow-md transition-all duration-300 hover:shadow-lg sm:aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImageUrl}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="group flex aspect-[2/1] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-100 to-gray-50 text-gray-400 transition-colors hover:border-emerald-500/30 sm:aspect-video">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mb-3 h-10 w-10 opacity-50 transition-colors group-hover:text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm font-medium tracking-wide">
              No Cover Image
            </span>
          </div>
        )}

        <div className="space-y-4">
          {safeTags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {safeTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-full border border-emerald-200/50 bg-emerald-100/50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur-sm transition-all"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="font-sans text-3xl leading-[1.15] font-extrabold tracking-tight break-words text-gray-900 sm:text-4xl md:text-5xl">
            {title || <span className="text-gray-300">Your Blog Title...</span>}
          </h1>
        </div>

        {excerpt && (
          <p className="rounded-r-xl border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50/80 to-transparent py-2 pl-5 text-lg leading-relaxed text-gray-600 italic shadow-sm">
            {excerpt}
          </p>
        )}

        <style>{`
 .ql-editor img {
 max-width: 100%;
 height: auto;
 margin-left: 0;
 margin-right: auto;
 }
 /* Override Tailwind Typography default width: 100% */
 .prose img {
 width: auto; 
 }
 `}</style>

        <div
          className="ql-editor prose prose-lg prose-emerald prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-4xl prose-h2:text-3xl prose-a:text-emerald-600 prose-a:decoration-emerald-500/30 hover:prose-a:decoration-emerald-500 prose-img:rounded-2xl prose-img:shadow-lg prose-pre:bg-gray-100 prose-pre:border prose-pre:border-gray-200 prose-p:mt-0 prose-p:mb-2 prose-p:leading-snug prose-headings:mt-6 prose-headings:mb-2 max-w-none pt-4"
          dangerouslySetInnerHTML={{
            __html:
              content ||
              "<p class='text-gray-400 italic'>Start writing to see your content preview here...</p>",
          }}
        />
      </div>
    </div>
  );
};

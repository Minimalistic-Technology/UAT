import React from 'react';

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
  return (
    <div className="w-full h-full bg-white">
      <div className="w-full px-8 md:px-24 py-16 space-y-12">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Live Preview
          </h2>
        </div>

        {coverImageUrl ? (
          <div className="w-full aspect-[2/1] sm:aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-gray-200/50 shadow-md transition-all duration-300 hover:shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full aspect-[2/1] sm:aspect-video rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 transition-colors hover:border-emerald-500/30 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 opacity-50 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium tracking-wide">No Cover Image</span>
          </div>
        )}

        <div className="space-y-4">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-emerald-100/50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200/50 backdrop-blur-sm shadow-sm transition-all hover:scale-105">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-[1.15] tracking-tight break-words font-sans">
            {title || <span className="text-gray-300">Your Blog Title...</span>}
          </h1>
        </div>

        {excerpt && (
          <p className="text-lg text-gray-600 leading-relaxed italic border-l-4 border-emerald-500 pl-5 py-2 bg-gradient-to-r from-emerald-50/80 to-transparent rounded-r-xl shadow-sm">
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
          className="ql-editor prose prose-lg max-w-none pt-4 prose-emerald prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-4xl prose-h2:text-3xl prose-a:text-emerald-600 prose-a:decoration-emerald-500/30 hover:prose-a:decoration-emerald-500 prose-img:rounded-2xl prose-img:shadow-lg prose-pre:bg-gray-100 prose-pre:border prose-pre:border-gray-200 prose-p:mt-0 prose-p:mb-2 prose-p:leading-snug prose-headings:mt-6 prose-headings:mb-2"
          dangerouslySetInnerHTML={{ __html: content || "<p class='text-gray-400 italic'>Start writing to see your content preview here...</p>" }}
        />
      </div>
    </div>
  );
};

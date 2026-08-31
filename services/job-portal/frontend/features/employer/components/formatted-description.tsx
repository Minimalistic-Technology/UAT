export function FormattedDescription({ text }: { text: string }) {
  if (!text) return null;

  // Check if text is HTML (saved by RichTextEditor)
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(text);

  if (isHtml) {
    return (
      <div
        className="text-muted-foreground space-y-2 text-[15px] leading-relaxed [&_a]:break-words [&_a]:text-blue-600 [&_a]:underline dark:[&_a]:text-blue-400 [&_a:hover]:text-blue-800 dark:[&_a:hover]:text-blue-300 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-slate-900 dark:[&>h1]:text-white [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-slate-800 dark:[&>h2]:text-slate-100 [&>h3]:text-lg [&>h3]:font-bold [&>ol]:list-decimal [&>ol]:pl-5 [&>ol>li]:mb-1 [&>p]:mb-3 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mb-1"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }

  // Check if text contains markdown headers (###), bold (**), or list items (- )
  const isMarkdown = /^(?:#{1,6}\s|\s*[-*]\s|\s*\*\*)/m.test(text);

  if (isMarkdown) {
    let parsedHtml = text
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold text-slate-900 dark:text-white mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-slate-900 dark:text-white">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>');

    const lines = parsedHtml.split('\n');
    const output: string[] = [];
    let inList = false;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.startsWith('- ') || line.startsWith('* ')) {
        if (!inList) {
          output.push('<ul class="list-disc pl-5 my-2 space-y-1">');
          inList = true;
        }
        output.push(`<li>${line.slice(2)}</li>`);
      } else {
        if (inList) {
          output.push('</ul>');
          inList = false;
        }
        if (line.length > 0) {
          if (!line.startsWith('<h1') && !line.startsWith('<h2') && !line.startsWith('<h3') && !line.startsWith('<ul')) {
            output.push(`<p class="mb-3 leading-relaxed">${line}</p>`);
          } else {
            output.push(line);
          }
        }
      }
    }
    if (inList) {
      output.push('</ul>');
    }

    return (
      <div
        className="text-muted-foreground space-y-2 text-[15px] leading-relaxed [&_a]:break-words [&_a]:text-blue-600 [&_a]:underline dark:[&_a]:text-blue-400 [&_a:hover]:text-blue-800 dark:[&_a:hover]:text-blue-300 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-slate-900 dark:[&>h1]:text-white [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-slate-800 dark:[&>h2]:text-slate-100 [&>h3]:text-lg [&>h3]:font-bold [&>ol]:list-decimal [&>ol]:pl-5 [&>ol>li]:mb-1 [&>p]:mb-3 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mb-1"
        dangerouslySetInnerHTML={{ __html: output.join('\n') }}
      />
    );
  }

  // Split on numbered points like "1. ", "2. ", etc. (fallback for legacy plaintext)
  const numberedPattern = /(?=\d+\.\s)/;
  const parts = text.split(numberedPattern).filter(Boolean);

  // Check if it looks like "Key: Value" metadata
  const isMetaLine = (s: string) => /^[A-Z][A-Za-z\s]+:\s/.test(s.trim());

  return (
    <div className="text-muted-foreground space-y-2 text-sm leading-relaxed">
      {parts.map((part, i) => {
        const trimmed = part.trim();

        // Numbered bullet: "1. Some text"
        const numberedMatch = trimmed.match(/^(\d+)\.\s+([\s\S]+)/);
        if (numberedMatch) {
          // Further split on metadata lines embedded at the end
          const body = numberedMatch[2];
          const metaStart = body.search(
            /\b(Role|Industry Type|Department|Employment Type|Role Category|Education)\s*:/,
          );

          if (metaStart !== -1) {
            const prose = body.slice(0, metaStart).trim();
            const metaBlock = body.slice(metaStart).trim();
            const metaLines = metaBlock
              .split(/(?=[A-Z][A-Za-z\s]+:\s)/)
              .filter(Boolean);

            return (
              <div key={i}>
                {prose && (
                  <p>
                    <span className="text-foreground font-medium">
                      {numberedMatch[1]}.
                    </span>{" "}
                    {prose}
                  </p>
                )}
                <div className="bg-muted/40 mt-3 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 rounded-md border p-3">
                  {metaLines.map((line, j) => {
                    const colonIdx = line.indexOf(":");
                    if (colonIdx === -1) return null;
                    const key = line.slice(0, colonIdx).trim();
                    const val = line.slice(colonIdx + 1).trim();
                    return (
                      <>
                        <span
                          key={`k-${j}`}
                          className="text-foreground font-medium"
                        >
                          {key}
                        </span>
                        <span key={`v-${j}`}>{val}</span>
                      </>
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <p key={i}>
              <span className="text-foreground font-medium">
                {numberedMatch[1]}.
              </span>{" "}
              {body}
            </p>
          );
        }

        // Plain prose or intro line
        return <p key={i}>{trimmed}</p>;
      })}
    </div>
  );
}

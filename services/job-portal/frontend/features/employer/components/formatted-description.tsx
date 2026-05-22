export function FormattedDescription({ text }: { text: string }) {
  // Split on numbered points like "1. ", "2. ", etc.
  const numberedPattern = /(?=\d+\.\s)/;
  const parts = text.split(numberedPattern).filter(Boolean);

  // Check if it looks like "Key: Value" metadata
  const isMetaLine = (s: string) =>
    /^[A-Z][A-Za-z\s]+:\s/.test(s.trim());

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
                    <span className="font-medium text-foreground">
                      {numberedMatch[1]}.
                    </span>{" "}
                    {prose}
                  </p>
                )}
                <div className="mt-3 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 rounded-md border bg-muted/40 p-3">
                  {metaLines.map((line, j) => {
                    const colonIdx = line.indexOf(":");
                    if (colonIdx === -1) return null;
                    const key = line.slice(0, colonIdx).trim();
                    const val = line.slice(colonIdx + 1).trim();
                    return (
                      <>
                        <span key={`k-${j}`} className="font-medium text-foreground">
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
              <span className="font-medium text-foreground">
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
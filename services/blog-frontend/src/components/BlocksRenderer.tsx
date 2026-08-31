import type { StrapiBlock } from '@/lib/cms';

function renderInline(children: StrapiBlock['children'], keyPrefix: string) {
  return children.map((child, i) => {
    const key = `${keyPrefix}-${i}`;
    let node: React.ReactNode = child.text ?? '';
    if (child.bold) node = <strong key={key}>{node}</strong>;
    if (child.italic) node = <em key={key}>{node}</em>;
    return <span key={key}>{node}</span>;
  });
}

export default function BlocksRenderer({ content }: { content: StrapiBlock[] }) {
  if (!content?.length) return null;

  return (
    <div className="prose">
      {content.map((block, i) => {
        const key = `block-${i}`;
        const inline = renderInline(block.children, key);

        switch (block.type) {
          case 'heading': {
            const Tag = `h${block.level ?? 2}` as keyof JSX.IntrinsicElements;
            return <Tag key={key}>{inline}</Tag>;
          }
          case 'list': {
            const Tag = block.format === 'ordered' ? 'ol' : 'ul';
            return (
              <Tag key={key}>
                {(block.children as unknown as { children: StrapiBlock['children'] }[]).map(
                  (item, j) => <li key={`${key}-${j}`}>{renderInline(item.children, `${key}-${j}`)}</li>
                )}
              </Tag>
            );
          }
          case 'quote':
            return <blockquote key={key}>{inline}</blockquote>;
          case 'paragraph':
          default:
            return <p key={key}>{inline}</p>;
        }
      })}
    </div>
  );
}

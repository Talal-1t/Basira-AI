/**
 * Splits a line on **bold** markers and returns an array of strings and
 * <strong> elements. No HTML parsing involved — safe by construction.
 */
function renderInline(line, keyPrefix) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-semibold text-text">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

/**
 * Renders AI reply text as React nodes: consecutive "- "/"* " lines become a
 * bullet list, everything else becomes paragraphs, and **bold** works
 * within both. Intentionally minimal — this is chat text, not a document.
 */
export function renderChatText(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const blocks = [];
  let currentList = null;

  lines.forEach((line, i) => {
    const bulletMatch = /^\s*[-*]\s+(.*)/.exec(line);
    if (bulletMatch) {
      if (!currentList) {
        currentList = { type: 'list', items: [] };
        blocks.push(currentList);
      }
      currentList.items.push(bulletMatch[1]);
    } else {
      currentList = null;
      if (line.trim() === '') {
        blocks.push({ type: 'break' });
      } else {
        blocks.push({ type: 'paragraph', text: line });
      }
    }
  });

  return blocks.map((block, i) => {
    if (block.type === 'list') {
      return (
        <ul key={i} className="my-1.5 list-disc ps-4 space-y-1">
          {block.items.map((item, j) => (
            <li key={j}>{renderInline(item, `${i}-${j}`)}</li>
          ))}
        </ul>
      );
    }
    if (block.type === 'break') {
      return <div key={i} className="h-2" />;
    }
    return (
      <p key={i} className="leading-relaxed">
        {renderInline(block.text, `${i}`)}
      </p>
    );
  });
}

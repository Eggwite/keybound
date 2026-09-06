'use client';

import * as React from 'react';
import { highlight } from 'sugar-high';
import { Check, Copy } from 'lucide-react';

export function CodeBlock({
  code,
  label = 'tsx',
  className = '',
}: {
  code: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Fallback
    }
  };

  const highlightedHtml = React.useMemo(() => {
    return highlight(code);
  }, [code]);

  return (
    <div className={`code-card ${className}`}>
      <div className="code-card__header">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-faint" />
          <span className="font-mono text-[11px] font-medium text-charcoal">{label}</span>
        </div>
        <button
          onClick={onCopy}
          aria-label="Copy code snippet"
          className="copy-btn"
          title="Copy to clipboard"
        >
          {copied ? <Check className="size-3.5 text-grass" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      <pre dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
    </div>
  );
}

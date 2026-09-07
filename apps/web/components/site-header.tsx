'use client';

import * as React from 'react';
import Link from 'next/link';
import { Github, Check, Copy } from 'lucide-react';

export function KeyboundLogo({ className = 'size-5' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[6px] bg-ink text-white shadow-xs transition-transform group-hover:scale-105 border border-black/15 shrink-0 ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-3.5">
        {/* Stylized Keycap Stem & Diagonals (K) */}
        <path
          d="M6 4V14M6 9.2L12.5 4.5M7.8 8L13 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Mnemonic Underline Bar in Ember Accent */}
        <path d="M4.5 16.5H13.5" stroke="var(--ember)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function SiteHeader() {
  const [copiedAgents, setCopiedAgents] = React.useState(false);

  const copyAgents = async () => {
    try {
      await navigator.clipboard.writeText('https://keybound.eggwite.moe/agents.md');
      setCopiedAgents(true);
      setTimeout(() => setCopiedAgents(false), 1600);
    } catch {
      // Ignore
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone bg-canvas/85 backdrop-blur-md">
      <div className="shell flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-[14px] font-semibold tracking-tight text-ink group"
          >
            <KeyboundLogo className="size-5" />
            <span>keybound</span>
          </Link>
          <span className="rounded-full border border-stone bg-white px-2 py-0.5 font-mono text-[10px] text-muted">
            v0.1.1
          </span>
        </div>

        <nav className="flex items-center gap-4 text-[12.5px] font-medium text-muted">
          <Link href="/docs" className="hover:text-ink transition-colors">
            Docs
          </Link>
          <Link href="/docs/examples" className="hover:text-ink transition-colors">
            Examples
          </Link>
          <button
            onClick={copyAgents}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2 py-1 font-mono text-[11px] text-charcoal shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-sand cursor-pointer"
            title="Copy reference instructions link"
          >
            <span>agents.md</span>
            {copiedAgents ? (
              <Check className="size-3 text-grass" />
            ) : (
              <Copy className="size-3 text-muted" />
            )}
          </button>
          <a
            href="https://github.com/Eggwite/keybound"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-charcoal hover:text-ink transition-colors"
            title="GitHub repository"
          >
            <Github className="size-4" />
          </a>
        </nav>
      </div>
    </header>
  );
}

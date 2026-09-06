import * as React from 'react';
import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-stone py-10 bg-canvas mt-auto">
      <div className="shell flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-muted">
        <span>MIT © 2026 Eggwite. Built for the React ecosystem.</span>
        <div className="flex items-center gap-5">
          <Link href="/docs" className="hover:text-ink">
            Documentation
          </Link>
          <Link href="/agents.md" className="hover:text-ink">
            agents.md
          </Link>
          <a
            href="https://github.com/Eggwite/keybound"
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/react-keybound"
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink"
          >
            npm
          </a>
        </div>
      </div>
    </footer>
  );
}

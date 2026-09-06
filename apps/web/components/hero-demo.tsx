'use client';

import * as React from 'react';
import { ArrowUpRight, Eye, Keyboard, Radio } from 'lucide-react';
import { KeyboundOverlay, KeyboundProvider } from 'react-keybound';
import type {} from 'react-keybound/jsx';

export function HeroDemo() {
  const [events, setEvents] = React.useState<string[]>([]);
  const [hints, setHints] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const announce = React.useCallback((message: string) => {
    setEvents((current) => [message, ...current].slice(0, 3));
  }, []);

  return (
    <KeyboundProvider onWarning={(warning) => announce(`warning: ${warning.code}`)}>
      <div className="hero-demo reveal reveal-delay-2">
        <div className="hero-demo__topline">
          <div className="window-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <span className="hero-demo__path">/app/commands.tsx</span>
          <span className="hero-demo__live">
            <Radio className="size-3" /> LIVE
          </span>
        </div>
        <div className="hero-demo__body">
          <div className="hero-demo__code" aria-hidden="true">
            <span className="code-muted">01</span>
            <span>
              <b className="code-keyword">&lt;button</b> <i className="code-prop">onClick</i>
              =&#123;save&#125;&gt;
            </span>
            <span className="code-comment">&amp;Save</span>
            <span>
              <b className="code-keyword">&lt;/button&gt;</b>
            </span>
            <span className="code-muted">02</span>
            <span>
              <b className="code-keyword">&lt;input</b> <i className="code-prop">hotkey</i>=
              <em>&quot;mod+k&quot;</em> /&gt;
            </span>
          </div>
          <div className="hero-demo__surface">
            <div className="hero-demo__surface-head">
              <span>TRY THE REAL BINDINGS</span>
              <button
                className="hero-demo__hint-toggle"
                onClick={() => setHints((current) => !current)}
                aria-pressed={hints}
              >
                <Eye className="size-3.5" /> {hints ? 'Hints on' : 'Show hints'}
              </button>
            </div>
            <div className="hero-demo__controls">
              <button className="hero-action" onClick={() => announce('Save fired via Alt+S')}>
                <span className="hero-action__mark">S</span>
                Save file
                <kbd>⌥ S</kbd>
              </button>
              <label className="hero-search">
                <Keyboard className="size-4" />
                <input
                  hotkey="mod+k"
                  aria-label="Search commands"
                  placeholder="Focus with ⌘ K"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <kbd>⌘ K</kbd>
              </label>
            </div>
            <div className="hero-demo__status" aria-live="polite">
              <span className="status-dot" />
              <span>{events[0] ?? 'Waiting for a keypress'}</span>
              <ArrowUpRight className="ml-auto size-3.5 text-muted" />
            </div>
          </div>
        </div>
        <div className="hero-demo__bottomline">
          <span>compiler: ready</span>
          <span>provider: 2 bindings</span>
          <span className="hero-demo__query">
            {query ? `query: ${query}` : 'type to test focus'}
          </span>
        </div>
        <KeyboundOverlay open={hints} />
      </div>
    </KeyboundProvider>
  );
}

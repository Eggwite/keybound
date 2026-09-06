'use client';

import { Keyboard, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

type LogEntry = { id: number; message: string };

function EventLog({ entries }: { entries: LogEntry[] }) {
  return (
    <div
      aria-live="polite"
      className="h-[122px] overflow-auto border border-white/10 bg-black/20 px-3 py-2 font-mono text-[11px] leading-6 text-[#aeb8a9]"
    >
      {entries.length ? (
        entries.map((entry) => (
          <div key={entry.id}>
            <span className="mr-2 text-[#b7ff4a]">›</span>
            {entry.message}
          </div>
        ))
      ) : (
        <div className="text-[#697066]">Waiting for input…</div>
      )}
    </div>
  );
}

export function LabHero({
  events,
  hints,
  onClear,
  onOpenHelp,
  onSave,
  onToggleHints,
}: {
  events: LogEntry[];
  hints: boolean;
  onClear: () => void;
  onOpenHelp: () => void;
  onSave: () => void;
  onToggleHints: () => void;
}) {
  return (
    <section className="technical-grid border-b border-white/[.08] py-16 sm:py-20">
      <div className="page-shell">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="section-kicker">
              <span>02</span>
              <span>THE RUNTIME LAB</span>
            </p>
            <h2 className="section-title mt-4 max-w-2xl">See the dispatcher make a decision.</h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-[#91a0ad]">
            This is the real package under the page. Press a key, hide a target, open a modal and
            watch the eligible command list change.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <div className="relative overflow-hidden border border-white/15 bg-[#111820] p-5 sm:p-7">
            <div className="absolute right-4 top-4 font-mono text-[10px] tracking-[.18em] text-[#5c6b77]">
              LIVE / PROVIDER_01
            </div>
            <p className="eyebrow mb-4 text-[#c9ff55]">Keyboard-native React UI</p>
            <p className="max-w-xl text-xl font-medium tracking-[-.04em] text-[#edf4f7] sm:text-2xl">
              Intent stays next to the thing it controls.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <button onClick={onSave}>&Save</button>
              <button onClick={onOpenHelp}>&Help</button>
              <Button variant="outline" onClick={onToggleHints}>
                <Keyboard className="size-4" /> {hints ? 'Hide' : 'Show'} hints
              </Button>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-[auto_1fr] gap-x-4 border-t border-white/10 pt-4 font-mono text-[11px] text-[#91a0ad]">
              <span className="text-[#c9ff55]">ALT+S</span>
              <span>compiled from a plain JSX label</span>
              <span className="mt-2 text-[#c9ff55]">ALT+H</span>
              <span className="mt-2">opens command discovery</span>
            </div>
          </div>
          <div className="border border-white/15 bg-[#0c1116] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="eyebrow">Command monitor</p>
                <p className="mt-1 text-sm text-[#dbe6ec]">Every action below is package-backed.</p>
              </div>
              <Sparkles className="size-4 text-[#c9ff55]" />
            </div>
            <EventLog entries={events} />
            <button
              className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] text-[#91a0ad] hover:text-white"
              onClick={onClear}
            >
              <RotateCcw className="size-3" /> Clear trace
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export type { LogEntry };

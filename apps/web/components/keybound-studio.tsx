'use client';

import * as React from 'react';
import {
  KeyboundProvider,
  KeyboundOverlay,
  KeyboundScope,
  Mnemonic,
  useMnemonic,
  useHotkey,
} from 'react-keybound';
import { Crosshair, Search, Terminal, X, ArrowDown } from 'lucide-react';
import type {} from 'react-keybound/jsx';

type DispatchRecord = {
  id: number;
  key: string;
  type: 'mnemonic' | 'hotkey';
  target: string;
  time: string;
};

function ModalBindings({ onClose }: { onClose: () => void }) {
  useHotkey('escape', onClose);
  return null;
}

function StudioCues({
  activeCueId,
  triggerEvent,
  searchInputRef,
}: {
  activeCueId: string | null;
  triggerEvent: (id: string, key: string, type: 'mnemonic' | 'hotkey', target: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const executeSave = React.useCallback(() => {
    searchInputRef.current?.blur();
  }, [searchInputRef]);

  const executeExport = React.useCallback(() => {
    searchInputRef.current?.blur();
  }, [searchInputRef]);

  const executeReload = React.useCallback(() => {
    searchInputRef.current?.blur();
  }, [searchInputRef]);

  const saveMnemonic = useMnemonic('&Save changes', {
    allowInInput: true,
    action: (_element, event) => {
      executeSave();
      triggerEvent('save', event.metaKey ? '⌘S' : 'Alt+S', 'mnemonic', 'button[Save]');
    },
  });

  const exportMnemonic = useMnemonic('E&xport document', {
    allowInInput: true,
    action: (_element, event) => {
      executeExport();
      triggerEvent('export', event.metaKey ? '⌘X' : 'Alt+X', 'mnemonic', 'button[Export]');
    },
  });

  const reloadMnemonic = useMnemonic('Re&load state', {
    allowInInput: true,
    action: (_element, event) => {
      executeReload();
      triggerEvent('reload', event.metaKey ? '⌘L' : 'Alt+L', 'mnemonic', 'button[Reload]');
    },
  });

  useHotkey('mod+k', (event) => {
    searchInputRef.current?.focus();
    triggerEvent('find', event.metaKey ? '⌘K' : 'Ctrl+K', 'hotkey', 'input[search]');
  });

  return (
    <div className="space-y-1.5">
      <button
        ref={saveMnemonic.triggerProps.ref}
        aria-keyshortcuts={saveMnemonic.triggerProps['aria-keyshortcuts']}
        data-keybound="mnemonic"
        onClick={executeSave}
        className={`studio-cue ${activeCueId === 'save' ? 'studio-cue--active studio-cue--ember' : ''}`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="flex-none flex items-center justify-center size-3 overflow-visible">
            <span className="cue-dot size-1.5 rounded-full bg-ember transition-transform duration-150" />
          </span>
          <span className="truncate">{saveMnemonic.label}</span>
        </span>
        <span className="font-mono text-[10px] text-muted flex-none">Alt+S</span>
      </button>

      <button
        ref={exportMnemonic.triggerProps.ref}
        aria-keyshortcuts={exportMnemonic.triggerProps['aria-keyshortcuts']}
        data-keybound="mnemonic"
        onClick={executeExport}
        className={`studio-cue ${activeCueId === 'export' ? 'studio-cue--active studio-cue--blue' : ''}`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="flex-none flex items-center justify-center size-3 overflow-visible">
            <span className="cue-dot size-1.5 rounded-full bg-blue transition-transform duration-150" />
          </span>
          <span className="truncate">{exportMnemonic.label}</span>
        </span>
        <span className="font-mono text-[10px] text-muted flex-none">Alt+X</span>
      </button>

      <button
        ref={reloadMnemonic.triggerProps.ref}
        aria-keyshortcuts={reloadMnemonic.triggerProps['aria-keyshortcuts']}
        data-keybound="mnemonic"
        onClick={executeReload}
        className={`studio-cue ${activeCueId === 'reload' ? 'studio-cue--active studio-cue--grass' : ''}`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="flex-none flex items-center justify-center size-3 overflow-visible">
            <span className="cue-dot size-1.5 rounded-full bg-grass transition-transform duration-150" />
          </span>
          <span className="truncate">{reloadMnemonic.label}</span>
        </span>
        <span className="font-mono text-[10px] text-muted flex-none">Alt+L</span>
      </button>

      <div
        className={`relative w-full rounded-control transition-all ${
          activeCueId === 'find' ? 'ring-2 ring-violet border-violet' : ''
        }`}
      >
        <Search className="size-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Quick find..."
          className="w-full h-[30px] pl-7 pr-9 rounded-control border border-border bg-white text-[11px] text-ink placeholder:text-muted focus:border-violet focus:ring-1 focus:ring-violet outline-none shadow-xs transition-colors"
          onKeyDown={(e) => {
            if (e.key === 'Escape') e.currentTarget.blur();
          }}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted pointer-events-none">
          ⌘K
        </span>
      </div>
    </div>
  );
}

export function KeyboundStudio() {
  const [revealMode, setRevealMode] = React.useState<'always' | 'modifier' | 'never'>('always');
  const [showOverlay, setShowOverlay] = React.useState(false);
  const [activeCueId, setActiveCueId] = React.useState<string | null>(null);
  const [events, setEvents] = React.useState<DispatchRecord[]>([]);
  const [pulseCount, setPulseCount] = React.useState(0);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const cueTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const triggerEvent = React.useCallback(
    (id: string, key: string, type: 'mnemonic' | 'hotkey', target: string) => {
      setActiveCueId(id);
      const now = new Date();
      const time = `${now.toTimeString().split(' ')[0]}.${Math.floor(now.getMilliseconds() / 10)
        .toString()
        .padStart(2, '0')}`;

      const newRecord: DispatchRecord = {
        id: Date.now() + Math.random(),
        key,
        type,
        target,
        time,
      };

      setEvents((prev) => [newRecord, ...prev.slice(0, 4)]);
      setPulseCount((c) => c + 1);

      if (id === 'find' && searchInputRef.current) {
        searchInputRef.current.focus();
      }

      if (cueTimerRef.current) clearTimeout(cueTimerRef.current);
      cueTimerRef.current = setTimeout(() => {
        setActiveCueId(null);
      }, 350);
    },
    [],
  );

  return (
    <KeyboundProvider reveal={revealMode}>
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-card border border-border bg-white shadow-lift relative h-100">
          <div className="absolute top-2.5 left-2.5 pointer-events-none opacity-20">
            <Crosshair className="size-3 text-charcoal" />
          </div>
          <div className="absolute top-2.5 right-2.5 pointer-events-none opacity-20">
            <Crosshair className="size-3 text-charcoal" />
          </div>

          <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-stone p-4 sm:p-5 flex flex-col justify-between bg-canvas/40">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-stone mb-3">
                <span className="text-[10.5px] font-semibold tracking-wider text-muted uppercase">
                  Cues
                </span>
              </div>

              <StudioCues
                activeCueId={activeCueId}
                triggerEvent={triggerEvent}
                searchInputRef={searchInputRef}
              />
            </div>
          </div>

          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-stone p-4 sm:p-5 flex flex-col justify-between bg-white h-full">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-stone mb-3">
                <div className="flex items-center gap-1.5">
                  <Terminal className="size-3 text-muted" />
                  <span className="text-[10.5px] font-semibold tracking-wider text-muted uppercase">
                    Log
                  </span>
                </div>
              </div>

              <div className="h-[290px] rounded-control bg-[#faf9f6] border border-border p-2.5 flex flex-col justify-start gap-1 overflow-hidden font-mono text-[10.5px]">
                {events.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-3 text-muted">
                    <ArrowDown className="size-3.5 mb-1.5 text-faint animate-bounce" />
                    <span className="text-[11px] text-charcoal font-medium">
                      Awaiting key chord
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5 overflow-hidden">
                    {events.map((ev, index) => (
                      <div
                        key={ev.id}
                        className={`flex items-center justify-between py-1.5 px-2 rounded text-[10.5px] transition-all duration-150 ${
                          index === 0
                            ? 'bg-white border border-border-strong shadow-xs opacity-100 log-item-enter'
                            : 'bg-black/[0.02] border border-transparent opacity-65'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`size-1.5 rounded-full flex-none ${
                              ev.key.toLowerCase().includes('+s')
                                ? 'bg-ember'
                                : ev.key.toLowerCase().includes('+x')
                                  ? 'bg-blue'
                                  : ev.key.toLowerCase().includes('+l')
                                    ? 'bg-grass'
                                    : 'bg-violet'
                            }`}
                          />
                          <span className="font-semibold text-ink flex-none">{ev.key}</span>
                          <span className="text-faint flex-none">→</span>
                          <span className="text-charcoal truncate">{ev.target}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-none text-[9.5px] text-muted pl-2">
                          <span>{ev.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-stone text-[10.5px] text-muted flex items-center justify-between">
              <span>Dispatches: {pulseCount}</span>
              <span className="font-mono text-[9.5px]">Latency: &lt; 0.5ms</span>
            </div>
          </div>

          <div className="lg:col-span-4 p-4 sm:p-5 flex flex-col justify-between bg-canvas/40">
            <div>
              <div className="space-y-2">
                <div className="inspector-row">
                  <span className="font-medium text-charcoal">Shortcut overlay</span>
                  <button
                    role="switch"
                    aria-checked={showOverlay}
                    onClick={() => setShowOverlay((v) => !v)}
                    className="tactile-switch"
                    title="Toggle keybound hints overlay"
                  >
                    <span className="knob" />
                  </button>
                </div>

                <div className="inspector-row">
                  <span className="font-medium text-charcoal">Underline</span>
                  <div className="flex items-center gap-0.5 bg-stone p-0.5 rounded-[5px] text-[10.5px]">
                    {(['always', 'modifier', 'never'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setRevealMode(m)}
                        className={`px-1.5 py-0.5 rounded-[4px] capitalize cursor-pointer transition-all ${
                          revealMode === m
                            ? 'bg-white font-semibold text-ink shadow-xs'
                            : 'text-muted hover:text-charcoal'
                        }`}
                      >
                        {m === 'modifier' ? 'alt' : m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="inspector-row">
                  <span className="font-medium text-charcoal">Active scope</span>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-[11px] font-medium px-2 py-0.5 rounded bg-white border border-border-strong text-ink hover:bg-sand cursor-pointer transition-colors shadow-2xs"
                  >
                    Open modal
                  </button>
                </div>

                <div className="inspector-row">
                  <span className="font-medium text-charcoal">Modifier</span>
                  <span className="font-mono text-[10.5px] text-muted bg-stone px-1.5 py-0.5 rounded border border-border">
                    Alt / Option
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-stone text-[11px] text-muted flex items-center justify-between">
              <span>Hints anchor</span>
              <span className="font-mono text-[10px]">calc(-100% - 6px)</span>
            </div>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              className="fixed inset-0 bg-black/40 backdrop-blur-xs border-0 cursor-pointer w-full h-full"
              onClick={() => setIsModalOpen(false)}
              aria-label="Dismiss modal"
            />

            <KeyboundScope modal active>
              <ModalBindings onClose={() => setIsModalOpen(false)} />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="scoped-modal-title"
                className="relative z-10 w-full max-w-sm rounded-card bg-white border border-border p-5 shadow-lift-lg space-y-3 cursor-default"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone">
                  <span
                    id="scoped-modal-title"
                    className="font-mono text-[11px] text-ember font-semibold uppercase tracking-wider"
                  >
                    Scoped Modal
                  </span>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-muted hover:text-ink p-1 cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <p className="text-[12px] text-charcoal leading-relaxed">
                  While this modal scope is active, background shortcuts (
                  <span className="font-mono text-[10.5px] bg-stone px-1 py-0.5 rounded">
                    Alt+S
                  </span>
                  , <span className="font-mono text-[10.5px] bg-stone px-1 py-0.5 rounded">⌘K</span>
                  ) are automatically suppressed by the dispatcher.
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-muted font-mono">Press Esc to exit</span>
                  <Mnemonic text="&Close dialog">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="btn btn--quiet btn--sm cursor-pointer"
                    >
                      Close dialog
                    </button>
                  </Mnemonic>
                </div>
              </div>
            </KeyboundScope>
          </div>
        )}

        <KeyboundOverlay open={showOverlay} />
      </div>
    </KeyboundProvider>
  );
}

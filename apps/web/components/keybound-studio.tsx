'use client';

import * as React from 'react';
import {
  KeyboundProvider,
  KeyboundOverlay,
  KeyboundScope,
  Mnemonic,
  useMnemonic,
  useKeyboundCommands,
} from 'react-keybound';
import { Crosshair, Search, Terminal, X, ArrowDown, Smartphone } from 'lucide-react';
import type {} from 'react-keybound/jsx';

type DispatchRecord = {
  id: number;
  key: string;
  type: 'mnemonic' | 'hotkey';
  target: string;
  time: string;
};

function MobileEnginePanel({
  triggerEvent,
  searchInputRef,
}: {
  triggerEvent: (id: string, key: string, type: 'mnemonic' | 'hotkey', target: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const activeCommands = useKeyboundCommands();

  // Directly mirror active registers known by the engine
  const isSaveActive = activeCommands.some((c) => c.keys.toLowerCase().includes('+s'));
  const isExportActive = activeCommands.some((c) => c.keys.toLowerCase().includes('+x'));
  const isReloadActive = activeCommands.some((c) => c.keys.toLowerCase().includes('+l'));
  const isFindActive = activeCommands.some((c) => c.keys.toLowerCase().includes('k'));
  const isModalActive = activeCommands.some((c) => c.label.toLowerCase().includes('close'));

  return (
    <div className="rounded-card border border-border-strong bg-white p-3.5 shadow-xs mb-4 space-y-2.5">
      <div className="flex items-center justify-between pb-2 border-b border-stone">
        <div className="flex items-center gap-1.5">
          <Smartphone className="size-3.5 text-ember" />
          <span className="text-[11px] font-semibold tracking-wider text-charcoal uppercase">
            Mobile Engine Controller
          </span>
        </div>
        <span className="font-mono text-[10px] text-muted bg-stone px-2 py-0.5 rounded flex items-center gap-1.5">
          <span
            className={`size-1.5 rounded-full ${
              isModalActive ? 'bg-ember animate-ping' : 'bg-grass'
            }`}
          />
          {activeCommands.length} active register{activeCommands.length === 1 ? '' : 's'}
        </span>
      </div>

      <p className="text-[11px] text-muted leading-relaxed">
        {isModalActive ? (
          <span className="text-ember font-medium">
            Active modal scope captured registry. Background chords are disabled by precedence.
          </span>
        ) : (
          'Direct registry mirror: tap virtual pads to dispatch actual chords through the Keybound engine.'
        )}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
        <button
          disabled={!isSaveActive}
          onClick={() => {
            const cmd = activeCommands.find((c) => c.keys.toLowerCase().includes('+s'));
            cmd?.element?.click();
            triggerEvent('save', 'Alt+S', 'mnemonic', 'button[Save]');
          }}
          className={`flex items-center justify-between px-2.5 py-1.5 rounded-control border text-[11px] font-medium transition-all ${
            isSaveActive
              ? 'bg-white border-border-strong text-ink hover:bg-sand active:scale-95 shadow-2xs cursor-pointer'
              : 'bg-stone border-transparent text-faint cursor-not-allowed opacity-45'
          }`}
        >
          <span>Save</span>
          <span className="font-mono text-[9.5px] text-muted">Alt+S</span>
        </button>

        <button
          disabled={!isExportActive}
          onClick={() => {
            const cmd = activeCommands.find((c) => c.keys.toLowerCase().includes('+x'));
            cmd?.element?.click();
            triggerEvent('export', 'Alt+X', 'mnemonic', 'button[Export]');
          }}
          className={`flex items-center justify-between px-2.5 py-1.5 rounded-control border text-[11px] font-medium transition-all ${
            isExportActive
              ? 'bg-white border-border-strong text-ink hover:bg-sand active:scale-95 shadow-2xs cursor-pointer'
              : 'bg-stone border-transparent text-faint cursor-not-allowed opacity-45'
          }`}
        >
          <span>Export</span>
          <span className="font-mono text-[9.5px] text-muted">Alt+X</span>
        </button>

        <button
          disabled={!isReloadActive}
          onClick={() => {
            const cmd = activeCommands.find((c) => c.keys.toLowerCase().includes('+l'));
            cmd?.element?.click();
            triggerEvent('reload', 'Alt+L', 'mnemonic', 'button[Reload]');
          }}
          className={`flex items-center justify-between px-2.5 py-1.5 rounded-control border text-[11px] font-medium transition-all ${
            isReloadActive
              ? 'bg-white border-border-strong text-ink hover:bg-sand active:scale-95 shadow-2xs cursor-pointer'
              : 'bg-stone border-transparent text-faint cursor-not-allowed opacity-45'
          }`}
        >
          <span>Reload</span>
          <span className="font-mono text-[9.5px] text-muted">Alt+L</span>
        </button>

        <button
          disabled={!isFindActive}
          onClick={() => {
            searchInputRef.current?.focus();
            triggerEvent('find', '⌘K', 'hotkey', 'input[search]');
          }}
          className={`flex items-center justify-between px-2.5 py-1.5 rounded-control border text-[11px] font-medium transition-all ${
            isFindActive
              ? 'bg-white border-border-strong text-ink hover:bg-sand active:scale-95 shadow-2xs cursor-pointer'
              : 'bg-stone border-transparent text-faint cursor-not-allowed opacity-45'
          }`}
        >
          <span>Quick find</span>
          <span className="font-mono text-[9.5px] text-muted">⌘K</span>
        </button>
      </div>
    </div>
  );
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
  const saveMnemonic = useMnemonic('&Save changes', {
    allowInInput: true,
    preventDefault: false,
  });
  const exportMnemonic = useMnemonic('E&xport document', {
    allowInInput: true,
    preventDefault: false,
  });
  const reloadMnemonic = useMnemonic('Re&load state', {
    allowInInput: true,
    preventDefault: false,
  });

  // Fallback for Ctrl/Cmd+K to prevent browser search bar interception
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        searchInputRef.current?.focus();
        triggerEvent('find', e.metaKey ? '⌘K' : 'Ctrl+K', 'hotkey', 'input[search]');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchInputRef, triggerEvent]);

  return (
    <div className="space-y-1.5">
      <button
        ref={saveMnemonic.triggerProps.ref}
        aria-keyshortcuts={saveMnemonic.triggerProps['aria-keyshortcuts']}
        data-keybound="mnemonic"
        onClick={() => {
          searchInputRef.current?.blur();
          triggerEvent('save', 'Alt+S', 'mnemonic', 'button[Save]');
        }}
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
        onClick={() => {
          searchInputRef.current?.blur();
          triggerEvent('export', 'Alt+X', 'mnemonic', 'button[Export]');
        }}
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
        onClick={() => {
          searchInputRef.current?.blur();
          triggerEvent('reload', 'Alt+L', 'mnemonic', 'button[Reload]');
        }}
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
          hotkey="mod+k"
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
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Close modal on Escape
  React.useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        e.stopPropagation();
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isModalOpen]);

  React.useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    ) {
      setIsTouchDevice(true);
    }
  }, []);

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

      setTimeout(() => {
        setActiveCueId((current) => (current === id ? null : current));
      }, 350);
    },
    [],
  );

  return (
    <KeyboundProvider reveal={revealMode}>
      <div className="w-full">
        {/* Mobile Engine Controller: Directly mirrors active registers with live disabled state for modal scopes */}
        <div className={isTouchDevice ? 'block' : 'block lg:hidden'}>
          <MobileEnginePanel triggerEvent={triggerEvent} searchInputRef={searchInputRef} />
        </div>

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

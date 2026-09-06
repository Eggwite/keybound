'use client';

import * as React from 'react';
import { KeyboundProvider, Mnemonic, Hotkey, KeyboundScope } from 'react-keybound';
import {
  Check,
  Copy,
  CheckCircle2,
  Shield,
  Loader2,
  FileText,
  Cloud,
  CloudOff,
  X,
} from 'lucide-react';
import { highlight } from 'sugar-high';

function CopyableSnippet({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Ignore
    }
  };

  const highlightedHtml = React.useMemo(() => highlight(code), [code]);

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-border-strong transition-all shadow-2xs group hover:border-charcoal/30">
      <code
        className="font-mono text-[11px] leading-none select-all"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
      <button
        onClick={onCopy}
        title="Click to copy snippet"
        className="text-muted group-hover:text-ink cursor-pointer p-0.5 transition-colors rounded"
        aria-label="Copy code snippet"
      >
        {copied ? <Check className="size-3 text-grass" /> : <Copy className="size-3" />}
      </button>
    </div>
  );
}

function useTransitionPresence(isOpen: boolean, duration = 220) {
  const [isRendered, setIsRendered] = React.useState(isOpen);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setIsRendered(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setIsVisible(false);
      timer = setTimeout(() => {
        setIsRendered(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);

  return { isRendered, isVisible };
}

function CardsInner() {
  // Card 1: Realistic File Export states
  const [exportStatus, setExportStatus] = React.useState<'idle' | 'exporting' | 'completed'>(
    'idle',
  );
  const [exportProgress, setExportProgress] = React.useState(0);

  const triggerExport = React.useCallback(() => {
    if (exportStatus === 'exporting') return;
    setExportStatus('exporting');
    setExportProgress(20);

    const t1 = setTimeout(() => setExportProgress(65), 250);
    const t2 = setTimeout(() => setExportProgress(100), 550);
    const t3 = setTimeout(() => {
      setExportStatus('completed');
    }, 800);
    const t4 = setTimeout(() => {
      setExportStatus('idle');
      setExportProgress(0);
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [exportStatus]);

  // Card 2: Realistic Cloud Sync & Autosave states
  const [toggleState, setToggleState] = React.useState(true);
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleToggleSync = React.useCallback(() => {
    const next = !toggleState;
    setToggleState(next);
    if (next) {
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 600);
    }
  }, [toggleState]);

  // Card 3: Scoped Modal Isolation states with animated opening & closing
  const [modalOpen, setModalOpen] = React.useState(false);
  const { isRendered: isModalRendered, isVisible: isModalVisible } = useTransitionPresence(
    modalOpen,
    220,
  );
  const [confirmStatus, setConfirmStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle');

  const handleConfirmModal = () => {
    setConfirmStatus('saving');
    setTimeout(() => {
      setConfirmStatus('saved');
      setTimeout(() => {
        setModalOpen(false);
        setConfirmStatus('idle');
      }, 350);
    }, 550);
  };

  return (
    <section className="space-y-12 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-ember font-semibold">
            01 / Interactive patterns
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink mt-1 font-title">
            First-class Components
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="flex flex-col justify-between p-6 rounded-card bg-white border border-border shadow-lift space-y-4">
          <div className="h-36 flex flex-col justify-between p-3 rounded-[8px] bg-sand border border-stone relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-white border border-stone shadow-2xs">
                  <FileText className="size-3.5 text-ember" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11.5px] font-medium text-ink leading-tight">
                    annual_report.pdf
                  </span>
                  <span className="text-[10px] text-muted font-mono">1.4 MB · Document</span>
                </div>
              </div>
              <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-stone text-charcoal">
                v2.4
              </span>
            </div>

            <div className="space-y-1.5 my-auto">
              <div className="flex items-center justify-between gap-2">
                <Mnemonic text="E&xport">
                  <button
                    onClick={triggerExport}
                    disabled={exportStatus === 'exporting'}
                    className={`btn btn--quiet btn--sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
                      exportStatus === 'exporting' ? 'opacity-90 cursor-wait' : ''
                    }`}
                  >
                    {exportStatus === 'exporting' ? (
                      <>
                        <Loader2 className="size-3 animate-spin text-ember" />
                        <span>Exporting...</span>
                      </>
                    ) : exportStatus === 'completed' ? (
                      <>
                        <Check className="size-3 text-grass" />
                        <span>Exported</span>
                      </>
                    ) : (
                      'Export'
                    )}
                  </button>
                </Mnemonic>

                <span className="text-[10px] font-mono text-muted">
                  {exportStatus === 'exporting'
                    ? `${exportProgress}%`
                    : exportStatus === 'completed'
                      ? '100%'
                      : ''}
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-stone overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ease-out rounded-full ${
                    exportStatus === 'completed'
                      ? 'bg-grass w-full'
                      : exportStatus === 'exporting'
                        ? 'bg-ember'
                        : 'bg-transparent w-0'
                  }`}
                  style={exportStatus === 'exporting' ? { width: `${exportProgress}%` } : undefined}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono border-t border-stone/80 pt-1.5">
              {exportStatus === 'completed' ? (
                <span className="inline-flex items-center gap-1 text-grass font-medium animate-in fade-in duration-150">
                  <CheckCircle2 className="size-3" /> Ready for download
                </span>
              ) : exportStatus === 'exporting' ? (
                <span className="inline-flex items-center gap-1 text-ember font-medium">
                  <Loader2 className="size-2.5 animate-spin" /> Compiling document stream...
                </span>
              ) : (
                <div className="flex items-center justify-between w-full text-muted">
                  <span>Click or press</span>
                  <kbd className="kbd-badge text-[9.5px]">Alt+X</kbd>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col flex-1 justify-between gap-2.5 text-center pt-1">
            <div className="flex justify-center h-7 items-center">
              <CopyableSnippet code="<button>E&xport</button>" />
            </div>
            <p className="text-[12px] text-muted leading-relaxed min-h-[44px] flex items-center justify-center gap-1 flex-wrap">
              <span>Press</span>
              <kbd className="kbd-badge text-[10px]">Alt+X</kbd>
              <span>to trigger without breaking natural word flow.</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between p-6 rounded-card bg-white border border-border shadow-lift space-y-4">
          <div className="h-36 flex flex-col justify-between p-3 rounded-[8px] bg-sand border border-stone relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-white border border-stone shadow-2xs">
                  {isSyncing ? (
                    <Loader2 className="size-3.5 animate-spin text-ember" />
                  ) : toggleState ? (
                    <Cloud className="size-3.5 text-blue" />
                  ) : (
                    <CloudOff className="size-3.5 text-muted" />
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11.5px] font-medium text-ink leading-tight">
                    Cloud Document Sync
                  </span>
                  <span className="text-[10px] text-muted font-mono">Workspace Revisions</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 my-auto">
              <div className="flex flex-col text-left">
                <span className="text-[12px] font-medium text-charcoal">Autosave revisions</span>
                <span className="text-[10px] text-muted">Automatic snapshot on change</span>
              </div>
              <Hotkey keys="alt+a" label="Autosave toggle">
                <button
                  role="switch"
                  aria-checked={toggleState}
                  onClick={handleToggleSync}
                  className="tactile-switch transition-transform active:scale-95 cursor-pointer"
                  title="Toggle autosave with Alt+A"
                >
                  <span className="knob" />
                </button>
              </Hotkey>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono border-t border-stone/80 pt-1.5">
              {isSyncing ? (
                <span className="inline-flex items-center gap-1 text-ember font-medium animate-pulse">
                  <Loader2 className="size-2.5 animate-spin" /> Pushing state delta...
                </span>
              ) : toggleState ? (
                <span className="inline-flex items-center gap-1.5 text-grass font-medium">
                  <span className="size-1.5 rounded-full bg-grass animate-pulse" />
                  All changes saved in cloud
                </span>
              ) : (
                <div className="flex items-center justify-between w-full text-muted">
                  <span>Offline mode (local only)</span>
                  <kbd className="kbd-badge text-[9.5px]">Alt+A</kbd>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col flex-1 justify-between gap-2.5 text-center pt-1">
            <div className="flex justify-center h-7 items-center">
              <CopyableSnippet code='hotkey="alt+a"' />
            </div>
            <p className="text-[12px] text-muted leading-relaxed min-h-[44px] flex items-center justify-center gap-1 flex-wrap">
              <span>Press</span>
              <kbd className="kbd-badge text-[10px]">Alt+A</kbd>
              <span>to toggle custom switches or native inputs.</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between p-6 rounded-card bg-white border border-border shadow-lift space-y-4">
          <div className="h-36 flex flex-col justify-between p-3 rounded-[8px] bg-sand border border-stone relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-white border border-stone shadow-2xs">
                  <Shield className="size-3.5 text-charcoal" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11.5px] font-medium text-ink leading-tight">
                    Security Policy Dialog
                  </span>
                  <span className="text-[10px] text-muted font-mono">Isolated Precedence</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 my-auto">
              <div className="flex flex-col text-left">
                <span className="text-[12px] font-medium text-charcoal">Scoped overlay</span>
                <span className="text-[10px] text-muted">Traps keys within boundary</span>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="btn btn--quiet btn--sm font-medium"
              >
                Open scope
              </button>
            </div>

            {isModalRendered && (
              <KeyboundScope active={modalOpen} modal>
                <div
                  className={`absolute inset-0 rounded-[8px] p-2.5 z-20 flex flex-col justify-between transition-all duration-200 ease-out ${
                    isModalVisible
                      ? 'opacity-100 pointer-events-auto'
                      : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <button
                    type="button"
                    aria-label="Dismiss modal overlay"
                    tabIndex={-1}
                    onClick={() => setModalOpen(false)}
                    className="absolute inset-0 rounded-[8px] bg-black/40 backdrop-blur-[2px] border-0 cursor-pointer w-full h-full -z-10"
                  />
                  <div
                    className={`rounded-md bg-white border border-stone p-2.5 shadow-lg flex flex-col justify-between h-full transition-all duration-200 ease-out transform ${
                      isModalVisible
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-90 translate-y-1.5'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-stone pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Shield className="size-3 text-ember" />
                        <span className="font-mono text-[10.5px] text-ink font-semibold">
                          Modal Scope Active
                        </span>
                      </div>
                      <Hotkey keys="escape" label="Dismiss modal">
                        <button
                          onClick={() => setModalOpen(false)}
                          className="text-muted hover:text-ink p-0.5 rounded cursor-pointer transition-colors"
                          aria-label="Close dialog"
                          title="Press Escape"
                        >
                          <X className="size-3" />
                        </button>
                      </Hotkey>
                    </div>

                    <div className="py-1">
                      <p className="text-[10px] text-muted leading-tight">
                        Background shortcuts (<kbd className="kbd-badge text-[8.5px]">Alt+X</kbd>,{' '}
                        <kbd className="kbd-badge text-[8.5px]">Alt+A</kbd>) are blocked by the
                        modal scope.
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-stone">
                      <button
                        onClick={() => setModalOpen(false)}
                        className="btn btn--quiet btn--xs font-mono text-[9.5px] px-2 h-6"
                      >
                        Esc
                      </button>
                      <button
                        onClick={handleConfirmModal}
                        disabled={confirmStatus !== 'idle'}
                        className="btn btn--orange btn--xs font-medium px-2.5 h-6 flex items-center gap-1"
                      >
                        {confirmStatus === 'saving' ? (
                          <>
                            <Loader2 className="size-2.5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : confirmStatus === 'saved' ? (
                          <>
                            <Check className="size-2.5" />
                            <span>Saved</span>
                          </>
                        ) : (
                          'Save'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </KeyboundScope>
            )}
          </div>

          <div className="flex flex-col flex-1 justify-between gap-2.5 text-center pt-1">
            <div className="flex justify-center h-7 items-center">
              <CopyableSnippet code="<KeyboundScope modal>" />
            </div>
            <p className="text-[12px] text-muted leading-relaxed min-h-[44px] flex items-center justify-center gap-1 flex-wrap">
              <span>Scoped precedence:</span>
              <kbd className="kbd-badge text-[10px]">Esc</kbd>
              <span>dismisses while background chords stay blocked.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function VisualCards() {
  return (
    <KeyboundProvider>
      <CardsInner />
    </KeyboundProvider>
  );
}

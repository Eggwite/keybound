'use client';

import * as React from 'react';
import type {} from 'react-keybound/jsx';
import {
  KeyboundProvider,
  KeyboundScope,
  KeyboundOverlay,
  KeyboundHelp,
  Mnemonic,
  Hotkey,
  useMnemonic,
  useHotkey,
  useKeyboundCommands,
  useKeyboundContext,
} from 'react-keybound';
import { formatShortcut } from 'react-keybound/core';
import { CodeBlock } from '@/components/code-block';
import {
  Command,
  Layers,
  Shield,
  Zap,
  CheckCircle2,
  Sliders,
  Search,
  Eye,
  HelpCircle,
  X,
  Cloud,
  Terminal,
  Filter,
  Check,
  Loader2,
} from 'lucide-react';

// ==========================================
// Code Snippets with Newline Gaps & Comments
// ==========================================

const jsxMnemonicsCode = `// 1. Initial letter mnemonic compiles to Alt+S with underlined 'S'
<button onClick={handleSave}>&Save</button>

// 2. Mid-word mnemonic compiles to Alt+X with underlined 'x'
<button onClick={handleExport}>E&xport</button>

// 3. Double ampersand escapes literal '&' and marks 'C' for Alt+C
<button onClick={handleSaveAndClose}>Save && &Close</button>`;

const formHotkeysCode = `// 1. Focus search input on Command/Ctrl+K
<input hotkey="mod+k" placeholder="Search..." aria-label="Search" />

// 2. Toggle switch control on Alt+A
<button role="switch" hotkey="alt+a" aria-checked={autosave}>

  <span>Autosave</span>

</button>

// 3. Command palette trigger on Command/Ctrl+Shift+P
<button hotkey="mod+shift+p" onClick={openPalette}>

  Command Palette

</button>`;

const manualWrappersCode = `// 1. Import zero-compiler manual wrappers from react-keybound
import { Mnemonic, Hotkey } from "react-keybound";

// 2. Wrap button with Mnemonic component to bind Alt+R
<Mnemonic text="&Reload">

  <button onClick={handleReload}>Reload</button>

</Mnemonic>

// 3. Wrap button with Hotkey component to bind Command/Ctrl+B
<Hotkey keys="mod+b" label="Build project">

  <button onClick={handleBuild}>Build</button>

</Hotkey>`;

const richContentHookCode = `// 1. Import useMnemonic hook for rich or dynamic child content
import { useMnemonic } from "react-keybound";

// 2. Configure mnemonic with custom action and styling
export function UploadButton({ onUpload }: { onUpload: () => void }) {

  // Label contains formatted underline; text is clean accessible text
  const { label, text, triggerProps } = useMnemonic<HTMLButtonElement>(

    "&Upload to Cloud",

    {

      action: "click",

      className: "text-ember font-semibold underline",

    }

  );

  return (

    <button {...triggerProps} onClick={onUpload} title={text}>

      <Cloud className="size-4" />

      <span>{label}</span>

    </button>

  );

}`;

const headlessHotkeyCode = `// 1. Import headless useHotkey hook
import { useHotkey } from "react-keybound";

// 2. Headless application shortcut without a visual DOM target
export function DocumentEditor() {

  // Register headless shortcut with automatic preventDefault
  useHotkey("mod+j", (e) => {

    e.preventDefault();

    openJumpPalette();

  }, { label: "Quick Jump" });

  // Escape key handler scoped to the active component
  useHotkey("escape", () => {

    dismissEditor();

  }, { label: "Dismiss" });

  return <div className="editor">...</div>;

}`;

const modalScopeCode = `// 1. Import KeyboundScope for keyboard isolation
import { KeyboundScope } from "react-keybound";

// 2. Modal dialog component with isolated keyboard hierarchy
export function ConfirmModal({ isOpen, onClose, onConfirm }) {

  return (

    // Modal scope blocks all background shortcuts while active
    <KeyboundScope active={isOpen} modal name="confirm-dialog">

      <div role="dialog" aria-modal="true">

        <h3>Confirm action</h3>

        {/* Deepest scope wins: Alt+S inside modal triggers onConfirm */}
        <button onClick={onConfirm}>&Save changes</button>

        {/* Alt+C triggers cancel inside modal */}
        <button onClick={onClose}>&Close</button>

      </div>

    </KeyboundScope>

  );

}`;

const eligibilityCode = `// 1. Disabled controls are automatically skipped at dispatch time
<button disabled onClick={handleDelete}>&Delete</button>

// 2. Hidden or display:none controls are skipped
<button style={{ display: isVisible ? "block" : "none" }}>&Hidden</button>

// 3. Typing in text inputs suppresses letter mnemonics automatically
<input placeholder="Typing 's' will not trigger Alt+S..." />

// 4. Opt-in with allowInInput if you want an in-field shortcut
useHotkey("escape", clearInput, { allowInInput: true });`;

const visualOverlayCode = `// 1. Import provider, visual overlay, and accessible help list
import { KeyboundProvider, KeyboundOverlay, KeyboundHelp } from "react-keybound";

// 2. Root application setup with dynamic hint controls
export function App() {

  const [overlayOpen, setOverlayOpen] = React.useState(false);

  return (

    <KeyboundProvider reveal="modifier" mnemonicModifier="alt">

      {/* Floating badges anchored to eligible buttons */}
      <KeyboundOverlay open={overlayOpen} />

      {/* Accessible reference list of currently eligible shortcuts */}
      <KeyboundHelp className="shortcut-sheet" />

    </KeyboundProvider>

  );

}`;

// ==========================================
// Interactive Live Demo Widgets
// ==========================================

function SectionHeading({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-ember" />
        <h2 className="text-[15px] font-semibold text-ink tracking-tight">{title}</h2>
      </div>
      <p className="text-[13px] text-muted leading-relaxed">{description}</p>
    </div>
  );
}

function FeedbackBadge({ status, message }: { status: 'idle' | 'fired'; message: string }) {
  if (status !== 'fired') return null;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-grass animate-in fade-in zoom-in-95 duration-150">
      <CheckCircle2 className="size-3" />
      <span>{message}</span>
    </span>
  );
}

function LiveCommandsInspector() {
  const commands = useKeyboundCommands();
  return (
    <div className="rounded-md border border-border bg-canvas p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal">
          Live Engine Registry
        </span>
        <span className="font-mono text-[10px] text-muted bg-stone px-2 py-0.5 rounded">
          {commands.length} active binding{commands.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto font-mono text-[11px]">
        {commands.length === 0 ? (
          <span className="text-muted text-[11px]">No active bindings mounted.</span>
        ) : (
          commands.map((cmd) => (
            <div
              key={cmd.id}
              className="flex items-center justify-between px-2 py-1 rounded bg-white border border-stone text-[11px]"
            >
              <span className="text-ink truncate max-w-[140px]">{cmd.label}</span>
              <kbd className="kbd-badge text-[9.5px]">{cmd.keys}</kbd>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RichMnemonicDemo({ onFire, fired }: { onFire: () => void; fired: boolean }) {
  const { apple, mnemonicModifier } = useKeyboundContext();
  const uploadKey = formatShortcut(`${mnemonicModifier}+u`, apple);
  const [uploading, setUploading] = React.useState(false);
  const [completed, setCompleted] = React.useState(false);

  const handleUpload = React.useCallback(() => {
    if (uploading) return;
    setUploading(true);
    setCompleted(false);
    onFire();
    setTimeout(() => {
      setUploading(false);
      setCompleted(true);
      setTimeout(() => setCompleted(false), 2000);
    }, 600);
  }, [uploading, onFire]);

  const { label, triggerProps } = useMnemonic<HTMLButtonElement>('&Upload to Cloud', {
    className: 'text-ember font-semibold underline decoration-2 underline-offset-2',
    action: () => {
      handleUpload();
    },
  });

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <button
        {...triggerProps}
        onClick={handleUpload}
        disabled={uploading}
        className="flex items-center gap-2 px-3 py-1.5 rounded-control border border-border bg-sand hover:bg-white text-[12.5px] font-medium text-ink cursor-pointer shadow-2xs transition-all active:scale-95 disabled:opacity-85"
      >
        {uploading ? (
          <Loader2 className="size-4 animate-spin text-ember" />
        ) : completed ? (
          <Check className="size-4 text-grass" />
        ) : (
          <Cloud className="size-4 text-blue" />
        )}
        <span>
          {uploading ? 'Uploading revisions...' : completed ? 'Uploaded to Cloud!' : label}
        </span>
        <span className="font-mono text-[10px] text-muted ml-2">{uploadKey}</span>
      </button>

      <div className="min-h-[22px]">
        <FeedbackBadge
          status={fired ? 'fired' : 'idle'}
          message={`${uploadKey} dispatched to Rich useMnemonic!`}
        />
      </div>
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

function ExamplesContent() {
  const { apple, mnemonicModifier } = useKeyboundContext();
  const saveKey = formatShortcut(`${mnemonicModifier}+s`, apple);
  const exportKey = formatShortcut(`${mnemonicModifier}+x`, apple);
  const closeKey = formatShortcut(`${mnemonicModifier}+c`, apple);
  const findKey = formatShortcut('mod+k', apple);
  const autosaveShortcut = apple ? 'mod+shift+a' : 'alt+a';
  const autosaveKey = formatShortcut(autosaveShortcut, apple);
  const reloadKey = formatShortcut(`${mnemonicModifier}+r`, apple);
  const buildShortcut = apple ? 'mod+shift+b' : 'mod+b';
  const buildKey = formatShortcut(buildShortcut, apple);
  const uploadKey = formatShortcut(`${mnemonicModifier}+u`, apple);
  const jumpShortcut = 'mod+j';
  const jumpKey = formatShortcut(jumpShortcut, apple);
  const validateKey = formatShortcut(`${mnemonicModifier}+v`, apple);

  // Demo states
  const [feedback, setFeedback] = React.useState<{ [key: string]: boolean }>({});
  const [buttonStates, setButtonStates] = React.useState<{
    [key: string]: 'idle' | 'loading' | 'success';
  }>({});
  const [toggleAutosave, setToggleAutosave] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const { isRendered: isModalRendered, isVisible: isModalVisible } = useTransitionPresence(
    modalOpen,
    220,
  );
  const [modalSaving, setModalSaving] = React.useState(false);
  const [isDisabled, setIsDisabled] = React.useState(false);
  const [isHidden, setIsHidden] = React.useState(false);
  const [showOverlay, setShowOverlay] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);
  const [headlessCounter, setHeadlessCounter] = React.useState(0);
  const [testInputText, setTestInputText] = React.useState('');

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const fire = (id: string, _label: string) => {
    setButtonStates((prev) => ({ ...prev, [id]: 'loading' }));
    setTimeout(() => {
      setButtonStates((prev) => ({ ...prev, [id]: 'success' }));
      setFeedback((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setButtonStates((prev) => ({ ...prev, [id]: 'idle' }));
        setFeedback((prev) => ({ ...prev, [id]: false }));
      }, 1500);
    }, 400);
  };

  // Section 5: Headless shortcut
  useHotkey(
    jumpShortcut,
    (e) => {
      e.preventDefault();
      setHeadlessCounter((c) => c + 1);
      fire('headless-jump', `Headless Quick Jump (${jumpKey})`);
    },
    { label: 'Headless Quick Jump', allowInInput: true },
  );

  return (
    <div className="space-y-12">
      <div className="space-y-2 border-b border-stone pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          Interactive Examples & Use Cases
        </h1>
        <p className="text-[14px] text-muted leading-relaxed max-w-2xl">
          Explore practical implementations of Keybound. Every example is wired with live dispatch
          handlers, smart inline comments, and interactive feedback widgets.
        </p>
      </div>

      {/* Use Case 1: JSX Mnemonics */}
      <section className="space-y-4">
        <SectionHeading
          title="JSX Mnemonics & Letter Positioning"
          description="Use & anywhere in button or label text. The compiler automatically transforms it into an underlined mnemonic with platform-aware keyboard intent."
          icon={Command}
        />

        <div className="p-4 rounded-card bg-white border border-border shadow-lift space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Mnemonic text="&Save" action={() => fire('save', `Saved with ${saveKey}`)}>
              <button className="btn btn--orange btn--sm flex items-center gap-1.5">Save</button>
            </Mnemonic>

            <Mnemonic text="E&xport" action={() => fire('export', `Exported with ${exportKey}`)}>
              <button className="btn btn--quiet btn--sm flex items-center gap-1.5">Export</button>
            </Mnemonic>

            <Mnemonic
              text="Save && &Close"
              action={() => fire('close', `Saved & Closed with ${closeKey}`)}
            >
              <button className="btn btn--quiet btn--sm flex items-center gap-1.5">
                Save && Close
              </button>
            </Mnemonic>
          </div>

          <div className="flex items-center gap-3 min-h-[22px]">
            <FeedbackBadge
              status={feedback.save ? 'fired' : 'idle'}
              message={`${saveKey} dispatched!`}
            />
            <FeedbackBadge
              status={feedback.export ? 'fired' : 'idle'}
              message={`${exportKey} dispatched!`}
            />
            <FeedbackBadge
              status={feedback.close ? 'fired' : 'idle'}
              message={`${closeKey} dispatched (&& decoded)!`}
            />
            {!feedback.save && !feedback.export && !feedback.close && (
              <span className="text-[11px] text-muted font-mono">
                Press {saveKey}, {exportKey}, or {closeKey} to test live activation.
              </span>
            )}
          </div>
        </div>

        <CodeBlock code={jsxMnemonicsCode} label="components/mnemonic-buttons.tsx" />
      </section>

      {/* Use Case 2: Form Controls */}
      <section className="space-y-4 pt-4">
        <SectionHeading
          title="Hotkey Attribute on Inputs & Toggles"
          description="Attach hotkey='mod+k' to text fields for instant focus, or to switches and buttons for direct toggles."
          icon={Zap}
        />

        <div className="p-4 rounded-card bg-white border border-border shadow-lift space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="quick-search-input" className="text-[12px] font-medium text-charcoal">
                Quick Search ({findKey})
              </label>
              <div className="relative">
                <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <Hotkey keys="mod+k" label="Quick search" allowInInput>
                  <input
                    id="quick-search-input"
                    ref={searchInputRef}
                    type="text"
                    placeholder={`Press ${findKey} to focus...`}
                    onFocus={() => fire('search', 'Focused search field')}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }
                    }}
                    className="w-full h-8 pl-8 pr-12 rounded-control border border-border bg-white text-[12px] text-ink placeholder:text-muted focus:border-ember focus:ring-1 focus:ring-ember outline-none transition-colors"
                  />
                </Hotkey>
                <kbd className="absolute right-2 top-1/2 -translate-y-1/2 kbd-badge text-[9.5px]">
                  {findKey}
                </kbd>
              </div>
              <span className="text-[10px] text-muted block">Press Esc to exit input focus</span>
            </div>

            <div className="space-y-1.5">
              <div className="text-[12px] font-medium text-charcoal">
                Toggle Switch ({autosaveKey})
              </div>
              <div className="flex items-center justify-between p-1.5 px-3 rounded-control border border-border bg-sand">
                <span className="text-[12px] text-charcoal">Autosave changes</span>
                <Hotkey keys={autosaveShortcut} label="Toggle autosave" allowInInput>
                  <button
                    role="switch"
                    aria-checked={toggleAutosave}
                    onClick={() => {
                      setToggleAutosave((v) => !v);
                      fire('autosave', `Autosave toggled: ${!toggleAutosave ? 'ON' : 'OFF'}`);
                    }}
                    className="tactile-switch transition-transform active:scale-95 cursor-pointer"
                    title={`Toggle autosave with ${autosaveKey}`}
                  >
                    <span className="knob" />
                  </button>
                </Hotkey>
              </div>
              <span className="text-[10px] text-muted block">
                allowInInput enables chord during focus
              </span>
            </div>
          </div>

          <div className="min-h-[22px]">
            <FeedbackBadge
              status={feedback.search ? 'fired' : 'idle'}
              message={`Search focused via ${findKey}!`}
            />
            <FeedbackBadge
              status={feedback.autosave ? 'fired' : 'idle'}
              message={toggleAutosave ? 'Autosave ENABLED' : 'Autosave DISABLED'}
            />
          </div>
        </div>

        <CodeBlock code={formHotkeysCode} label="components/form-shortcuts.tsx" />
      </section>

      {/* Use Case 3: Manual Component Wrappers */}
      <section className="space-y-4 pt-4">
        <SectionHeading
          title="Manual Component Wrappers"
          description="Use <Mnemonic> and <Hotkey> wrappers directly in standard React with identical runtime behavior and zero compiler configuration."
          icon={Layers}
        />

        <div className="p-4 rounded-card bg-white border border-border shadow-lift flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Mnemonic
              text="&Reload"
              action={() => fire('reload-manual', `Reload triggered with ${reloadKey}`)}
            >
              <button className="btn btn--quiet btn--sm flex items-center gap-1.5">
                {buttonStates['reload-manual'] === 'loading' ? (
                  <Loader2 className="size-3.5 animate-spin text-ember" />
                ) : buttonStates['reload-manual'] === 'success' ? (
                  <Check className="size-3.5 text-grass" />
                ) : null}
                <span>Reload</span>
              </button>
            </Mnemonic>

            <Hotkey keys={buildShortcut} label="Build project">
              <button
                onClick={() => fire('build', `Build triggered with ${buildKey}`)}
                className="btn btn--quiet btn--sm flex items-center gap-1.5"
              >
                {buttonStates.build === 'loading' ? (
                  <Loader2 className="size-3.5 animate-spin text-ember" />
                ) : buttonStates.build === 'success' ? (
                  <Check className="size-3.5 text-grass" />
                ) : null}
                <span>Build ({buildKey})</span>
              </button>
            </Hotkey>
          </div>

          <div className="min-h-[22px]">
            <FeedbackBadge
              status={feedback['reload-manual'] ? 'fired' : 'idle'}
              message={`Manual <Mnemonic> fired ${reloadKey}!`}
            />
            <FeedbackBadge
              status={feedback.build ? 'fired' : 'idle'}
              message={`Manual <Hotkey> fired ${buildKey}!`}
            />
          </div>
        </div>

        <CodeBlock code={manualWrappersCode} label="components/manual-wrappers.tsx" />
      </section>

      <section className="space-y-4 pt-4">
        <SectionHeading
          title="Rich Content & Dynamic Primitives (useMnemonic)"
          description="When buttons contain icons, badges, or localized text, use useMnemonic to generate triggerProps and a clean label without replacing child elements."
          icon={Sliders}
        />

        <div className="p-4 rounded-card bg-white border border-border shadow-lift space-y-3">
          <RichMnemonicDemo
            onFire={() => fire('upload', `Upload triggered via ${uploadKey}`)}
            fired={Boolean(feedback.upload)}
          />
        </div>

        <CodeBlock code={richContentHookCode} label="components/cloud-upload.tsx" />
      </section>

      <section className="space-y-4 pt-4">
        <SectionHeading
          title="Headless Application Commands (useHotkey)"
          description="Register commands that have no visual DOM anchor, such as global save, undo, or command palette shortcuts."
          icon={Terminal}
        />

        <div className="p-4 rounded-card bg-white border border-border shadow-lift flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[13px] text-ink">Headless {jumpKey}</span>
              <span className="font-mono text-[11px] text-muted bg-stone px-2 py-0.5 rounded">
                Dispatches: {headlessCounter}
              </span>
            </div>
            <p className="text-[12px] text-muted">
              Press {jumpKey} anywhere on this page to trigger the headless handler.
            </p>
          </div>

          <div className="min-h-[22px]">
            <FeedbackBadge
              status={feedback['headless-jump'] ? 'fired' : 'idle'}
              message={`Headless ${jumpKey} handled!`}
            />
          </div>
        </div>

        <CodeBlock code={headlessHotkeyCode} label="hooks/use-editor-shortcuts.ts" />
      </section>

      <section className="space-y-4 pt-4">
        <SectionHeading
          title="Modal Scope Isolation & Collision Resolution"
          description="Wrap dialogs in <KeyboundScope modal active={open}> to automatically block background hotkeys and prioritize nested dialog bindings."
          icon={Shield}
        />

        <div className="p-4 rounded-card bg-white border border-border shadow-lift space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="space-y-0.5">
              <div className="text-[13px] font-medium text-charcoal">Modal Scope Boundary</div>
              <div className="text-[12px] text-muted">
                Open the modal to isolate keyboard dispatch. Background chords will be blocked.
              </div>
            </div>

            <button onClick={() => setModalOpen(true)} className="btn btn--orange btn--sm">
              Open Scoped Modal
            </button>
          </div>

          {isModalRendered && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <button
                type="button"
                aria-label="Dismiss modal"
                className={`fixed inset-0 bg-black/40 backdrop-blur-xs border-0 cursor-pointer w-full h-full transition-opacity duration-200 ease-out ${
                  isModalVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setModalOpen(false)}
              />
              <KeyboundScope active={modalOpen} modal name="scoped-demo-modal">
                <div
                  role="dialog"
                  aria-modal="true"
                  className={`relative z-10 w-full max-w-sm rounded-card bg-white border border-border p-5 shadow-lift-lg space-y-3 transition-all duration-200 ease-out transform ${
                    isModalVisible
                      ? 'opacity-100 scale-100 translate-y-0'
                      : 'opacity-0 scale-95 translate-y-2'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone">
                    <span className="font-mono text-[11px] text-ember font-semibold uppercase tracking-wider">
                      Scoped Dialog
                    </span>
                    <button
                      onClick={() => setModalOpen(false)}
                      className="text-muted hover:text-ink cursor-pointer"
                      aria-label="Close dialog"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[12px] text-charcoal leading-relaxed">
                      While this modal is open, background shortcuts (like {saveKey} or {exportKey}{' '}
                      on the main page) are completely suppressed by the active modal scope.
                    </p>

                    <p className="text-[11px] text-muted font-mono">
                      Background shortcuts (<kbd className="kbd-badge text-[9px]">{saveKey}</kbd>,{' '}
                      <kbd className="kbd-badge text-[9px]">{exportKey}</kbd>) are blocked while
                      this scope is active.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone">
                    <Hotkey keys="escape" label="Dismiss modal">
                      <button
                        onClick={() => setModalOpen(false)}
                        className="btn btn--quiet btn--xs font-mono text-[10px] px-2 py-0.5 cursor-pointer"
                        title="Press Escape to dismiss"
                      >
                        Esc
                      </button>
                    </Hotkey>

                    <Mnemonic text="&Close modal">
                      <button
                        onClick={() => {
                          setModalSaving(true);
                          setTimeout(() => {
                            setModalSaving(false);
                            setModalOpen(false);
                          }, 400);
                        }}
                        disabled={modalSaving}
                        className="btn btn--orange btn--sm flex items-center gap-1.5"
                      >
                        Close modal
                      </button>
                    </Mnemonic>
                  </div>
                </div>
              </KeyboundScope>
            </div>
          )}
        </div>

        <CodeBlock code={modalScopeCode} label="components/modal-dialog.tsx" />
      </section>

      <section className="space-y-4 pt-4">
        <SectionHeading
          title="Dispatch-Time Eligibility & Input Suppression"
          description="Keybound inspects the live DOM at keypress time. Disabled, hidden, or inert elements are bypassed, and typing inside text fields suppresses normal shortcuts."
          icon={Filter}
        />

        <div className="p-4 rounded-card bg-white border border-border shadow-lift space-y-4">
          <div className="flex items-center gap-4 border-b border-stone pb-3">
            <label className="flex items-center gap-2 text-[12px] font-medium text-charcoal cursor-pointer">
              <input
                type="checkbox"
                checked={isDisabled}
                onChange={(e) => setIsDisabled(e.target.checked)}
                className="rounded border-stone"
              />
              <span>Disable button</span>
            </label>

            <label className="flex items-center gap-2 text-[12px] font-medium text-charcoal cursor-pointer">
              <input
                type="checkbox"
                checked={isHidden}
                onChange={(e) => setIsHidden(e.target.checked)}
                className="rounded border-stone"
              />
              <span>Hide button (display: none)</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Mnemonic
                text="&Validate item"
                action={() => fire('validate', `Validate activated with ${validateKey}!`)}
              >
                <button
                  disabled={isDisabled}
                  style={{ display: isHidden ? 'none' : 'inline-flex' }}
                  className={`btn btn--sm ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'btn--quiet'}`}
                >
                  Validate item
                </button>
              </Mnemonic>

              {isHidden && (
                <span className="text-[11px] text-muted italic">
                  (Button is hidden via display: none)
                </span>
              )}
            </div>

            <div className="min-h-[22px]">
              <FeedbackBadge
                status={feedback.validate ? 'fired' : 'idle'}
                message={`${validateKey} dispatched to Validate!`}
              />
            </div>
          </div>

          <div className="pt-2 space-y-1.5">
            <label htmlFor="test-typing-input" className="text-[12px] font-medium text-charcoal">
              Input Field Typing Test:
            </label>
            <input
              id="test-typing-input"
              type="text"
              placeholder="Type 's' or 'a' here: shortcuts do not fire while typing (press Esc to blur)..."
              value={testInputText}
              onChange={(e) => setTestInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              className="w-full h-8 px-3 rounded-control border border-border bg-white text-[12px] text-ink placeholder:text-muted focus:border-ember focus:ring-1 focus:ring-ember outline-none"
            />
            <span className="text-[10px] text-muted block">
              Press Esc to exit focus and re-enable global shortcuts
            </span>
          </div>
        </div>

        <CodeBlock code={eligibilityCode} label="components/eligibility-demo.tsx" />
      </section>

      <section className="space-y-4 pt-4">
        <SectionHeading
          title="Visual Overlay Hints & Engine Registry"
          description="Render floating badges over all eligible elements using <KeyboundOverlay /> and query live bindings using useKeyboundCommands() or <KeyboundHelp />."
          icon={Eye}
        />

        <div className="p-4 rounded-card bg-white border border-border shadow-lift space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowOverlay((v) => !v)}
                className={`btn btn--sm ${showOverlay ? 'btn--orange' : 'btn--quiet'}`}
              >
                <Eye className="size-3.5" />
                <span>{showOverlay ? 'Hide Visual Overlay' : 'Show Visual Overlay'}</span>
              </button>

              <button onClick={() => setShowHelp((v) => !v)} className="btn btn--quiet btn--sm">
                <HelpCircle className="size-3.5" />
                <span>{showHelp ? 'Hide Help Reference' : 'Show Help Reference'}</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-muted">
              Floating badges position relative to DOM rects.
            </span>
          </div>

          <LiveCommandsInspector />

          {showHelp && (
            <div className="p-3 rounded-control border border-border bg-white space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal">
                KeyboundHelp Component Output:
              </span>
              <KeyboundHelp className="text-[12px] space-y-1" />
            </div>
          )}
        </div>

        <CodeBlock code={visualOverlayCode} label="components/overlay-help.tsx" />
      </section>

      <KeyboundOverlay open={showOverlay} />
    </div>
  );
}

export default function ExamplesPage() {
  return (
    <KeyboundProvider reveal="always">
      <ExamplesContent />
    </KeyboundProvider>
  );
}

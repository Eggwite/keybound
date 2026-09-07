import { CodeBlock } from '@/components/code-block';
import { Layers, ShieldAlert, CheckCircle2 } from 'lucide-react';

const scopeExample = `// 1. Import scope component from react-keybound
import { KeyboundScope } from "react-keybound";

// 2. Modal component managing isolated keyboard hierarchy
function ProjectModal({ open, onClose }) {

  return (

    // Modal scope suppresses background shortcuts and prioritizes nested bindings
    <KeyboundScope active={open} modal name="project-dialog">

      <div role="dialog">

        {/* Alt+S inside modal triggers modal save, not page save */}
        <button onClick={saveModal}>&Save dialog</button>

        {/* Alt+C triggers modal close */}
        <button onClick={onClose}>&Close</button>

      </div>

    </KeyboundScope>

  );

}`;

const eligibilityExample = `// 1. Disabled or inert controls are skipped at dispatch time
<button disabled onClick={deleteItem}>&Delete</button>

// 2. Typing in text fields suppresses normal shortcuts automatically
<input placeholder="Type something..." />

// 3. Opt-in with allowInInput if you want an in-field shortcut
useHotkey("escape", clearInput, { allowInInput: true });`;

export default function BehaviorPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-stone pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Scopes & Dispatch Behavior</h1>
        <p className="text-[14px] text-muted">
          Understand how Keybound resolves shortcuts, modal isolation, and browser eligibility.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-ember" />
          <h2 className="text-[15px] font-semibold text-ink">Modal Scopes & Isolation</h2>
        </div>
        <p className="text-[13px] text-muted leading-relaxed">
          When a modal dialog or drawer is active, you don't want background page hotkeys triggering
          by accident. Wrapping modal content in{' '}
          <code>&lt;KeyboundScope modal active=&#123;open&#125;&gt;</code> isolates the keyboard
          tree cleanly.
        </p>
        <CodeBlock code={scopeExample} label="components/modal.tsx" />
      </section>

      <section className="space-y-3 pt-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-4 text-blue" />
          <h2 className="text-[15px] font-semibold text-ink">Dispatch-Time Eligibility</h2>
        </div>
        <p className="text-[13px] text-muted leading-relaxed">
          Keybound checks the actual DOM state when the key is pressed, not when registered. If a
          button is disabled, inert, or hidden behind CSS (<code>display: none</code>), it is
          ignored.
        </p>
        <CodeBlock code={eligibilityExample} label="components/form.tsx" />
      </section>

      <section className="space-y-3 pt-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-4 text-ember" />
          <h2 className="text-[15px] font-semibold text-ink">
            Semantic Character Matching &amp; macOS
          </h2>
        </div>
        <p className="text-[13px] text-muted leading-relaxed">
          Mnemonics are semantic character shortcuts: Keybound matches{' '}
          <code>KeyboardEvent.key</code>, respecting the user&apos;s active keyboard layout and
          remapping. It never infers characters from physical key positions (<code>event.code</code>
          ) or legacy key codes.
        </p>
        <p className="text-[13px] text-muted leading-relaxed">
          On macOS and iPadOS, the Option key acts as an alternative glyph modifier and dead-key
          composer (e.g. Option+S produces &ldquo;ß&rdquo;, Option+X produces &ldquo;≈&rdquo;, and
          Option+E produces a dead key). Because Keybound adheres strictly to semantic matching,
          these glyphs do not match ASCII letters under an <code>alt</code> modifier.
        </p>
        <p className="text-[13px] text-muted leading-relaxed">
          To provide seamless cross-platform ergonomics, <code>&lt;KeyboundProvider&gt;</code>{' '}
          defaults to <code>mnemonicModifier=&quot;auto&quot;</code>. This automatically resolves to{' '}
          <code>Alt</code> on Windows and Linux, and <code>mod</code> (⌘ Command) on macOS and
          iPadOS.
        </p>
        <p className="text-[13px] text-muted leading-relaxed">
          While <code>mod</code> (⌘) provides a native Mac experience, browsers reserve certain
          shortcuts (such as <code>⌘L</code> for WebKit&apos;s address bar, <code>⌘W</code> to close
          tabs, and <code>⌘R</code> to reload) that web apps cannot intercept. You can provide a
          granular platform map to use <code>Control</code> (⌃) on Mac for 100% collision-free
          accelerators:
        </p>
        <div className="font-mono text-[12px] bg-sand/30 border border-stone rounded p-2.5 text-ink">
          <code>
            mnemonicModifier=&#123;&#123; mac: &apos;ctrl&apos;, windows: &apos;alt&apos;, linux:
            &apos;alt&apos; &#125;&#125;
          </code>
        </div>
        <p className="text-[13px] text-muted leading-relaxed">
          Explicitly configuring <code>mnemonicModifier=&quot;alt&quot;</code> on an Apple platform
          will emit a development warning (<code>mac-alt-mnemonic</code>), which can be suppressed
          via the <code>warnings</code> prop.
        </p>
      </section>

      <div className="rounded-panel border border-border bg-white p-4 space-y-2">
        <span className="text-[12px] font-semibold text-charcoal uppercase tracking-wider">
          Summary of Rules
        </span>
        <ul className="space-y-1.5 text-[12.5px] text-muted">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="size-3.5 text-grass flex-none" />
            <span>
              Semantic matching via <code>KeyboardEvent.key</code>; physical key codes are never
              used.
            </span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="size-3.5 text-grass flex-none" />
            <span>Deepest active scope wins collisions.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="size-3.5 text-grass flex-none" />
            <span>Focused element has highest priority within the active scope.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="size-3.5 text-grass flex-none" />
            <span>
              Composition, dead-key, IME, AltGraph, and repeated keys do not trigger accidental
              actions.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

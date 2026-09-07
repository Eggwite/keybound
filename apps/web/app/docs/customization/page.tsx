import { CodeBlock } from '@/components/code-block';
import { Sliders, Eye, HelpCircle } from 'lucide-react';

const hookExample = `// 1. Import mnemonic hook
import { useMnemonic } from "react-keybound";

// 2. Custom button component with rich nested children
export function CustomButton({ onSave }) {

  // Returns formatted ReactNode label, accessible text, and triggerProps
  const { label, text, triggerProps } = useMnemonic<HTMLButtonElement>(

    "&Save to Cloud",

    {

      action: "click",

      className: "text-ember underline font-medium",

    }

  );

  return (

    <button {...triggerProps} onClick={onSave} title={text}>

      <CloudIcon />

      <span>{label}</span>

    </button>

  );

}`;

const hotkeyExample = `// 1. Import headless hotkey hook
import { useHotkey } from "react-keybound";

// 2. Global headless keyboard listener
export function GlobalShortcuts() {

  // Register command palette shortcut
  useHotkey("mod+shift+k", () => {

    console.log("Global command triggered");

  });

  return null;

}`;

const overlayExample = `// 1. Import provider, visual overlay, and accessible help list
import { KeyboundProvider, KeyboundOverlay, KeyboundHelp } from "react-keybound";

// 2. Root application setup with dynamic hint controls
export function App() {

  const [hintsOpen, setHintsOpen] = useState(false);

  return (

    // Configure reveal mode and platform-aware mnemonic modifier
    <KeyboundProvider reveal="modifier" mnemonicModifier="auto">

      {/* Renders floating shortcut badges over eligible elements */}
      <KeyboundOverlay open={hintsOpen} />

      {/* Accessible keyboard shortcut reference sheet */}
      <KeyboundHelp className="my-custom-list" />

    </KeyboundProvider>

  );

}`;

export default function CustomizationPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-stone pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Hooks & Customization API</h1>
        <p className="text-[14px] text-muted">
          When static JSX markup is not enough: dynamic icons, translations, headless hotkeys, and
          hints.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sliders className="size-4 text-ember" />
          <h2 className="text-[15px] font-semibold text-ink">useMnemonic Hook</h2>
        </div>
        <p className="text-[13px] text-muted leading-relaxed">
          Use the hook when your button has complex internal elements (icons, badges, rich tooltips)
          or translated text that cannot be analyzed statically at build time.
        </p>
        <CodeBlock code={hookExample} label="components/custom-button.tsx" />
      </section>

      <section className="space-y-3 pt-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="size-4 text-blue" />
          <h2 className="text-[15px] font-semibold text-ink">useHotkey Hook</h2>
        </div>
        <p className="text-[13px] text-muted leading-relaxed">
          Register commands without a visual DOM target. Ideal for application-wide shortcuts,
          navigation, or headless controls.
        </p>
        <CodeBlock code={hotkeyExample} label="hooks/use-shortcuts.ts" />
      </section>

      <section className="space-y-3 pt-4">
        <div className="flex items-center gap-2">
          <Eye className="size-4 text-grass" />
          <h2 className="text-[15px] font-semibold text-ink">Overlay Hints & KeyboundHelp</h2>
        </div>
        <p className="text-[13px] text-muted leading-relaxed">
          <code>&lt;KeyboundOverlay /&gt;</code> provides a clean floating badge overlay over all
          currently eligible buttons, while <code>&lt;KeyboundHelp /&gt;</code> renders an
          accessible reference list.
        </p>
        <CodeBlock code={overlayExample} label="components/app-provider.tsx" />
      </section>
    </div>
  );
}

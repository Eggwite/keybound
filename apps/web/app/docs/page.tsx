'use client';

import * as React from 'react';
import { CodeBlock } from '@/components/code-block';
import { InstallCommand } from '@/components/install-command';
import { NextjsIcon, ViteIcon, ReactIcon } from '@/components/framework-icons';
import { HelpCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface FrameworkOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresBuildPlugin: boolean;
  installCode: string;
  configPath?: string;
  configCode?: string;
  configExplainer?: React.ReactNode;
  usagePath: string;
  usageCode: string;
  examplePath: string;
  exampleCode: string;
}

const FRAMEWORKS: FrameworkOption[] = [
  {
    id: 'next',
    name: 'Next.js',
    description: 'App Router & Pages Router with Turbopack or Webpack',
    icon: NextjsIcon,
    requiresBuildPlugin: true,
    installCode: 'npm i react-keybound',
    configPath: 'next.config.ts',
    configCode: `// 1. Import Next.js plugin wrapper
import { withKeybound } from "react-keybound/next";

// 2. Wrap Next.js config (handles <button>&Save</button> automatically)
export default withKeybound({});

// Optional: for custom UI components like shadcn Button:
// export default withKeybound({}, { components: ["Button"] });`,
    configExplainer: (
      <div className="rounded-panel border border-stone bg-sand p-3.5 text-[12px] text-charcoal space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-ink">
          <HelpCircle className="size-4 text-ember shrink-0" />
          <span>
            Why is <code>withKeybound</code> needed in Next.js?
          </span>
        </div>
        <p className="text-[12px] text-muted leading-relaxed">
          React renders strings like <code>&quot;&amp;Save&quot;</code> literally as text by
          default. <code>withKeybound</code> enables a lightweight build-time transform so you can
          write <code>&lt;button&gt;&amp;Save&lt;/button&gt;</code> and{' '}
          <code>&lt;input hotkey=&quot;mod+k&quot; /&gt;</code> directly in JSX without manual
          wrapper tags.
        </p>
        <p className="text-[12px] text-muted leading-relaxed">
          <strong>
            Is <code>components: [&quot;Button&quot;]</code> required?
          </strong>{' '}
          No! Standard HTML tags (<code>&lt;button&gt;</code>, <code>&lt;a&gt;</code>,{' '}
          <code>&lt;input&gt;</code>, <code>&lt;label&gt;</code>, <code>&lt;summary&gt;</code>) work
          automatically with just <code>withKeybound(&#123;&#125;)</code>. You only pass{' '}
          <code>components</code> if you use custom design-system buttons (like shadcn{' '}
          <code>&lt;Button&gt;</code>).
        </p>
      </div>
    ),
    usagePath: 'app/layout.tsx',
    usageCode: `'use client';

import { KeyboundProvider } from "react-keybound";

import type {} from "react-keybound/jsx";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <KeyboundProvider>
      {children}
    </KeyboundProvider>
  );
}`,
    examplePath: 'app/page.tsx',
    exampleCode: `<button onClick={save}>&Save</button>

<button onClick={exportDoc}>E&xport</button>

<input hotkey="mod+k" placeholder="Search..." aria-label="Search" />`,
  },
  {
    id: 'vite',
    name: 'Vite',
    description: 'Vite React plugin with instant HMR and manifest generation',
    icon: ViteIcon,
    requiresBuildPlugin: true,
    installCode: 'npm i react-keybound',
    configPath: 'vite.config.ts',
    configCode: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import keybound from "react-keybound/vite";

export default defineConfig({
  plugins: [
    keybound(),
    react(),
  ],
});`,
    configExplainer: (
      <div className="rounded-panel border border-stone bg-sand p-3.5 text-[12px] text-charcoal space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-ink">
          <HelpCircle className="size-4 text-ember shrink-0" />
          <span>
            Why is <code>keybound()</code> needed in Vite?
          </span>
        </div>
        <p className="text-[12px] text-muted leading-relaxed">
          The Vite plugin transforms JSX at dev and build time so <code>&amp;Save</code> labels
          compile to underlined mnemonics with Alt+S shortcuts. Native HTML elements work out of the
          box with <code>keybound()</code>.
        </p>
      </div>
    ),
    usagePath: 'src/App.tsx',
    usageCode: `import { KeyboundProvider } from "react-keybound";

import type {} from "react-keybound/jsx";

export function App() {
  return (
    <KeyboundProvider>
      <main>
        <button onClick={() => console.log('Saved')}>&Save project</button>
      </main>
    </KeyboundProvider>
  );
}`,
    examplePath: 'src/components/Toolbar.tsx',
    exampleCode: `<button onClick={undo}>&Undo</button>

<button hotkey="mod+shift+p">Command Palette</button>`,
  },
  {
    id: 'manual',
    name: 'Babel / Manual',
    description: 'Use the standalone Babel plugin or the raw runtime hook API',
    icon: ReactIcon,
    requiresBuildPlugin: false,
    installCode: 'npm i react-keybound',
    configPath: '.babelrc.json',
    configCode: `{
  "plugins": [
    ["react-keybound/babel", {
      "components": ["Button"]
    }]
  ]
}`,
    configExplainer: (
      <div className="rounded-panel border border-stone bg-sand p-3 text-[12px] text-charcoal">
        <p className="text-[12px] text-muted leading-relaxed">
          Use the raw Babel plugin if you are managing your own webpack/rollup build chain. Next.js
          and Vite users should use <code>react-keybound/next</code> or{' '}
          <code>react-keybound/vite</code> instead.
        </p>
      </div>
    ),
    usagePath: 'src/App.tsx (or app/layout.tsx)',
    usageCode: `// 1. Mount standard runtime provider
import { KeyboundProvider } from "react-keybound";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <KeyboundProvider>
      {children}
    </KeyboundProvider>
  );
}`,
    examplePath: 'src/components/Toolbar.tsx',
    exampleCode: `// 1. Zero-config wrappers: no build configuration needed
import { Mnemonic, Hotkey, useMnemonic } from "react-keybound";

// 2. Wrap native button: underlines 'S' and binds Alt+S
<Mnemonic text="&Save">
  <button onClick={save}>Save</button>
</Mnemonic>

// 3. Wrap form control: focuses on Command/Ctrl+K
<Hotkey keys="mod+k" label="Search">
  <input placeholder="Search..." aria-label="Search" />
</Hotkey>

// 4. Or use headless hook for custom UI primitives
const { label, triggerProps } = useMnemonic("&Export");
<button {...triggerProps}>{label}</button>`,
  },
];

export default function InstallationPage() {
  const [selectedFw, setSelectedFw] = React.useState('next');
  const [manualMode, setManualMode] = React.useState<'zero-config' | 'babel'>('zero-config');
  const active = FRAMEWORKS.find((f) => f.id === selectedFw) || FRAMEWORKS[0];

  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-stone pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Installation</h1>
        <p className="text-[14px] text-muted">
          Choose your framework to get the right compiler wrapper and runtime setup.
        </p>
      </div>

      <div className="space-y-3">
        <div className="text-[12px] font-semibold text-charcoal uppercase tracking-wider">
          Pick your framework
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {FRAMEWORKS.map((fw) => {
            const isSelected = fw.id === selectedFw;
            const Icon = fw.icon;
            return (
              <button
                key={fw.id}
                onClick={() => setSelectedFw(fw.id)}
                className={`p-4 sm:p-5 rounded-card text-left transition-all cursor-pointer border relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-ember bg-white shadow-lift'
                    : 'border-border bg-white hover:border-border-strong hover:bg-sand'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-ink">
                      <Icon className="size-8" />
                    </div>
                    {isSelected && <span className="size-2 rounded-full bg-ember" />}
                  </div>
                  <div className="font-semibold text-[14px] text-ink mb-1">{fw.name}</div>
                  <p className="text-[12px] text-muted leading-relaxed">{fw.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-stone font-mono text-[11px] font-semibold text-charcoal">
            1
          </span>
          <h2 className="text-[14px] font-semibold text-ink">Install the package</h2>
        </div>
        <p className="text-[13px] text-muted">Install the core package into your dependencies:</p>
        <InstallCommand />
      </div>

      {active.id === 'manual' ? (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-stone font-mono text-[11px] font-semibold text-charcoal">
                2
              </span>
              <h2 className="text-[14px] font-semibold text-ink">Choose runtime or build mode</h2>
            </div>
            <div className="inline-flex rounded-control bg-sand p-0.5 border border-stone text-[11px]">
              <button
                type="button"
                onClick={() => setManualMode('zero-config')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  manualMode === 'zero-config'
                    ? 'bg-white text-ink shadow-xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                Zero-Config Runtime
              </button>
              <button
                type="button"
                onClick={() => setManualMode('babel')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  manualMode === 'babel'
                    ? 'bg-white text-ink shadow-xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                Babel Compiler Plugin
              </button>
            </div>
          </div>

          {manualMode === 'zero-config' ? (
            <div className="rounded-panel border border-emerald-200 bg-emerald-50/50 p-3.5 text-[12px] text-emerald-900 space-y-1">
              <p className="font-medium">✓ No build plugin or bundler changes needed!</p>
              <p className="text-emerald-700">
                You can proceed directly to mounting the provider and using the{' '}
                <code>&lt;Mnemonic&gt;</code> wrapper, <code>&lt;Hotkey&gt;</code> wrapper, or{' '}
                <code>useMnemonic</code> headless hook.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[13px] text-muted">
                Wrap your Babel configuration so JSX mnemonics like{' '}
                <code>&lt;button&gt;&amp;Save&lt;/button&gt;</code> are transformed into keyboard
                shortcuts during compilation.
              </p>
              {active.configCode && active.configPath && (
                <CodeBlock code={active.configCode} label={active.configPath} />
              )}
              {active.configExplainer}
            </div>
          )}
        </div>
      ) : active.requiresBuildPlugin ? (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-stone font-mono text-[11px] font-semibold text-charcoal">
              2
            </span>
            <h2 className="text-[14px] font-semibold text-ink">Add the 1-line build wrapper</h2>
          </div>
          <p className="text-[13px] text-muted">
            Wrap your configuration file so JSX mnemonics like{' '}
            <code>&lt;button&gt;&amp;Save&lt;/button&gt;</code> are transformed into keyboard
            shortcuts during compilation.
          </p>
          {active.configCode && active.configPath && (
            <CodeBlock code={active.configCode} label={active.configPath} />
          )}
          {active.configExplainer}
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-mono text-[11px] font-semibold">
              ✓
            </span>
            <h2 className="text-[14px] font-semibold text-ink">Step 2: No build plugin needed!</h2>
          </div>
          <div className="rounded-panel border border-emerald-200 bg-emerald-50/50 p-3.5 text-[12px] text-emerald-900 space-y-1">
            <p className="font-medium">
              Zero-config mode requires no changes to your build tools, bundler, or config files.
            </p>
            <p className="text-emerald-700">
              You can proceed directly to mounting the provider and using the{' '}
              <code>&lt;Mnemonic&gt;</code> wrapper or <code>useMnemonic</code> hook.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-stone font-mono text-[11px] font-semibold text-charcoal">
            3
          </span>
          <h2 className="text-[14px] font-semibold text-ink">
            Mount KeyboundProvider at your root
          </h2>
        </div>
        <p className="text-[13px] text-muted">
          Place <code>KeyboundProvider</code> at the root of your application layout. It installs a
          single global dispatcher with zero extra DOM wrappers.
        </p>
        <CodeBlock code={active.usageCode} label={active.usagePath} />
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-stone font-mono text-[11px] font-semibold text-charcoal">
            4
          </span>
          <h2 className="text-[14px] font-semibold text-ink">
            {active.id === 'manual' && manualMode === 'zero-config'
              ? 'Use standalone wrappers or hooks'
              : 'Write shortcuts in clean JSX'}
          </h2>
        </div>
        <p className="text-[13px] text-muted">
          {active.id === 'manual' && manualMode === 'zero-config'
            ? 'Wrap existing buttons and inputs with <Mnemonic> and <Hotkey> without altering your components.'
            : 'Controls keep their native handlers, focus behavior, and accessibility tree intact.'}
        </p>
        <CodeBlock code={active.exampleCode} label={active.examplePath} />
      </div>

      <div className="pt-4 border-t border-stone flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="text-[13px] font-semibold text-ink">Ready to see it in action?</div>
          <div className="text-[12px] text-muted">
            Explore 8 interactive use cases covering mnemonics, hotkeys, scopes, and visual
            overlays.
          </div>
        </div>
        <Link
          href="/docs/examples"
          className="btn btn--orange btn--sm inline-flex items-center gap-1.5"
        >
          <span>View Examples</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { InstallCommand } from '@/components/install-command';
import { KeyboundStudio } from '@/components/keybound-studio';
import { VisualCards } from '@/components/visual-cards';
import { CodeBlock } from '@/components/code-block';

const sampleJsx = `// 1. Initial letter mnemonic compiles to Alt+S
<button onClick={save}>&Save</button>

// 2. Mid-word mnemonic compiles to Alt+X
<button onClick={exportDoc}>E&xport</button>

// 3. Hotkey attribute compiles to ⌘K or Ctrl+K focus
<input hotkey="mod+k" aria-label="Search" />`;

const sampleConfig = `import { withKeybound } from "react-keybound/next";

// 1. One-line wrapper for your Next.js config
export default withKeybound({});

// 2. (Optional) Register custom UI components (e.g. shadcn Button)
export default withKeybound({}, { components: ["Button"] });`;

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Keybound',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'Compile-time keyboard annotations for React. Inline &Save mnemonics, mod+k hotkeys, nested modal scopes, and live hint overlays with an under 8KB runtime.',
  url: 'https://keybound.eggwite.moe',
  softwareVersion: '0.1.1',
  author: {
    '@type': 'Person',
    name: 'Eggwite',
    url: 'https://github.com/Eggwite',
  },
  downloadUrl: 'https://www.npmjs.com/package/react-keybound',
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <main className="shell pt-20 sm:pt-28 pb-32 space-y-36 sm:space-y-48">
        <section className="text-center max-w-xl mx-auto space-y-8 pt-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone bg-white px-3.5 py-1 text-[12px] font-medium text-charcoal shadow-xs">
            <span className="flex size-1.5 rounded-full bg-ember" />
            <span>Desktop-style mnemonics &amp; hotkeys for React</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-[-0.035em] text-ink leading-[1.08] font-title">
            Keyboard intent that feels{' '}
            <span className="text-ember font-serif italic font-normal">native</span>.
          </h1>

          <p className="text-[14.5px] sm:text-[15.5px] text-muted leading-relaxed max-w-lg mx-auto">
            Winforms-esque mnemonics and hotkeys in a single package. Write{' '}
            <code className="text-charcoal font-semibold">&amp;Save</code> or{' '}
            <code className="text-charcoal font-semibold">E&amp;xport</code> directly in JSX.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/docs" className="btn btn--orange">
              Documentation <ArrowRight className="size-3.5" />
            </Link>
            <a
              href="https://github.com/Eggwite/keybound"
              target="_blank"
              rel="noreferrer"
              className="btn btn--quiet flex items-center gap-1.5"
            >
              <Star className="size-3.5 text-ember fill-ember" />
              <span>Star on GitHub</span>
            </a>
          </div>

          <div className="pt-2 max-w-md mx-auto">
            <InstallCommand />
          </div>
        </section>

        <section className="space-y-6">
          <KeyboundStudio />
        </section>

        <VisualCards />

        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-ember font-semibold">
                02 / Integration
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink mt-1 font-title">
                Compile-time setup &amp; JSX annotations
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-charcoal">JSX Annotations</span>
                <span className="font-mono text-[11px] text-muted">Compile-time transform</span>
              </div>
              <CodeBlock code={sampleJsx} label="components/actions.tsx" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-charcoal">Build Setup</span>
                <span className="font-mono text-[11px] text-muted">Next.js &amp; Vite</span>
              </div>
              <CodeBlock code={sampleConfig} label="next.config.ts" />
            </div>
          </div>
        </section>

        <section className="rounded-card border border-border bg-white p-8 sm:p-12 text-center space-y-6 shadow-lift relative overflow-hidden">
          <div className="max-w-md mx-auto space-y-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ember font-semibold">
              Ready to build?
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-title">
              Bring desktop-grade keyboard intent to your React apps.
            </h2>
            <p className="text-[13.5px] text-muted leading-relaxed">
              Install via your favorite package manager.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/docs" className="btn btn--orange">
              Documentation <ArrowRight className="size-3.5" />
            </Link>
            <a
              href="https://github.com/Eggwite/keybound"
              target="_blank"
              rel="noreferrer"
              className="btn btn--quiet flex items-center gap-1.5"
            >
              <Star className="size-3.5 text-ember fill-ember" />
              <span>GitHub</span>
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

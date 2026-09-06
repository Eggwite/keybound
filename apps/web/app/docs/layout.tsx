'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { BookOpen, Layers, Sliders, ChevronRight, Code2 } from 'lucide-react';

const DOC_PAGES = [
  { href: '/docs', title: 'Installation & Setup', icon: BookOpen },
  { href: '/docs/examples', title: 'Interactive Examples', icon: Code2 },
  { href: '/docs/behavior', title: 'Scopes & Dispatch', icon: Layers },
  { href: '/docs/customization', title: 'Hooks & API', icon: Sliders },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [indicatorStyle, setIndicatorStyle] = React.useState({
    top: 0,
    height: 0,
    ready: false,
    animate: false,
  });
  const itemRefs = React.useRef<(HTMLAnchorElement | null)[]>([]);
  const isInitialMount = React.useRef(true);

  React.useEffect(() => {
    const activeIndex = DOC_PAGES.findIndex((p) => p.href === pathname);
    const activeEl = itemRefs.current[activeIndex];
    if (activeEl) {
      if (isInitialMount.current) {
        setIndicatorStyle({
          top: activeEl.offsetTop,
          height: activeEl.offsetHeight,
          ready: true,
          animate: false,
        });
        isInitialMount.current = false;
      } else {
        setIndicatorStyle({
          top: activeEl.offsetTop,
          height: activeEl.offsetHeight,
          ready: true,
          animate: true,
        });
      }
    }
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <SiteHeader />

      <div className="shell flex-1 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <aside className="md:col-span-3">
            <div className="sticky top-20 space-y-4">
              <div className="text-[11px] font-semibold tracking-wider text-muted">
                Documentation
              </div>
              <nav className="relative flex flex-col gap-1">
                <div
                  className="absolute left-0 right-0 rounded-md bg-white shadow-xs border border-border pointer-events-none"
                  style={{
                    top: 0,
                    height: indicatorStyle.height,
                    transform: `translateY(${indicatorStyle.top}px)`,
                    opacity: indicatorStyle.ready ? 1 : 0,
                    transitionProperty: 'transform, height, opacity',
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDuration: indicatorStyle.animate ? '220ms' : '0ms',
                  }}
                />

                {DOC_PAGES.map((page, idx) => {
                  const Icon = page.icon;
                  const isActive = pathname === page.href;
                  return (
                    <Link
                      key={page.href}
                      href={page.href}
                      ref={(el) => {
                        itemRefs.current[idx] = el;
                      }}
                      className={`relative z-10 flex items-center justify-between px-3 py-2 text-[12.5px] rounded-md font-medium transition-colors duration-150 ${
                        isActive ? 'text-ink' : 'text-muted hover:text-ink hover:bg-sand/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          className={`size-3.5 transition-colors duration-200 ${
                            isActive ? 'text-ember' : 'text-muted'
                          }`}
                        />
                        <span>{page.title}</span>
                      </div>
                      <ChevronRight
                        className={`size-3 transition-all duration-200 ${
                          isActive
                            ? 'opacity-100 translate-x-0 text-muted'
                            : 'opacity-0 -translate-x-1.5 pointer-events-none text-transparent'
                        }`}
                      />
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          <main className="md:col-span-9 max-w-3xl space-y-8">{children}</main>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

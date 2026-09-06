'use client';

import type {} from 'react-keybound/jsx';
import { Eye, EyeOff, Search } from 'lucide-react';
import { Hotkey, KeyboundScope, useMnemonic } from 'react-keybound';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

function StyledMnemonic({ text, onFire }: { text: string; onFire: () => void }) {
  const { label, triggerProps } = useMnemonic<HTMLButtonElement>(text, {
    className: 'text-[#b7ff4a] decoration-2 underline-offset-4',
  });
  return (
    <button
      {...triggerProps}
      onClick={onFire}
      className="rounded-sm border border-white/15 bg-black/20 px-3 py-2 text-sm text-white hover:border-[#b7ff4a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b7ff4a]"
    >
      {label}
    </button>
  );
}

type Props = {
  checked: boolean;
  disabled: boolean;
  hidden: boolean;
  modalOpen: boolean;
  query: string;
  reveal: 'always' | 'modifier' | 'never';
  onCheckedChange: (checked: boolean) => void;
  onDisabledChange: () => void;
  onHiddenChange: () => void;
  onModalChange: (open: boolean) => void;
  onQueryChange: (query: string) => void;
  onRevealChange: (reveal: 'always' | 'modifier' | 'never') => void;
  push: (message: string) => void;
};

export function RuntimeTabs({
  checked,
  disabled,
  hidden,
  modalOpen,
  query,
  reveal,
  onCheckedChange,
  onDisabledChange,
  onHiddenChange,
  onModalChange,
  onQueryChange,
  onRevealChange,
  push,
}: Props) {
  return (
    <section id="lab" className="page-shell py-16 sm:py-24">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-[#b7ff4a]">01 / Runtime lab</p>
          <h2 className="display mt-3 text-3xl font-semibold sm:text-4xl">
            Try the actual bindings.
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-[#99a397]">
          Use the marked key, or click. The editable field intentionally ignores keystrokes unless
          its own command is invoked.
        </p>
      </div>
      <Tabs defaultValue="semantic">
        <TabsList aria-label="Demo panels">
          <TabsTrigger value="semantic">Semantic controls</TabsTrigger>
          <TabsTrigger value="labels">Label editor</TabsTrigger>
          <TabsTrigger value="scopes">Scopes & collisions</TabsTrigger>
        </TabsList>
        <TabsContent value="semantic">
          <div className="grid gap-4 lg:grid-cols-[1fr_.8fr]">
            <div className="border border-white/15 bg-[#10140f] p-5">
              <p className="eyebrow">Focus and native activation</p>
              <div className="mt-5 grid gap-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-3 size-4 text-[#879184]" />
                  <input
                    hotkey="mod+k"
                    className="flex h-10 w-full rounded-sm border border-white/15 bg-black/20 py-2 pl-9 pr-3 text-sm text-[#f4f7ef] outline-none placeholder:text-[#697066] focus:border-[#b7ff4a] focus:ring-1 focus:ring-[#b7ff4a]"
                    aria-label="Search documentation"
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder="Focus me with Ctrl/⌘ K"
                  />
                </div>
                <div className="flex items-center justify-between border border-white/10 px-3 py-2">
                  <label htmlFor="autosave" className="text-sm text-[#e2e9dc]">
                    Autosave
                  </label>
                  <Hotkey keys="mod+shift+a" label="Toggle autosave">
                    <Switch
                      id="autosave"
                      checked={checked}
                      onCheckedChange={(next) => {
                        onCheckedChange(next);
                        push(`Autosave ${next ? 'on' : 'off'}`);
                      }}
                    />
                  </Hotkey>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button disabled={disabled} onClick={() => push('Archive clicked')}>
                    &Archive
                  </button>
                  <Button variant="outline" size="sm" onClick={onDisabledChange}>
                    {disabled ? 'Enable archive' : 'Disable archive'}
                  </Button>
                </div>
                <p className="font-mono text-[11px] text-[#7f8b7b]">
                  Try Ctrl/⌘ K, Ctrl/⌘ Shift A, or Alt+A. Disabled controls are filtered at
                  dispatch.
                </p>
              </div>
            </div>
            <div className="border border-white/15 bg-black/15 p-5">
              <p className="eyebrow">Eligibility</p>
              <div className="mt-5 space-y-4 text-sm text-[#aeb8a9]">
                <div className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-[#b7ff4a]" />
                  Focusable input receives focus
                </div>
                <div className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-[#b7ff4a]" />
                  Switch uses native click semantics
                </div>
                <div className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-[#697066]" />
                  Typing stays uninterrupted
                </div>
                <div className="border-t border-white/10 pt-4 font-mono text-[11px] text-[#7d8878]">
                  Query: {query || 'none'}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="labels">
          <div className="grid gap-4 lg:grid-cols-[1fr_.8fr]">
            <div className="border border-white/15 bg-[#10140f] p-5">
              <p className="eyebrow">Hook output, custom marked character</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <StyledMnemonic text="&Publish" onFire={() => push('Publish activated')} />
                <StyledMnemonic text="&Preview" onFire={() => push('Preview activated')} />
              </div>
              <div className="mt-7 border-t border-white/10 pt-5">
                <p className="mb-3 text-sm text-[#dbe3d5]">Reveal policy</p>
                <div className="flex flex-wrap gap-2">
                  {(['always', 'modifier', 'never'] as const).map((value) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={reveal === value ? 'default' : 'outline'}
                      onClick={() => onRevealChange(value)}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="border border-white/15 bg-black/15 p-5">
              <p className="eyebrow">What gets rendered</p>
              <code className="mt-5 block border border-white/10 bg-black/30 p-3 font-mono text-xs leading-6 text-[#cbe0bf]">
                const {'{ label, triggerProps }'} =<br />
                useMnemonic('&amp;Publish', {'{ className }'});
              </code>
              <p className="mt-4 text-sm leading-6 text-[#9da79a]">
                The hook returns a React label plus props for the real target. Rich labels and
                design-system buttons stay explicit.
              </p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="scopes">
          <div className="grid gap-4 lg:grid-cols-[1fr_.8fr]">
            <div className="border border-white/15 bg-[#10140f] p-5">
              <p className="eyebrow">Hidden targets and portal modal scope</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={onHiddenChange}>
                  {hidden ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                  {hidden ? 'Show target' : 'Hide target'}
                </Button>
                <button hidden={hidden} onClick={() => push('Background open activated')}>
                  &Open background
                </button>
                <Dialog open={modalOpen} onOpenChange={onModalChange}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Open modal scope
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <KeyboundScope active={modalOpen} modal name="modal">
                      <DialogTitle>Modal scope is active</DialogTitle>
                      <DialogDescription>
                        Alt+O resolves here. The background command is blocked while this scope is
                        open.
                      </DialogDescription>
                      <div className="mt-6">
                        <button onClick={() => push('Modal open activated')}>
                          &Open modal item
                        </button>
                      </div>
                    </KeyboundScope>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="mt-5 font-mono text-[11px] text-[#7e897b]">
                Press Alt+O with the modal open, then closed. The trace identifies the winner.
              </p>
            </div>
            <div className="border border-white/15 bg-black/15 p-5">
              <p className="eyebrow">Dispatch order</p>
              <ol className="mt-5 space-y-3 text-sm text-[#aeb8a9]">
                <li className="flex gap-3">
                  <span className="font-mono text-[#b7ff4a]">01</span>Active modal scope
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-[#b7ff4a]">02</span>Deepest active scope
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-[#b7ff4a]">03</span>Focused eligible target
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-[#b7ff4a]">04</span>Registration order
                </li>
              </ol>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

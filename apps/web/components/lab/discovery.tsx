'use client';

import { Keyboard } from 'lucide-react';
import { KeyboundHelp } from 'react-keybound';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export function LabDiscovery({
  helpOpen,
  onOpenChange,
}: {
  helpOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <>
      <section className="border-y border-white/[.08] bg-[#0c100b] py-14">
        <div className="page-shell grid gap-5 lg:grid-cols-[1fr_.85fr]">
          <div>
            <p className="eyebrow text-[#b7ff4a]">02 / Discovery</p>
            <h2 className="display mt-3 text-3xl font-semibold">A command list from live UI.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#9ca69a]">
              KeyboundHelp reads the provider’s eligible registrations. Hidden, disabled and
              unmounted targets do not get advertised.
            </p>
            <Button className="mt-5" variant="outline" onClick={() => onOpenChange(true)}>
              <Keyboard className="size-4" /> Open discovery
            </Button>
          </div>
          <div className="border border-white/15 bg-black/20 p-4">
            <p className="mb-3 font-mono text-[11px] text-[#83907e]">KEYBOUND_HELP / LIVE</p>
            <KeyboundHelp className="text-sm text-[#dce5d7]" />
          </div>
        </div>
      </section>
      <Dialog open={helpOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Available commands</DialogTitle>
          <DialogDescription>Only currently eligible controls appear here.</DialogDescription>
          <div className="mt-5 max-h-[50vh] overflow-auto border border-white/10 p-3">
            <KeyboundHelp className="text-sm text-[#e4ece0]" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

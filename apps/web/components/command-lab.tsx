'use client';

import * as React from 'react';
import type {} from 'react-keybound/jsx';
import { KeyboundOverlay, KeyboundProvider } from 'react-keybound';
import { LabDiscovery } from '@/components/lab/discovery';
import { LabHero, type LogEntry } from '@/components/lab/hero';
import { RuntimeTabs } from '@/components/lab/runtime-tabs';

export function CommandLab() {
  const [events, setEvents] = React.useState<LogEntry[]>([]);
  const [query, setQuery] = React.useState('');
  const [checked, setChecked] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const [hints, setHints] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [reveal, setReveal] = React.useState<'always' | 'modifier' | 'never'>('always');
  const eventId = React.useRef(0);
  const push = React.useCallback(
    (message: string) =>
      setEvents((items) => [{ id: ++eventId.current, message }, ...items].slice(0, 7)),
    [],
  );

  return (
    <KeyboundProvider
      reveal={reveal}
      warnings
      onWarning={(warning) => push(`warning: ${warning.code}`)}
    >
      <div className="lab-surface">
        <LabHero
          events={events}
          hints={hints}
          onClear={() => setEvents([])}
          onOpenHelp={() => setHelpOpen(true)}
          onSave={() => push('Save activated via mnemonic')}
          onToggleHints={() => setHints((value) => !value)}
        />
        <RuntimeTabs
          checked={checked}
          disabled={disabled}
          hidden={hidden}
          modalOpen={modalOpen}
          query={query}
          reveal={reveal}
          onCheckedChange={setChecked}
          onDisabledChange={() => setDisabled((next) => !next)}
          onHiddenChange={() => setHidden((next) => !next)}
          onModalChange={setModalOpen}
          onQueryChange={setQuery}
          onRevealChange={setReveal}
          push={push}
        />
        <LabDiscovery helpOpen={helpOpen} onOpenChange={setHelpOpen} />
        <KeyboundOverlay open={hints} />
      </div>
    </KeyboundProvider>
  );
}

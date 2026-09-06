'use client';

import * as React from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

const MANAGERS = [
  { name: 'npm', cmd: 'npm i react-keybound' },
  { name: 'pnpm', cmd: 'pnpm add react-keybound' },
  { name: 'bun', cmd: 'bun add react-keybound' },
  { name: 'yarn', cmd: 'yarn add react-keybound' },
];

export function InstallCommand() {
  const [selected, setSelected] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  const active = MANAGERS[selected];

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(active.cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Ignore
    }
  };

  const nextManager = () => {
    setSelected((prev) => (prev + 1) % MANAGERS.length);
  };

  return (
    <div className="cmd-box">
      <Terminal className="size-3.5 text-muted flex-none" />
      <button
        onClick={nextManager}
        title="Click to cycle package manager"
        className="flex items-center gap-1.5 border-0 bg-transparent p-0 font-mono text-[12px] text-muted hover:text-ink cursor-pointer"
      >
        <span>$</span>
        <span className="font-semibold text-ember">{active.name}</span>
      </button>
      <code className="select-all text-ink">{active.cmd.replace(active.name, '').trim()}</code>
      <button
        onClick={onCopy}
        aria-label="Copy install command"
        className="copy-btn ml-auto"
        title="Copy to clipboard"
      >
        {copied ? <Check className="size-3.5 text-grass" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}

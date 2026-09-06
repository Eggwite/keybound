'use client';

import * as React from 'react';
import { formatShortcut, parseShortcut } from './core';
import { type Command } from './registry';
import { useKeyboundContext } from './provider';

export type KeyboundCommand = Command;
const emptyCommands: KeyboundCommand[] = [];

export function useKeyboundCommands(): KeyboundCommand[] {
  const { registry } = useKeyboundContext();
  const commands = React.useSyncExternalStore(
    (listener) => registry.subscribe(listener),
    () => registry.getCommands(),
    () => emptyCommands,
  );
  React.useEffect(() => {
    let frame = 0;
    const scheduleRefresh = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        registry.refresh();
      });
    };
    const observer =
      typeof MutationObserver === 'undefined' ? null : new MutationObserver(scheduleRefresh);
    observer?.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        'aria-hidden',
        'aria-disabled',
        'class',
        'disabled',
        'hidden',
        'inert',
        'open',
        'style',
      ],
    });
    window.addEventListener('resize', scheduleRefresh);
    window.addEventListener('scroll', scheduleRefresh, true);
    document.addEventListener('visibilitychange', scheduleRefresh);
    document.addEventListener('toggle', scheduleRefresh, true);
    document.addEventListener('transitionend', scheduleRefresh, true);
    document.addEventListener('animationend', scheduleRefresh, true);
    scheduleRefresh();
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', scheduleRefresh);
      window.removeEventListener('scroll', scheduleRefresh, true);
      document.removeEventListener('visibilitychange', scheduleRefresh);
      document.removeEventListener('toggle', scheduleRefresh, true);
      document.removeEventListener('transitionend', scheduleRefresh, true);
      document.removeEventListener('animationend', scheduleRefresh, true);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [registry]);
  return commands;
}

export type KeyboundHelpProps = {
  className?: string;
  style?: React.CSSProperties;
  renderItem?: (command: KeyboundCommand) => React.ReactNode;
};

export function KeyboundHelp({
  className,
  style,
  renderItem,
}: KeyboundHelpProps): React.ReactElement {
  const commands = useKeyboundCommands();
  return (
    <ul className={className} style={style} aria-label="Keyboard shortcuts">
      {commands.map((command) => (
        <li key={command.id}>
          {renderItem ? (
            renderItem(command)
          ) : (
            <>
              <kbd>
                {formatShortcut(
                  parseShortcut(command.keys) ?? {
                    key: command.keys,
                    ctrl: false,
                    alt: false,
                    shift: false,
                    meta: false,
                    mod: false,
                    source: command.keys,
                  },
                )}
              </kbd>
              {command.label ? ` ${command.label}` : null}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

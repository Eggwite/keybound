'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { formatShortcut, parseShortcut } from './core';
import { useKeyboundContext } from './provider';

type Hint = {
  id: number;
  keys: string;
  label: string;
  element: HTMLElement;
  top: number;
  left: number;
};
export type KeyboundOverlayProps = {
  open?: boolean;
  className?: string;
  style?: React.CSSProperties;
  renderHint?: (hint: { keys: string; label: string; element: HTMLElement }) => React.ReactNode;
};

export function KeyboundOverlay({
  open,
  className,
  style,
  renderHint,
}: KeyboundOverlayProps): React.ReactElement | null {
  const { modifierDown, registry } = useKeyboundContext();
  const [hydrated, setHydrated] = React.useState(false);
  const [hints, setHints] = React.useState<Hint[]>([]);
  const visible = open ?? modifierDown;
  React.useEffect(() => setHydrated(true), []);

  React.useEffect(() => {
    if (!hydrated || !visible) {
      setHints((previous) => (previous.length ? [] : previous));
      return;
    }
    let frame = 0;
    const update = () => {
      const next = registry.getCommands(true).flatMap((command): Hint[] => {
        const element = command.element;
        if (!element) return [];
        const rect = element.getBoundingClientRect();
        if (
          !rect.width ||
          !rect.height ||
          rect.bottom < 0 ||
          rect.right < 0 ||
          rect.top > window.innerHeight ||
          rect.left > window.innerWidth
        )
          return [];
        return [
          {
            id: command.id,
            keys: command.keys,
            label: command.label,
            element,
            top: rect.top,
            left: rect.left,
          },
        ];
      });
      setHints((previous) =>
        previous.length === next.length &&
        previous.every((hint, index) => {
          const candidate = next[index];
          return (
            hint.id === candidate.id &&
            hint.keys === candidate.keys &&
            hint.label === candidate.label &&
            hint.element === candidate.element &&
            hint.top === candidate.top &&
            hint.left === candidate.left
          );
        })
          ? previous
          : next,
      );
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [hydrated, registry, visible]);

  if (!hydrated || !visible || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className={className}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', ...style }}
      aria-hidden="true"
    >
      {hints.map((hint) => (
        <span
          key={hint.id}
          data-keybound-overlay-hint=""
          style={{ position: 'fixed', top: hint.top, left: hint.left }}
        >
          {renderHint ? (
            renderHint(hint)
          ) : (
            <kbd>
              {formatShortcut(
                parseShortcut(hint.keys) ?? {
                  key: hint.keys,
                  ctrl: false,
                  alt: false,
                  shift: false,
                  meta: false,
                  mod: false,
                  source: hint.keys,
                },
              )}
            </kbd>
          )}
        </span>
      ))}
    </div>,
    document.body,
  );
}

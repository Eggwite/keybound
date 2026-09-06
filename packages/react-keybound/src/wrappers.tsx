'use client';

import * as React from 'react';
import { formatAriaShortcut, parseShortcut } from './core';
import { activateElement } from './registry';
import {
  composeRefs,
  useHotkeyTarget,
  useMnemonic,
  type HotkeyOptions,
  type MnemonicOptions,
} from './hooks';
import { useKeyboundContext } from './provider';

type TargetProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
  'aria-keyshortcuts'?: string;
  'data-keybound'?: string;
};

function elementRef(element: React.ReactElement<TargetProps>): React.Ref<HTMLElement> | undefined {
  if (Number(React.version.split('.')[0]) >= 19) return element.props.ref;
  return (element as React.ReactElement<TargetProps> & { ref?: React.Ref<HTMLElement> }).ref;
}

export type MnemonicProps = MnemonicOptions & { text: string; children: React.ReactElement };

export function Mnemonic({ text, children, ...options }: MnemonicProps): React.ReactElement {
  const { label, triggerProps } = useMnemonic(text, options);
  const child = React.Children.only(children) as React.ReactElement<TargetProps>;
  if (child.type === React.Fragment) return child;
  return React.cloneElement(child, {
    ...triggerProps,
    ref: composeRefs(elementRef(child), triggerProps.ref),
    children: label,
  });
}

export type HotkeyProps = HotkeyOptions & {
  keys: string;
  label?: string;
  children: React.ReactElement;
};

export function Hotkey({ keys, label, children, ...options }: HotkeyProps): React.ReactElement {
  const { apple } = useKeyboundContext();
  const actionRef = React.useRef<HTMLElement | null>(null);
  const action = options.action;
  const targetRef = useHotkeyTarget(
    keys,
    (event, element) => {
      if (element) activateElement(element, event, action);
    },
    { ...options, label, targetRef: actionRef },
  );
  const shortcut = parseShortcut(keys);
  const child = React.Children.only(children) as React.ReactElement<TargetProps>;
  if (child.type === React.Fragment) return child;
  return React.cloneElement(child, {
    ref: composeRefs(elementRef(child), actionRef, targetRef),
    'aria-keyshortcuts': shortcut ? formatAriaShortcut(shortcut, apple) : undefined,
    'data-keybound': 'hotkey',
  });
}

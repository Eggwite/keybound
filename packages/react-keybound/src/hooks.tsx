'use client';

import * as React from 'react';
import { formatAriaShortcut, parseMnemonic, parseShortcut } from './core';
import { activateElement, type BindingOptions } from './registry';
import { useKeyboundContext, useKeyboundScope } from './provider';

export type MnemonicOptions = BindingOptions & {
  className?: string;
  style?: React.CSSProperties;
};

export type HotkeyOptions = BindingOptions;

type Registration = {
  setElement: (element: HTMLElement | null) => void;
  updateOptions: (options: BindingOptions) => void;
  dispose: () => void;
};

function useBinding(
  shortcutText: string | null,
  mnemonicKey: string | null | undefined,
  kind: 'mnemonic' | 'hotkey',
  options: BindingOptions,
  callback: (event: KeyboardEvent, element: HTMLElement | null) => void,
  elementRequired: boolean,
): (element: HTMLElement | null) => void {
  const { registry } = useKeyboundContext();
  const scope = useKeyboundScope();
  const elementRef = React.useRef<HTMLElement | null>(null);
  const registrationRef = React.useRef<Registration | null>(null);
  const optionsRef = React.useRef<BindingOptions>(options);
  const callbackRef = React.useRef(callback);
  React.useEffect(() => {
    optionsRef.current = options;
    callbackRef.current = callback;
    registrationRef.current?.updateOptions(options);
  });

  React.useEffect(() => {
    const registration = registry.register({
      shortcut: shortcutText ? parseShortcut(shortcutText) : null,
      mnemonicKey,
      scope,
      elementRequired,
      kind,
      options: optionsRef.current,
      callback: (event, element) => callbackRef.current(event, element),
    });
    registrationRef.current = registration;
    registration.setElement(elementRef.current);
    return () => {
      if (registrationRef.current === registration) registrationRef.current = null;
      registration.dispose();
    };
  }, [registry, scope, shortcutText, mnemonicKey, kind, elementRequired]);

  return React.useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
    registrationRef.current?.setElement(element);
  }, []);
}

export function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (value) => {
    const callbacks = refs.map((ref) => {
      if (typeof ref === 'function') return { ref, cleanup: ref(value) };
      else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
      return { ref, cleanup: undefined };
    });
    if (
      value &&
      Number(React.version.split('.')[0]) >= 19 &&
      callbacks.some((entry) => typeof entry.cleanup === 'function')
    ) {
      return () =>
        callbacks.forEach(({ ref, cleanup }) => {
          if (typeof cleanup === 'function') cleanup();
          else if (typeof ref === 'function') ref(null);
          else if (ref) (ref as React.MutableRefObject<T | null>).current = null;
        });
    }
  };
}

export function useMnemonic<T extends HTMLElement = HTMLElement>(
  text: string,
  options: MnemonicOptions = {},
): {
  label: React.ReactNode;
  text: string;
  triggerProps: {
    ref: React.RefCallback<T>;
    'aria-keyshortcuts': string | undefined;
    'data-keybound': string;
  };
} {
  const parsed = parseMnemonic(text);
  const { mnemonicModifier, reveal, modifierDown, apple } = useKeyboundContext();
  const optionsRef = { ...options, label: options.label ?? parsed.text };
  const ref = useBinding(
    null,
    parsed.key,
    'mnemonic',
    optionsRef,
    (event, element) => {
      if (element) activateElement(element, event, options.action);
    },
    true,
  );
  const visible = reveal === 'always' || (reveal === 'modifier' && modifierDown);
  const markerStyle: React.CSSProperties = {
    textDecorationLine: visible ? 'underline' : 'none',
    ...options.style,
  };

  let label: React.ReactNode;
  if (parsed.key === null) {
    label = parsed.text;
  } else {
    const fullText = parsed.text;
    const wordStart = fullText.lastIndexOf(' ', parsed.index);
    const start = wordStart === -1 ? 0 : wordStart + 1;
    const nextSpace = fullText.indexOf(' ', parsed.index + parsed.length);
    const end = nextSpace === -1 ? fullText.length : nextSpace;

    const beforeWord = fullText.slice(0, start);
    const wordPrefix = fullText.slice(start, parsed.index);
    const mnemonicChar = fullText.slice(parsed.index, parsed.index + parsed.length);
    const wordSuffix = fullText.slice(parsed.index + parsed.length, end);
    const afterWord = fullText.slice(end);

    const wordElement = (
      <span data-keybound-word="" style={{ whiteSpace: 'nowrap', display: 'inline' }}>
        {wordPrefix}
        <span data-keybound-mnemonic="" className={options.className} style={markerStyle}>
          {mnemonicChar}
        </span>
        {wordSuffix}
      </span>
    );

    if (!beforeWord && !afterWord) {
      label = wordElement;
    } else {
      label = (
        <>
          {beforeWord}
          {wordElement}
          {afterWord}
        </>
      );
    }
  }
  const shortcut = parsed.key ? parseShortcut(`${mnemonicModifier}+${parsed.key}`) : null;
  return {
    label,
    text: parsed.text,
    triggerProps: {
      ref: ref as React.RefCallback<T>,
      'aria-keyshortcuts': shortcut ? formatAriaShortcut(shortcut, apple) : undefined,
      'data-keybound': 'mnemonic',
    },
  };
}

export function useHotkey(
  keys: string,
  callback: (event: KeyboardEvent) => void,
  options: HotkeyOptions = {},
): void {
  const bindingOptions = { ...options, label: options.label ?? '' };
  useBinding(keys, null, 'hotkey', bindingOptions, (event) => callback(event), false);
}

export function useHotkeyTarget<T extends HTMLElement = HTMLElement>(
  keys: string,
  callback: (event: KeyboardEvent, element: T | null) => void,
  options: HotkeyOptions = {},
): React.RefCallback<T> {
  const bindingOptions = { ...options, label: options.label ?? '' };
  return useBinding(
    keys,
    null,
    'hotkey',
    bindingOptions,
    (event, element) => callback(event, element as T | null),
    true,
  ) as React.RefCallback<T>;
}

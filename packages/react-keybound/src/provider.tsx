'use client';

import * as React from 'react';
import { isApplePlatform, matchesShortcutModifiers, parseShortcut } from './core';
import {
  KeyboundRegistry,
  type KeyboundWarning,
  type ScopeRecord,
  type WarningSetting,
} from './registry';

export type KeyboundProviderProps = {
  children: React.ReactNode;
  enabled?: boolean;
  mnemonicModifier?: string;
  reveal?: 'always' | 'modifier' | 'never';
  warnings?: WarningSetting;
  onWarning?: (warning: KeyboundWarning) => void;
  collision?: 'last' | 'first';
};

export type KeyboundContextValue = {
  registry: KeyboundRegistry;
  enabled: boolean;
  mnemonicModifier: string;
  reveal: 'always' | 'modifier' | 'never';
  modifierDown: boolean;
  apple: boolean;
};

const KeyboundContext = React.createContext<KeyboundContextValue | null>(null);
const ScopeContext = React.createContext<ScopeRecord | null>(null);

export function useKeyboundContext(): KeyboundContextValue {
  const value = React.useContext(KeyboundContext);
  if (!value)
    throw new Error('Keybound hooks and components must be rendered inside <KeyboundProvider>.');
  return value;
}

export function useKeyboundScope(): ScopeRecord | null {
  return React.useContext(ScopeContext);
}

export function KeyboundProvider({
  children,
  enabled = true,
  mnemonicModifier = 'alt',
  reveal = 'always',
  warnings,
  onWarning,
  collision = 'last',
}: KeyboundProviderProps): React.ReactElement {
  const registryRef = React.useRef<KeyboundRegistry | null>(null);
  if (!registryRef.current)
    registryRef.current = new KeyboundRegistry({
      enabled,
      mnemonicModifier,
      collision,
      warnings,
      onWarning,
    });
  const registry = registryRef.current;
  const modifierShortcut = React.useMemo(
    () => parseShortcut(`${mnemonicModifier}+x`),
    [mnemonicModifier],
  );
  React.useEffect(
    () => registry.updateConfig({ enabled, mnemonicModifier, collision, warnings, onWarning }),
    [registry, enabled, mnemonicModifier, collision, warnings, onWarning],
  );
  const [modifierDown, setModifierDown] = React.useState(false);
  const [apple, setApple] = React.useState(false);

  React.useEffect(() => setApple(isApplePlatform()), []);
  React.useEffect(() => setModifierDown(false), [mnemonicModifier]);

  React.useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (modifierShortcut) setModifierDown(matchesShortcutModifiers(modifierShortcut, event));
      registry.dispatch(event);
    };
    const keyup = (event: KeyboardEvent) => {
      if (modifierShortcut) setModifierDown(matchesShortcutModifiers(modifierShortcut, event));
    };
    const blur = () => setModifierDown(false);
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
    window.addEventListener('blur', blur);
    return () => {
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('keyup', keyup);
      window.removeEventListener('blur', blur);
    };
  }, [registry, modifierShortcut]);

  const value = React.useMemo(
    () => ({ registry, enabled, mnemonicModifier, reveal, modifierDown, apple }),
    [registry, enabled, mnemonicModifier, reveal, modifierDown, apple],
  );
  return <KeyboundContext.Provider value={value}>{children}</KeyboundContext.Provider>;
}

export type KeyboundScopeProps = {
  children: React.ReactNode;
  active?: boolean;
  modal?: boolean;
  name?: string;
};

export function KeyboundScope({
  children,
  active = true,
  modal = false,
}: KeyboundScopeProps): React.ReactElement {
  const { registry } = useKeyboundContext();
  const parent = React.useContext(ScopeContext);
  const scopeRef = React.useRef<ScopeRecord | null>(null);
  if (!scopeRef.current) scopeRef.current = registry.createScope(parent);
  const scope = scopeRef.current;

  // Register once; updateScope below keeps active/modal current without remounting descendants.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => registry.registerScope(scope, active, modal), [registry, scope]);
  React.useEffect(
    () => registry.updateScope(scope, active, modal),
    [registry, scope, active, modal],
  );
  return <ScopeContext.Provider value={scope}>{children}</ScopeContext.Provider>;
}

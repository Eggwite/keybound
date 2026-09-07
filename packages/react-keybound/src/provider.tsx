'use client';

import * as React from 'react';
import {
  isApplePlatform,
  matchesShortcutModifiers,
  parseShortcut,
  resolveMnemonicModifier,
  type MnemonicModifierSetting,
} from './core';
import {
  KeyboundRegistry,
  type KeyboundWarning,
  type ScopeRecord,
  type WarningSetting,
} from './registry';

export type KeyboundProviderProps = {
  children: React.ReactNode;
  enabled?: boolean;
  mnemonicModifier?: MnemonicModifierSetting;
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
  mnemonicModifier = 'auto',
  reveal = 'always',
  warnings,
  onWarning,
  collision = 'last',
}: KeyboundProviderProps): React.ReactElement {
  const [apple, setApple] = React.useState(false);
  React.useEffect(() => setApple(isApplePlatform()), []);

  const resolvedModifier = React.useMemo(
    () => resolveMnemonicModifier(mnemonicModifier, apple),
    [mnemonicModifier, apple],
  );

  const registryRef = React.useRef<KeyboundRegistry | null>(null);
  if (!registryRef.current)
    registryRef.current = new KeyboundRegistry({
      enabled,
      mnemonicModifier: resolvedModifier,
      collision,
      warnings,
      onWarning,
    });
  const registry = registryRef.current;
  const modifierShortcut = React.useMemo(
    () => parseShortcut(`${resolvedModifier}+x`),
    [resolvedModifier],
  );
  React.useEffect(
    () =>
      registry.updateConfig({
        enabled,
        mnemonicModifier: resolvedModifier,
        collision,
        warnings,
        onWarning,
      }),
    [registry, enabled, resolvedModifier, collision, warnings, onWarning],
  );

  React.useEffect(() => {
    if (apple && resolvedModifier === 'alt') {
      registry.warnGlobal(
        'mac-alt-mnemonic',
        "Option on macOS/iPadOS produces glyphs/accents. Use 'auto', 'mod', or 'ctrl'.",
      );
    }
  }, [apple, resolvedModifier, registry]);

  const [modifierDown, setModifierDown] = React.useState(false);

  React.useEffect(() => {
    const update = (event: KeyboardEvent) => {
      if (modifierShortcut)
        setModifierDown(matchesShortcutModifiers(modifierShortcut, event, apple));
    };
    const keydown = (event: KeyboardEvent) => {
      update(event);
      registry.dispatch(event);
    };
    const blur = () => setModifierDown(false);
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', update);
    window.addEventListener('blur', blur);
    return () => {
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('keyup', update);
      window.removeEventListener('blur', blur);
    };
  }, [registry, modifierShortcut, apple]);

  const value = React.useMemo(
    () => ({ registry, enabled, mnemonicModifier: resolvedModifier, reveal, modifierDown, apple }),
    [registry, enabled, resolvedModifier, reveal, modifierDown, apple],
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

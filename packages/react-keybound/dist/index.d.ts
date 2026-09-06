import * as React from 'react';

type Shortcut = {
    key: string;
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
    mod: boolean;
    source: string;
};

type WarningCode = 'invalid-shortcut' | 'collision' | 'missing-target' | 'invalid-mnemonic';
type KeyboundWarning = {
    code: WarningCode;
    message: string;
    keys?: string;
    label?: string;
};
type WarningSetting = boolean | Partial<Record<WarningCode, boolean>> | undefined;
type Action = 'auto' | 'click' | 'focus' | ((element: HTMLElement, event: KeyboardEvent) => void);
type BindingOptions = {
    enabled?: boolean;
    action?: Action;
    allowInInput?: boolean;
    repeat?: boolean;
    preventDefault?: boolean;
    warnings?: WarningSetting;
    label?: string;
    targetRef?: {
        readonly current: HTMLElement | null;
    };
};
type ScopeRecord = {
    id: number;
    parent: ScopeRecord | null;
    active: boolean;
    modal: boolean;
    activation: number;
    mounted: boolean;
};
type Binding = {
    id: number;
    order: number;
    shortcut: Shortcut | null;
    mnemonicKey?: string | null;
    scope: ScopeRecord | null;
    element: HTMLElement | null;
    elementRequired: boolean;
    callback: (event: KeyboardEvent, element: HTMLElement | null) => void;
    options: BindingOptions;
    kind: 'mnemonic' | 'hotkey';
    setElement: (element: HTMLElement | null) => void;
};
type Command = {
    id: number;
    keys: string;
    label: string;
    element: HTMLElement | null;
};
type RegistryConfig = {
    enabled: boolean;
    mnemonicModifier: string;
    collision: 'last' | 'first';
    warnings?: WarningSetting;
    onWarning?: (warning: KeyboundWarning) => void;
};
declare class KeyboundRegistry {
    private bindings;
    private scopes;
    private subscribers;
    private warned;
    private commandsSnapshot;
    private nextId;
    private activation;
    config: RegistryConfig;
    constructor(config: RegistryConfig);
    updateConfig(config: RegistryConfig): void;
    createScope(parent: ScopeRecord | null): ScopeRecord;
    registerScope(scope: ScopeRecord, active: boolean, modal: boolean): () => void;
    updateScope(scope: ScopeRecord, active: boolean, modal: boolean): void;
    register(binding: Omit<Binding, 'id' | 'order' | 'element' | 'setElement'>): {
        dispose: () => void;
        setElement: (element: HTMLElement | null) => void;
        updateOptions: (options: BindingOptions) => void;
    };
    subscribe(listener: () => void): () => void;
    refresh(): void;
    getCommands(fresh?: boolean): Command[];
    dispatch: (event: KeyboardEvent) => void;
    private matches;
    private eligible;
    private warn;
    private updateOptions;
    private emit;
}

type KeyboundProviderProps = {
    children: React.ReactNode;
    enabled?: boolean;
    mnemonicModifier?: string;
    reveal?: 'always' | 'modifier' | 'never';
    warnings?: WarningSetting;
    onWarning?: (warning: KeyboundWarning) => void;
    collision?: 'last' | 'first';
};
type KeyboundContextValue = {
    registry: KeyboundRegistry;
    enabled: boolean;
    mnemonicModifier: string;
    reveal: 'always' | 'modifier' | 'never';
    modifierDown: boolean;
    apple: boolean;
};
declare function useKeyboundContext(): KeyboundContextValue;
declare function KeyboundProvider({ children, enabled, mnemonicModifier, reveal, warnings, onWarning, collision, }: KeyboundProviderProps): React.ReactElement;
type KeyboundScopeProps = {
    children: React.ReactNode;
    active?: boolean;
    modal?: boolean;
    name?: string;
};
declare function KeyboundScope({ children, active, modal, }: KeyboundScopeProps): React.ReactElement;

type MnemonicOptions = BindingOptions & {
    className?: string;
    style?: React.CSSProperties;
};
type HotkeyOptions = BindingOptions;
declare function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T>;
declare function useMnemonic<T extends HTMLElement = HTMLElement>(text: string, options?: MnemonicOptions): {
    label: React.ReactNode;
    text: string;
    triggerProps: {
        ref: React.RefCallback<T>;
        'aria-keyshortcuts': string | undefined;
        'data-keybound': string;
    };
};
declare function useHotkey(keys: string, callback: (event: KeyboardEvent) => void, options?: HotkeyOptions): void;

type MnemonicProps = MnemonicOptions & {
    text: string;
    children: React.ReactElement;
};
declare function Mnemonic({ text, children, ...options }: MnemonicProps): React.ReactElement;
type HotkeyProps = HotkeyOptions & {
    keys: string;
    label?: string;
    children: React.ReactElement;
};
declare function Hotkey({ keys, label, children, ...options }: HotkeyProps): React.ReactElement;

type KeyboundOverlayProps = {
    open?: boolean;
    className?: string;
    style?: React.CSSProperties;
    renderHint?: (hint: {
        keys: string;
        label: string;
        element: HTMLElement;
    }) => React.ReactNode;
};
declare function KeyboundOverlay({ open, className, style, renderHint, }: KeyboundOverlayProps): React.ReactElement | null;

type KeyboundCommand = Command;
declare function useKeyboundCommands(): KeyboundCommand[];
type KeyboundHelpProps = {
    className?: string;
    style?: React.CSSProperties;
    renderItem?: (command: KeyboundCommand) => React.ReactNode;
};
declare function KeyboundHelp({ className, style, renderItem, }: KeyboundHelpProps): React.ReactElement;

/** Opens a Radix Select trigger through the primitive's documented keyboard path. */
declare function radixSelectAction(element: HTMLElement, _event: KeyboardEvent): void;

export { type Action, Hotkey, type HotkeyOptions, type HotkeyProps, type KeyboundCommand, KeyboundHelp, type KeyboundHelpProps, KeyboundOverlay, type KeyboundOverlayProps, KeyboundProvider, type KeyboundProviderProps, KeyboundScope, type KeyboundScopeProps, type KeyboundWarning, Mnemonic, type MnemonicOptions, type MnemonicProps, type WarningCode, composeRefs, radixSelectAction, useHotkey, useKeyboundCommands, useKeyboundContext, useMnemonic };

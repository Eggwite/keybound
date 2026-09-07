import { matchesShortcut, parseShortcut, type Shortcut } from './core';

export type WarningCode =
  'invalid-shortcut' | 'collision' | 'missing-target' | 'invalid-mnemonic' | 'mac-alt-mnemonic';
export type KeyboundWarning = { code: WarningCode; message: string; keys?: string; label?: string };
export type WarningSetting = boolean | Partial<Record<WarningCode, boolean>> | undefined;
export type Action =
  'auto' | 'click' | 'focus' | ((element: HTMLElement, event: KeyboardEvent) => void);

export type BindingOptions = {
  enabled?: boolean;
  action?: Action;
  allowInInput?: boolean;
  repeat?: boolean;
  preventDefault?: boolean;
  warnings?: WarningSetting;
  label?: string;
  targetRef?: { readonly current: HTMLElement | null };
};

export type ScopeRecord = {
  id: number;
  parent: ScopeRecord | null;
  active: boolean;
  modal: boolean;
  activation: number;
  mounted: boolean;
};

export type Binding = {
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

export type Command = { id: number; keys: string; label: string; element: HTMLElement | null };

export type RegistryConfig = {
  enabled: boolean;
  mnemonicModifier: string;
  collision: 'last' | 'first';
  warnings?: WarningSetting;
  onWarning?: (warning: KeyboundWarning) => void;
};

function commandOptionsEqual(left: BindingOptions, right: BindingOptions): boolean {
  return (
    left.enabled === right.enabled &&
    left.label === right.label &&
    left.targetRef === right.targetRef
  );
}

function commandsEqual(left: Command[], right: Command[]): boolean {
  return (
    left.length === right.length &&
    left.every((command, index) => {
      const candidate = right[index];
      return (
        command.id === candidate.id &&
        command.keys === candidate.keys &&
        command.label === candidate.label &&
        command.element === candidate.element
      );
    })
  );
}

function isHidden(element: HTMLElement): boolean {
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    if (node.hidden || node.getAttribute('aria-hidden') === 'true' || node.hasAttribute('inert'))
      return true;
    const style = getComputedStyle(node);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.visibility === 'collapse'
    )
      return true;
    if (node.tagName === 'DETAILS' && !(node as HTMLDetailsElement).open) {
      const summary = Array.from(node.children).find((child) => child.tagName === 'SUMMARY');
      if (!summary?.contains(element)) return true;
    }
  }
  return false;
}

function isDisabled(element: HTMLElement): boolean {
  if ((element as HTMLButtonElement).disabled || element.getAttribute('aria-disabled') === 'true')
    return true;
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    if (node.getAttribute('aria-disabled') === 'true') return true;
    if (node.tagName === 'FIELDSET' && (node as HTMLFieldSetElement).disabled) return true;
  }
  return false;
}

export function isElementEligible(element: HTMLElement | null): element is HTMLElement {
  if (!element || !element.isConnected || isHidden(element) || isDisabled(element)) return false;
  return element.getClientRects().length > 0;
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (typeof Element === 'undefined' || typeof Node === 'undefined' || !target) return false;
  const element =
    target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
  if (!element) return false;
  return (
    (element as HTMLElement).isContentEditable ||
    element.matches(
      'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"]',
    ) ||
    Boolean(element.closest('[contenteditable=""], [contenteditable="true"], [role="textbox"]'))
  );
}

export function activateElement(
  element: HTMLElement,
  event: KeyboardEvent,
  action: Action = 'auto',
): void {
  if (typeof action === 'function') {
    action(element, event);
    return;
  }
  if (action === 'focus') {
    element.focus();
    return;
  }
  if (action === 'click') {
    element.click();
    return;
  }
  if (element.tagName === 'LABEL') {
    const label = element as HTMLLabelElement;
    const control =
      label.control ??
      (label.htmlFor ? (document.getElementById(label.htmlFor) as HTMLElement | null) : null);
    control?.focus();
    return;
  }
  if (element.matches('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) {
    if (element.matches('input[type="checkbox"], input[type="radio"]')) {
      element.click();
      return;
    }
    element.focus();
    return;
  }
  if (element.matches('button, a[href], input[type="checkbox"], input[type="radio"], summary')) {
    element.click();
    return;
  }
  element.focus();
}

function inScope(binding: Binding, scope: ScopeRecord): boolean {
  for (let cursor = binding.scope; cursor; cursor = cursor.parent)
    if (cursor === scope) return true;
  return false;
}

function activeScope(scope: ScopeRecord | null): boolean {
  for (let cursor = scope; cursor; cursor = cursor.parent)
    if (!cursor.active || !cursor.mounted) return false;
  return true;
}

function depth(scope: ScopeRecord | null): number {
  let count = 0;
  for (let cursor = scope; cursor; cursor = cursor.parent) count += 1;
  return count;
}

export class KeyboundRegistry {
  private bindings = new Map<number, Binding>();
  private scopes = new Map<number, ScopeRecord>();
  private subscribers = new Set<() => void>();
  private warned = new Set<string>();
  private commandsSnapshot: Command[] | null = null;
  private nextId = 1;
  private activation = 0;
  config: RegistryConfig;

  constructor(config: RegistryConfig) {
    this.config = config;
  }

  updateConfig(config: RegistryConfig): void {
    const commandsChanged =
      this.config.enabled !== config.enabled ||
      this.config.mnemonicModifier !== config.mnemonicModifier;
    this.config = config;
    if (commandsChanged) this.emit();
  }

  createScope(parent: ScopeRecord | null): ScopeRecord {
    return { id: this.nextId++, parent, active: true, modal: false, activation: 0, mounted: false };
  }

  registerScope(scope: ScopeRecord, active: boolean, modal: boolean): () => void {
    scope.mounted = true;
    if (active && !scope.active) scope.activation = ++this.activation;
    scope.active = active;
    scope.modal = modal;
    if (active && modal && !scope.activation) scope.activation = ++this.activation;
    this.scopes.set(scope.id, scope);
    this.emit();
    return () => {
      scope.mounted = false;
      this.scopes.delete(scope.id);
      this.emit();
    };
  }

  updateScope(scope: ScopeRecord, active: boolean, modal: boolean): void {
    if (active && !scope.active) scope.activation = ++this.activation;
    scope.active = active;
    scope.modal = modal;
    this.emit();
  }

  register(binding: Omit<Binding, 'id' | 'order' | 'element' | 'setElement'>): {
    dispose: () => void;
    setElement: (element: HTMLElement | null) => void;
    updateOptions: (options: BindingOptions) => void;
  } {
    const id = this.nextId++;
    const record: Binding = {
      ...binding,
      id,
      order: id,
      element: null,
      setElement: (element) => {
        if (record.element !== element) {
          record.element = element;
          this.emit();
        }
      },
    };
    this.bindings.set(id, record);
    if (!record.shortcut && !record.mnemonicKey)
      this.warn(
        record,
        record.kind === 'mnemonic' ? 'invalid-mnemonic' : 'invalid-shortcut',
        `Invalid ${record.kind === 'mnemonic' ? 'mnemonic' : 'shortcut'}${record.options.label ? ` for ${record.options.label}` : ''}.`,
      );
    this.emit();
    return {
      setElement: record.setElement,
      updateOptions: (options) => this.updateOptions(id, options),
      dispose: () => {
        this.bindings.delete(id);
        this.emit();
      },
    };
  }

  subscribe(listener: () => void): () => void {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  refresh(): void {
    const previous = this.commandsSnapshot;
    const current = this.getCommands(true);
    if (previous !== current) this.subscribers.forEach((listener) => listener());
  }

  getCommands(fresh = false): Command[] {
    if (!fresh && this.commandsSnapshot) return this.commandsSnapshot;
    if (!this.config.enabled) {
      if (this.commandsSnapshot?.length === 0) return this.commandsSnapshot;
      this.commandsSnapshot = [];
      return this.commandsSnapshot;
    }
    let bindings = [...this.bindings.values()].filter(
      (binding) => (binding.shortcut || binding.mnemonicKey) && this.eligible(binding, false),
    );
    const modal = [...this.scopes.values()]
      .filter((scope) => scope.modal && activeScope(scope))
      .sort((a, b) => b.activation - a.activation)[0];
    if (modal) bindings = bindings.filter((binding) => inScope(binding, modal));
    const commands = bindings.map((binding) => ({
      id: binding.id,
      keys: binding.shortcut
        ? binding.shortcut.source
        : `${this.config.mnemonicModifier}+${binding.mnemonicKey}`,
      label: binding.options.label ?? '',
      element: binding.options.targetRef?.current ?? binding.element,
    }));
    if (this.commandsSnapshot && commandsEqual(this.commandsSnapshot, commands))
      return this.commandsSnapshot;
    this.commandsSnapshot = commands;
    return this.commandsSnapshot;
  }

  dispatch = (event: KeyboardEvent): void => {
    if (!this.config.enabled || event.defaultPrevented || event.isComposing) return;
    let choices = [...this.bindings.values()].filter(
      (binding) => this.matches(binding, event) && this.eligible(binding, true, event),
    );
    if (event.repeat) choices = choices.filter((binding) => binding.options.repeat);
    const modal = [...this.scopes.values()]
      .filter((scope) => scope.modal && activeScope(scope))
      .sort((a, b) => b.activation - a.activation)[0];
    if (modal) choices = choices.filter((binding) => inScope(binding, modal));
    if (!choices.length) return;
    const deepest = Math.max(...choices.map((binding) => depth(binding.scope)));
    choices = choices.filter((binding) => depth(binding.scope) === deepest);
    const focused = choices.filter((binding) => binding.element?.contains(document.activeElement));
    if (focused.length) choices = focused;
    if (choices.length > 1)
      this.warn(
        choices[0],
        'collision',
        `Multiple eligible bindings match ${choices[0].shortcut?.source ?? choices[0].mnemonicKey}.`,
      );
    choices.sort((a, b) =>
      this.config.collision === 'first' ? a.order - b.order : b.order - a.order,
    );
    const winner = choices[0];
    if (winner.options.preventDefault !== false) event.preventDefault();
    winner.callback(event, winner.element);
  };

  private matches(binding: Binding, event: KeyboardEvent): boolean {
    if (binding.shortcut) return matchesShortcut(binding.shortcut, event);
    if (!binding.mnemonicKey) return false;
    const shortcut = parseShortcut(`${this.config.mnemonicModifier}+${binding.mnemonicKey}`);
    return shortcut ? matchesShortcut(shortcut, event) : false;
  }

  private eligible(binding: Binding, forDispatch: boolean, event?: KeyboardEvent): boolean {
    if (binding.options.enabled === false || !activeScope(binding.scope)) return false;
    const target = binding.options.targetRef?.current ?? binding.element;
    if (binding.elementRequired || binding.options.targetRef) {
      if (!isElementEligible(target)) return false;
    }
    if (forDispatch && !binding.options.allowInInput) {
      const path = event?.composedPath?.() ?? [];
      if ([event?.target ?? null, document.activeElement, ...path].some(isEditableTarget))
        return false;
    }
    return true;
  }

  private warn(binding: Binding, code: WarningCode, message: string): void {
    this.emitWarning(
      code,
      message,
      binding.options.warnings ?? this.config.warnings,
      binding.shortcut?.source,
      binding.options.label,
      `${code}:${binding.options.label ?? ''}:${binding.shortcut?.source ?? binding.mnemonicKey ?? ''}`,
    );
  }

  warnGlobal(code: WarningCode, message: string): void {
    this.emitWarning(code, message, this.config.warnings, undefined, undefined, code);
  }

  private emitWarning(
    code: WarningCode,
    message: string,
    setting: WarningSetting,
    keys?: string,
    label?: string,
    dedupeKey: string = code,
  ): void {
    const viteDev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV;
    const dev =
      (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') || viteDev === true;
    const allowed =
      setting === true ||
      (typeof setting === 'object' && setting[code] === true) ||
      (setting === undefined && dev);
    if (!allowed || this.warned.has(dedupeKey)) return;
    this.warned.add(dedupeKey);
    const warning: KeyboundWarning = { code, message, keys, label };
    if (this.config.onWarning) this.config.onWarning(warning);
    else if (typeof console !== 'undefined') console.warn(`[keybound:${code}] ${message}`);
  }

  private updateOptions(id: number, options: BindingOptions): void {
    const binding = this.bindings.get(id);
    if (!binding) return;
    const commandsUnchanged = commandOptionsEqual(binding.options, options);
    binding.options = options;
    if (!commandsUnchanged) this.emit();
  }

  private emit(): void {
    this.commandsSnapshot = null;
    this.subscribers.forEach((listener) => listener());
  }
}

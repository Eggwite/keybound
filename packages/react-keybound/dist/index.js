"use client";
"use client";

// packages/react-keybound/src/provider.tsx
import * as React from "react";

// packages/react-keybound/src/core.ts
var modifierNames = /* @__PURE__ */ new Set(["ctrl", "control", "alt", "shift", "meta", "cmd", "command", "mod"]);
function firstGrapheme(value) {
  const Segmenter = typeof Intl !== "undefined" ? Intl.Segmenter : void 0;
  if (Segmenter) {
    const segments = new Segmenter(void 0, { granularity: "grapheme" }).segment(value);
    const iterator = segments[Symbol.iterator]();
    return iterator.next().value?.segment ?? "";
  }
  return Array.from(value)[0] ?? "";
}
function normalizeKey(value) {
  const normalized = value.normalize("NFC").toLowerCase();
  const aliases = { esc: "escape", " ": "space" };
  return aliases[normalized] ?? normalized;
}
function parseMnemonic(input) {
  let text = "";
  let key = null;
  let index = -1;
  let length = 0;
  for (let cursor = 0; cursor < input.length; ) {
    if (input[cursor] !== "&") {
      text += input[cursor];
      cursor += 1;
      continue;
    }
    if (input[cursor + 1] === "&") {
      text += "&";
      cursor += 2;
      continue;
    }
    if (key === null && cursor + 1 < input.length) {
      const grapheme = firstGrapheme(input.slice(cursor + 1));
      if (grapheme) {
        key = grapheme;
        index = text.length;
        length = grapheme.length;
        text += grapheme;
        cursor += grapheme.length + 1;
        continue;
      }
    }
    text += "&";
    cursor += 1;
  }
  return { text, key, index, length };
}
function parseShortcut(input) {
  if (typeof input !== "string" || !input.trim()) return null;
  const rawTokens = input.split("+").map((token) => token.trim().toLowerCase());
  if (!rawTokens.length || rawTokens.some((token) => !token)) return null;
  const result = {
    key: "",
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
    mod: false,
    source: input
  };
  for (let token of rawTokens) {
    if (modifierNames.has(token)) {
      if (token === "ctrl" || token === "control") {
        if (result.ctrl) return null;
        result.ctrl = true;
      } else if (token === "alt") {
        if (result.alt) return null;
        result.alt = true;
      } else if (token === "shift") {
        if (result.shift) return null;
        result.shift = true;
      } else if (token === "meta" || token === "cmd" || token === "command") {
        if (result.meta) return null;
        result.meta = true;
      } else {
        if (result.mod) return null;
        result.mod = true;
      }
      continue;
    }
    if (result.key) return null;
    if (token === "plus") token = "+";
    if (!isShortcutKey(token)) return null;
    result.key = normalizeKey(token);
  }
  return result.key ? result : null;
}
var namedKeys = /* @__PURE__ */ new Set([
  "enter",
  "escape",
  "esc",
  "tab",
  "space",
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "home",
  "end",
  "pageup",
  "pagedown",
  "backspace",
  "delete",
  "insert"
]);
function isShortcutKey(value) {
  return namedKeys.has(value) || /^f(?:[1-9]|1[0-2])$/.test(value) || Array.from(value).length === 1;
}
function isApplePlatform() {
  if (typeof navigator === "undefined") return false;
  const browser = navigator;
  const platform = browser.userAgentData?.platform ?? navigator.platform ?? "";
  const userAgent = navigator.userAgent ?? "";
  return /mac|iphone|ipad|ipod/i.test(`${platform} ${userAgent}`);
}
function resolveMnemonicModifier(setting = "auto", apple = isApplePlatform()) {
  if (setting === "auto") return apple ? "mod" : "alt";
  if (typeof setting === "string") return setting;
  if (apple) return setting.mac ?? "mod";
  return setting.windows ?? setting.linux ?? setting.default ?? "alt";
}
function matchesShortcut(shortcut, event, apple = isApplePlatform()) {
  if (event.isComposing || ["Dead", "Process", "Unidentified"].includes(event.key)) return false;
  if (event.getModifierState?.("AltGraph")) return false;
  return normalizeKey(event.key) === shortcut.key && matchesShortcutModifiers(shortcut, event, apple);
}
function matchesShortcutModifiers(shortcut, event, apple = isApplePlatform()) {
  const expectedCtrl = shortcut.ctrl || shortcut.mod && !apple;
  const expectedMeta = shortcut.meta || shortcut.mod && apple;
  return event.ctrlKey === expectedCtrl && event.altKey === shortcut.alt && event.shiftKey === shortcut.shift && event.metaKey === expectedMeta;
}
function formatShortcut(shortcut, apple = isApplePlatform()) {
  const item = typeof shortcut === "string" ? parseShortcut(shortcut) : shortcut;
  if (!item) return typeof shortcut === "string" ? shortcut : "";
  const parts = [];
  if (item.ctrl || item.mod && !apple) parts.push(apple ? "\u2303" : "Ctrl");
  if (item.alt) parts.push(apple ? "\u2325" : "Alt");
  if (item.shift) parts.push(apple ? "\u21E7" : "Shift");
  if (item.meta || item.mod && apple) parts.push(apple ? "\u2318" : "Meta");
  parts.push(item.key.length === 1 ? item.key.toUpperCase() : displayKey(item.key));
  return parts.join(apple ? "" : "+");
}
function formatAriaShortcut(shortcut, apple = false) {
  const parts = [];
  if (shortcut.ctrl || shortcut.mod && !apple) parts.push("Control");
  if (shortcut.alt) parts.push("Alt");
  if (shortcut.shift) parts.push("Shift");
  if (shortcut.meta || shortcut.mod && apple) parts.push("Meta");
  parts.push(displayKey(shortcut.key));
  return parts.join("+");
}
function displayKey(key) {
  const names = {
    esc: "Esc",
    escape: "Escape",
    enter: "Enter",
    tab: "Tab",
    space: "Space",
    arrowup: "ArrowUp",
    arrowdown: "ArrowDown",
    arrowleft: "ArrowLeft",
    arrowright: "ArrowRight",
    home: "Home",
    end: "End",
    pageup: "PageUp",
    pagedown: "PageDown",
    backspace: "Backspace",
    delete: "Delete",
    insert: "Insert"
  };
  return names[key] ?? key.toUpperCase();
}

// packages/react-keybound/src/registry.ts
function commandOptionsEqual(left, right) {
  return left.enabled === right.enabled && left.label === right.label && left.targetRef === right.targetRef;
}
function commandsEqual(left, right) {
  return left.length === right.length && left.every((command, index) => {
    const candidate = right[index];
    return command.id === candidate.id && command.keys === candidate.keys && command.label === candidate.label && command.element === candidate.element;
  });
}
function isHidden(element) {
  for (let node = element; node; node = node.parentElement) {
    if (node.hidden || node.getAttribute("aria-hidden") === "true" || node.hasAttribute("inert"))
      return true;
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse")
      return true;
    if (node.tagName === "DETAILS" && !node.open) {
      const summary = Array.from(node.children).find((child) => child.tagName === "SUMMARY");
      if (!summary?.contains(element)) return true;
    }
  }
  return false;
}
function isDisabled(element) {
  if (element.disabled || element.getAttribute("aria-disabled") === "true")
    return true;
  for (let node = element; node; node = node.parentElement) {
    if (node.getAttribute("aria-disabled") === "true") return true;
    if (node.tagName === "FIELDSET" && node.disabled) return true;
  }
  return false;
}
function isElementEligible(element) {
  if (!element || !element.isConnected || isHidden(element) || isDisabled(element)) return false;
  return element.getClientRects().length > 0;
}
function isEditableTarget(target) {
  if (typeof Element === "undefined" || typeof Node === "undefined" || !target) return false;
  const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
  if (!element) return false;
  return element.isContentEditable || element.matches(
    'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"]'
  ) || Boolean(element.closest('[contenteditable=""], [contenteditable="true"], [role="textbox"]'));
}
function activateElement(element, event, action = "auto") {
  if (typeof action === "function") {
    action(element, event);
    return;
  }
  if (action === "focus") {
    element.focus();
    return;
  }
  if (action === "click") {
    element.click();
    return;
  }
  if (element.tagName === "LABEL") {
    const label = element;
    const control = label.control ?? (label.htmlFor ? document.getElementById(label.htmlFor) : null);
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
function inScope(binding, scope) {
  for (let cursor = binding.scope; cursor; cursor = cursor.parent)
    if (cursor === scope) return true;
  return false;
}
function activeScope(scope) {
  for (let cursor = scope; cursor; cursor = cursor.parent)
    if (!cursor.active || !cursor.mounted) return false;
  return true;
}
function depth(scope) {
  let count = 0;
  for (let cursor = scope; cursor; cursor = cursor.parent) count += 1;
  return count;
}
var KeyboundRegistry = class {
  bindings = /* @__PURE__ */ new Map();
  scopes = /* @__PURE__ */ new Map();
  subscribers = /* @__PURE__ */ new Set();
  warned = /* @__PURE__ */ new Set();
  commandsSnapshot = null;
  nextId = 1;
  activation = 0;
  config;
  constructor(config) {
    this.config = config;
  }
  updateConfig(config) {
    const commandsChanged = this.config.enabled !== config.enabled || this.config.mnemonicModifier !== config.mnemonicModifier;
    this.config = config;
    if (commandsChanged) this.emit();
  }
  createScope(parent) {
    return { id: this.nextId++, parent, active: true, modal: false, activation: 0, mounted: false };
  }
  registerScope(scope, active, modal) {
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
  updateScope(scope, active, modal) {
    if (active && !scope.active) scope.activation = ++this.activation;
    scope.active = active;
    scope.modal = modal;
    this.emit();
  }
  register(binding) {
    const id = this.nextId++;
    const record = {
      ...binding,
      id,
      order: id,
      element: null,
      setElement: (element) => {
        if (record.element !== element) {
          record.element = element;
          this.emit();
        }
      }
    };
    this.bindings.set(id, record);
    if (!record.shortcut && !record.mnemonicKey)
      this.warn(
        record,
        record.kind === "mnemonic" ? "invalid-mnemonic" : "invalid-shortcut",
        `Invalid ${record.kind === "mnemonic" ? "mnemonic" : "shortcut"}${record.options.label ? ` for ${record.options.label}` : ""}.`
      );
    this.emit();
    return {
      setElement: record.setElement,
      updateOptions: (options) => this.updateOptions(id, options),
      dispose: () => {
        this.bindings.delete(id);
        this.emit();
      }
    };
  }
  subscribe(listener) {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }
  refresh() {
    const previous = this.commandsSnapshot;
    const current = this.getCommands(true);
    if (previous !== current) this.subscribers.forEach((listener) => listener());
  }
  getCommands(fresh = false) {
    if (!fresh && this.commandsSnapshot) return this.commandsSnapshot;
    if (!this.config.enabled) {
      if (this.commandsSnapshot?.length === 0) return this.commandsSnapshot;
      this.commandsSnapshot = [];
      return this.commandsSnapshot;
    }
    let bindings = [...this.bindings.values()].filter(
      (binding) => (binding.shortcut || binding.mnemonicKey) && this.eligible(binding, false)
    );
    const modal = [...this.scopes.values()].filter((scope) => scope.modal && activeScope(scope)).sort((a, b) => b.activation - a.activation)[0];
    if (modal) bindings = bindings.filter((binding) => inScope(binding, modal));
    const commands = bindings.map((binding) => ({
      id: binding.id,
      keys: binding.shortcut ? binding.shortcut.source : `${this.config.mnemonicModifier}+${binding.mnemonicKey}`,
      label: binding.options.label ?? "",
      element: binding.options.targetRef?.current ?? binding.element
    }));
    if (this.commandsSnapshot && commandsEqual(this.commandsSnapshot, commands))
      return this.commandsSnapshot;
    this.commandsSnapshot = commands;
    return this.commandsSnapshot;
  }
  dispatch = (event) => {
    if (!this.config.enabled || event.defaultPrevented || event.isComposing) return;
    let choices = [...this.bindings.values()].filter(
      (binding) => this.matches(binding, event) && this.eligible(binding, true, event)
    );
    if (event.repeat) choices = choices.filter((binding) => binding.options.repeat);
    const modal = [...this.scopes.values()].filter((scope) => scope.modal && activeScope(scope)).sort((a, b) => b.activation - a.activation)[0];
    if (modal) choices = choices.filter((binding) => inScope(binding, modal));
    if (!choices.length) return;
    const deepest = Math.max(...choices.map((binding) => depth(binding.scope)));
    choices = choices.filter((binding) => depth(binding.scope) === deepest);
    const focused = choices.filter((binding) => binding.element?.contains(document.activeElement));
    if (focused.length) choices = focused;
    if (choices.length > 1)
      this.warn(
        choices[0],
        "collision",
        `Multiple eligible bindings match ${choices[0].shortcut?.source ?? choices[0].mnemonicKey}.`
      );
    choices.sort(
      (a, b) => this.config.collision === "first" ? a.order - b.order : b.order - a.order
    );
    const winner = choices[0];
    if (winner.options.preventDefault !== false) event.preventDefault();
    winner.callback(event, winner.element);
  };
  matches(binding, event) {
    if (binding.shortcut) return matchesShortcut(binding.shortcut, event);
    if (!binding.mnemonicKey) return false;
    const shortcut = parseShortcut(`${this.config.mnemonicModifier}+${binding.mnemonicKey}`);
    return shortcut ? matchesShortcut(shortcut, event) : false;
  }
  eligible(binding, forDispatch, event) {
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
  warn(binding, code, message) {
    this.emitWarning(
      code,
      message,
      binding.options.warnings ?? this.config.warnings,
      binding.shortcut?.source,
      binding.options.label,
      `${code}:${binding.options.label ?? ""}:${binding.shortcut?.source ?? binding.mnemonicKey ?? ""}`
    );
  }
  warnGlobal(code, message) {
    this.emitWarning(code, message, this.config.warnings, void 0, void 0, code);
  }
  emitWarning(code, message, setting, keys, label, dedupeKey = code) {
    const viteDev = import.meta.env?.DEV;
    const dev = typeof process !== "undefined" && process.env.NODE_ENV !== "production" || viteDev === true;
    const allowed = setting === true || typeof setting === "object" && setting[code] === true || setting === void 0 && dev;
    if (!allowed || this.warned.has(dedupeKey)) return;
    this.warned.add(dedupeKey);
    const warning = { code, message, keys, label };
    if (this.config.onWarning) this.config.onWarning(warning);
    else if (typeof console !== "undefined") console.warn(`[keybound:${code}] ${message}`);
  }
  updateOptions(id, options) {
    const binding = this.bindings.get(id);
    if (!binding) return;
    const commandsUnchanged = commandOptionsEqual(binding.options, options);
    binding.options = options;
    if (!commandsUnchanged) this.emit();
  }
  emit() {
    this.commandsSnapshot = null;
    this.subscribers.forEach((listener) => listener());
  }
};

// packages/react-keybound/src/provider.tsx
import { jsx } from "react/jsx-runtime";
var KeyboundContext = React.createContext(null);
var ScopeContext = React.createContext(null);
function useKeyboundContext() {
  const value = React.useContext(KeyboundContext);
  if (!value)
    throw new Error("Keybound hooks and components must be rendered inside <KeyboundProvider>.");
  return value;
}
function useKeyboundScope() {
  return React.useContext(ScopeContext);
}
function KeyboundProvider({
  children,
  enabled = true,
  mnemonicModifier = "auto",
  reveal = "always",
  warnings,
  onWarning,
  collision = "last"
}) {
  const [apple, setApple] = React.useState(false);
  React.useEffect(() => setApple(isApplePlatform()), []);
  const resolvedModifier = React.useMemo(
    () => resolveMnemonicModifier(mnemonicModifier, apple),
    [mnemonicModifier, apple]
  );
  const registryRef = React.useRef(null);
  if (!registryRef.current)
    registryRef.current = new KeyboundRegistry({
      enabled,
      mnemonicModifier: resolvedModifier,
      collision,
      warnings,
      onWarning
    });
  const registry = registryRef.current;
  const modifierShortcut = React.useMemo(
    () => parseShortcut(`${resolvedModifier}+x`),
    [resolvedModifier]
  );
  React.useEffect(
    () => registry.updateConfig({
      enabled,
      mnemonicModifier: resolvedModifier,
      collision,
      warnings,
      onWarning
    }),
    [registry, enabled, resolvedModifier, collision, warnings, onWarning]
  );
  React.useEffect(() => {
    if (apple && resolvedModifier === "alt") {
      registry.warnGlobal(
        "mac-alt-mnemonic",
        "Option on macOS/iPadOS produces glyphs/accents. Use 'auto', 'mod', or 'ctrl'."
      );
    }
  }, [apple, resolvedModifier, registry]);
  const [modifierDown, setModifierDown] = React.useState(false);
  React.useEffect(() => {
    const update = (event) => {
      if (modifierShortcut)
        setModifierDown(matchesShortcutModifiers(modifierShortcut, event, apple));
    };
    const keydown = (event) => {
      update(event);
      registry.dispatch(event);
    };
    const blur = () => setModifierDown(false);
    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", update);
    window.addEventListener("blur", blur);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("keyup", update);
      window.removeEventListener("blur", blur);
    };
  }, [registry, modifierShortcut, apple]);
  const value = React.useMemo(
    () => ({ registry, enabled, mnemonicModifier: resolvedModifier, reveal, modifierDown, apple }),
    [registry, enabled, resolvedModifier, reveal, modifierDown, apple]
  );
  return /* @__PURE__ */ jsx(KeyboundContext.Provider, { value, children });
}
function KeyboundScope({
  children,
  active = true,
  modal = false
}) {
  const { registry } = useKeyboundContext();
  const parent = React.useContext(ScopeContext);
  const scopeRef = React.useRef(null);
  if (!scopeRef.current) scopeRef.current = registry.createScope(parent);
  const scope = scopeRef.current;
  React.useEffect(() => registry.registerScope(scope, active, modal), [registry, scope]);
  React.useEffect(
    () => registry.updateScope(scope, active, modal),
    [registry, scope, active, modal]
  );
  return /* @__PURE__ */ jsx(ScopeContext.Provider, { value: scope, children });
}

// packages/react-keybound/src/hooks.tsx
import * as React2 from "react";
import { Fragment, jsx as jsx2, jsxs } from "react/jsx-runtime";
function useBinding(shortcutText, mnemonicKey, kind, options, callback, elementRequired) {
  const { registry } = useKeyboundContext();
  const scope = useKeyboundScope();
  const elementRef2 = React2.useRef(null);
  const registrationRef = React2.useRef(null);
  const optionsRef = React2.useRef(options);
  const callbackRef = React2.useRef(callback);
  React2.useEffect(() => {
    optionsRef.current = options;
    callbackRef.current = callback;
    registrationRef.current?.updateOptions(options);
  });
  React2.useEffect(() => {
    const registration = registry.register({
      shortcut: shortcutText ? parseShortcut(shortcutText) : null,
      mnemonicKey,
      scope,
      elementRequired,
      kind,
      options: optionsRef.current,
      callback: (event, element) => callbackRef.current(event, element)
    });
    registrationRef.current = registration;
    registration.setElement(elementRef2.current);
    return () => {
      if (registrationRef.current === registration) registrationRef.current = null;
      registration.dispose();
    };
  }, [registry, scope, shortcutText, mnemonicKey, kind, elementRequired]);
  return React2.useCallback((element) => {
    elementRef2.current = element;
    registrationRef.current?.setElement(element);
  }, []);
}
function composeRefs(...refs) {
  return (value) => {
    const callbacks = refs.map((ref) => {
      if (typeof ref === "function") return { ref, cleanup: ref(value) };
      else if (ref) ref.current = value;
      return { ref, cleanup: void 0 };
    });
    if (value && Number(React2.version.split(".")[0]) >= 19 && callbacks.some((entry) => typeof entry.cleanup === "function")) {
      return () => callbacks.forEach(({ ref, cleanup }) => {
        if (typeof cleanup === "function") cleanup();
        else if (typeof ref === "function") ref(null);
        else if (ref) ref.current = null;
      });
    }
  };
}
function useMnemonic(text, options = {}) {
  const parsed = parseMnemonic(text);
  const { mnemonicModifier, reveal, modifierDown, apple } = useKeyboundContext();
  const optionsRef = { ...options, label: options.label ?? parsed.text };
  const ref = useBinding(
    null,
    parsed.key,
    "mnemonic",
    optionsRef,
    (event, element) => {
      if (element) activateElement(element, event, options.action);
    },
    true
  );
  const visible = reveal === "always" || reveal === "modifier" && modifierDown;
  const markerStyle = {
    textDecorationLine: visible ? "underline" : "none",
    ...options.style
  };
  let label;
  if (parsed.key === null) {
    label = parsed.text;
  } else {
    const fullText = parsed.text;
    const wordStart = fullText.lastIndexOf(" ", parsed.index);
    const start = wordStart === -1 ? 0 : wordStart + 1;
    const nextSpace = fullText.indexOf(" ", parsed.index + parsed.length);
    const end = nextSpace === -1 ? fullText.length : nextSpace;
    const beforeWord = fullText.slice(0, start);
    const wordPrefix = fullText.slice(start, parsed.index);
    const mnemonicChar = fullText.slice(parsed.index, parsed.index + parsed.length);
    const wordSuffix = fullText.slice(parsed.index + parsed.length, end);
    const afterWord = fullText.slice(end);
    const wordElement = /* @__PURE__ */ jsxs("span", { "data-keybound-word": "", style: { whiteSpace: "nowrap", display: "inline" }, children: [
      wordPrefix,
      /* @__PURE__ */ jsx2("span", { "data-keybound-mnemonic": "", className: options.className, style: markerStyle, children: mnemonicChar }),
      wordSuffix
    ] });
    if (!beforeWord && !afterWord) {
      label = wordElement;
    } else {
      label = /* @__PURE__ */ jsxs(Fragment, { children: [
        beforeWord,
        wordElement,
        afterWord
      ] });
    }
  }
  const shortcut = parsed.key ? parseShortcut(`${mnemonicModifier}+${parsed.key}`) : null;
  return {
    label,
    text: parsed.text,
    triggerProps: {
      ref,
      "aria-keyshortcuts": shortcut ? formatAriaShortcut(shortcut, apple) : void 0,
      "data-keybound": "mnemonic"
    }
  };
}
function useHotkey(keys, callback, options = {}) {
  const bindingOptions = { ...options, label: options.label ?? "" };
  useBinding(keys, null, "hotkey", bindingOptions, (event) => callback(event), false);
}
function useHotkeyTarget(keys, callback, options = {}) {
  const bindingOptions = { ...options, label: options.label ?? "" };
  return useBinding(
    keys,
    null,
    "hotkey",
    bindingOptions,
    (event, element) => callback(event, element),
    true
  );
}

// packages/react-keybound/src/wrappers.tsx
import * as React3 from "react";
function elementRef(element) {
  if (Number(React3.version.split(".")[0]) >= 19) return element.props.ref;
  return element.ref;
}
function Mnemonic({ text, children, ...options }) {
  const { label, triggerProps } = useMnemonic(text, options);
  const child = React3.Children.only(children);
  if (child.type === React3.Fragment) return child;
  return React3.cloneElement(child, {
    ...triggerProps,
    ref: composeRefs(elementRef(child), triggerProps.ref),
    children: label
  });
}
function Hotkey({ keys, label, children, ...options }) {
  const { apple } = useKeyboundContext();
  const actionRef = React3.useRef(null);
  const action = options.action;
  const targetRef = useHotkeyTarget(
    keys,
    (event, element) => {
      if (element) activateElement(element, event, action);
    },
    { ...options, label, targetRef: actionRef }
  );
  const shortcut = parseShortcut(keys);
  const child = React3.Children.only(children);
  if (child.type === React3.Fragment) return child;
  return React3.cloneElement(child, {
    ref: composeRefs(elementRef(child), actionRef, targetRef),
    "aria-keyshortcuts": shortcut ? formatAriaShortcut(shortcut, apple) : void 0,
    "data-keybound": "hotkey"
  });
}

// packages/react-keybound/src/overlay.tsx
import * as React4 from "react";
import { createPortal } from "react-dom";
import { jsx as jsx3 } from "react/jsx-runtime";
function KeyboundOverlay({
  open,
  className,
  style,
  renderHint
}) {
  const { modifierDown, registry } = useKeyboundContext();
  const [hydrated, setHydrated] = React4.useState(false);
  const [hints, setHints] = React4.useState([]);
  const visible = open ?? modifierDown;
  React4.useEffect(() => setHydrated(true), []);
  React4.useEffect(() => {
    if (!hydrated || !visible) {
      setHints((previous) => previous.length ? [] : previous);
      return;
    }
    let frame = 0;
    const update = () => {
      const next = registry.getCommands(true).flatMap((command) => {
        const element = command.element;
        if (!element) return [];
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height || rect.bottom < 0 || rect.right < 0 || rect.top > window.innerHeight || rect.left > window.innerWidth)
          return [];
        return [
          {
            id: command.id,
            keys: command.keys,
            label: command.label,
            element,
            top: rect.top,
            left: rect.left
          }
        ];
      });
      setHints(
        (previous) => previous.length === next.length && previous.every((hint, index) => {
          const candidate = next[index];
          return hint.id === candidate.id && hint.keys === candidate.keys && hint.label === candidate.label && hint.element === candidate.element && hint.top === candidate.top && hint.left === candidate.left;
        }) ? previous : next
      );
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [hydrated, registry, visible]);
  if (!hydrated || !visible || typeof document === "undefined") return null;
  return createPortal(
    /* @__PURE__ */ jsx3(
      "div",
      {
        className,
        style: { position: "fixed", inset: 0, pointerEvents: "none", ...style },
        "aria-hidden": "true",
        children: hints.map((hint) => /* @__PURE__ */ jsx3(
          "span",
          {
            "data-keybound-overlay-hint": "",
            style: { position: "fixed", top: hint.top, left: hint.left },
            children: renderHint ? renderHint(hint) : /* @__PURE__ */ jsx3("kbd", { children: formatShortcut(hint.keys) })
          },
          hint.id
        ))
      }
    ),
    document.body
  );
}

// packages/react-keybound/src/help.tsx
import * as React5 from "react";
import { Fragment as Fragment3, jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
var emptyCommands = [];
function useKeyboundCommands() {
  const { registry } = useKeyboundContext();
  const commands = React5.useSyncExternalStore(
    (listener) => registry.subscribe(listener),
    () => registry.getCommands(),
    () => emptyCommands
  );
  React5.useEffect(() => {
    let frame = 0;
    const scheduleRefresh = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        registry.refresh();
      });
    };
    const observer = typeof MutationObserver === "undefined" ? null : new MutationObserver(scheduleRefresh);
    observer?.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        "aria-hidden",
        "aria-disabled",
        "class",
        "disabled",
        "hidden",
        "inert",
        "open",
        "style"
      ]
    });
    window.addEventListener("resize", scheduleRefresh);
    window.addEventListener("scroll", scheduleRefresh, true);
    document.addEventListener("visibilitychange", scheduleRefresh);
    document.addEventListener("toggle", scheduleRefresh, true);
    document.addEventListener("transitionend", scheduleRefresh, true);
    document.addEventListener("animationend", scheduleRefresh, true);
    scheduleRefresh();
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", scheduleRefresh);
      window.removeEventListener("scroll", scheduleRefresh, true);
      document.removeEventListener("visibilitychange", scheduleRefresh);
      document.removeEventListener("toggle", scheduleRefresh, true);
      document.removeEventListener("transitionend", scheduleRefresh, true);
      document.removeEventListener("animationend", scheduleRefresh, true);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [registry]);
  return commands;
}
function KeyboundHelp({
  className,
  style,
  renderItem
}) {
  const commands = useKeyboundCommands();
  return /* @__PURE__ */ jsx4("ul", { className, style, "aria-label": "Keyboard shortcuts", children: commands.map((command) => /* @__PURE__ */ jsx4("li", { children: renderItem ? renderItem(command) : /* @__PURE__ */ jsxs2(Fragment3, { children: [
    /* @__PURE__ */ jsx4("kbd", { children: formatShortcut(command.keys) }),
    command.label ? ` ${command.label}` : null
  ] }) }, command.id)) });
}

// packages/react-keybound/src/adapters.ts
function radixSelectAction(element, _event) {
  element.focus();
  element.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true })
  );
}
export {
  Hotkey,
  KeyboundHelp,
  KeyboundOverlay,
  KeyboundProvider,
  KeyboundScope,
  Mnemonic,
  composeRefs,
  radixSelectAction,
  useHotkey,
  useKeyboundCommands,
  useKeyboundContext,
  useMnemonic
};
//# sourceMappingURL=index.js.map
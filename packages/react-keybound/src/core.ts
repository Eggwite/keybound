export type ParsedMnemonic = {
  text: string;
  key: string | null;
  index: number;
  length: number;
};

export type Shortcut = {
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  mod: boolean;
  source: string;
};

const modifierNames = new Set(['ctrl', 'control', 'alt', 'shift', 'meta', 'cmd', 'command', 'mod']);

function firstGrapheme(value: string): string {
  const Segmenter =
    typeof Intl !== 'undefined'
      ? (Intl as typeof Intl & { Segmenter?: typeof Intl.Segmenter }).Segmenter
      : undefined;
  if (Segmenter) {
    const segments = new Segmenter(undefined, { granularity: 'grapheme' }).segment(value);
    const iterator = segments[Symbol.iterator]();
    return iterator.next().value?.segment ?? '';
  }
  return Array.from(value)[0] ?? '';
}

export function normalizeKey(value: string): string {
  const normalized = value.normalize('NFC').toLowerCase();
  const aliases: Record<string, string> = { esc: 'escape', ' ': 'space' };
  return aliases[normalized] ?? normalized;
}

/** Parses the first unescaped ampersand without changing the display text otherwise. */
export function parseMnemonic(input: string): ParsedMnemonic {
  let text = '';
  let key: string | null = null;
  let index = -1;
  let length = 0;

  for (let cursor = 0; cursor < input.length;) {
    if (input[cursor] !== '&') {
      text += input[cursor];
      cursor += 1;
      continue;
    }
    if (input[cursor + 1] === '&') {
      text += '&';
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
    text += '&';
    cursor += 1;
  }
  return { text, key, index, length };
}

export function parseShortcut(input: string): Shortcut | null {
  if (typeof input !== 'string' || !input.trim()) return null;
  const rawTokens = input.split('+').map((token) => token.trim().toLowerCase());
  if (!rawTokens.length || rawTokens.some((token) => !token)) return null;
  const result: Shortcut = {
    key: '',
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
    mod: false,
    source: input,
  };
  for (let token of rawTokens) {
    if (modifierNames.has(token)) {
      if (token === 'ctrl' || token === 'control') {
        if (result.ctrl) return null;
        result.ctrl = true;
      } else if (token === 'alt') {
        if (result.alt) return null;
        result.alt = true;
      } else if (token === 'shift') {
        if (result.shift) return null;
        result.shift = true;
      } else if (token === 'meta' || token === 'cmd' || token === 'command') {
        if (result.meta) return null;
        result.meta = true;
      } else {
        if (result.mod) return null;
        result.mod = true;
      }
      continue;
    }
    if (result.key) return null;
    if (token === 'plus') token = '+';
    if (!isShortcutKey(token)) return null;
    result.key = normalizeKey(token);
  }
  return result.key ? result : null;
}

const namedKeys = new Set([
  'enter',
  'escape',
  'esc',
  'tab',
  'space',
  'arrowup',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'home',
  'end',
  'pageup',
  'pagedown',
  'backspace',
  'delete',
  'insert',
]);

function isShortcutKey(value: string): boolean {
  return (
    namedKeys.has(value) || /^f(?:[1-9]|1[0-2])$/.test(value) || Array.from(value).length === 1
  );
}

export function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  const browser = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = browser.userAgentData?.platform ?? navigator.platform ?? '';
  const userAgent = navigator.userAgent ?? '';
  return /mac|iphone|ipad|ipod/i.test(`${platform} ${userAgent}`);
}

export type PlatformModifierMap = {
  mac?: string;
  windows?: string;
  linux?: string;
  default?: string;
};

export type MnemonicModifierSetting = 'auto' | string | PlatformModifierMap;

export function resolveMnemonicModifier(
  setting: MnemonicModifierSetting = 'auto',
  apple = isApplePlatform(),
): string {
  if (setting === 'auto') return apple ? 'mod' : 'alt';
  if (typeof setting === 'string') return setting;
  if (apple) return setting.mac ?? 'mod';
  return setting.windows ?? setting.linux ?? setting.default ?? 'alt';
}

export function matchesShortcut(
  shortcut: Shortcut,
  event: KeyboardEvent,
  apple = isApplePlatform(),
): boolean {
  if (event.isComposing || ['Dead', 'Process', 'Unidentified'].includes(event.key)) return false;
  if (event.getModifierState?.('AltGraph')) return false;
  return (
    normalizeKey(event.key) === shortcut.key && matchesShortcutModifiers(shortcut, event, apple)
  );
}

export function matchesShortcutModifiers(
  shortcut: Shortcut,
  event: Pick<KeyboardEvent, 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'>,
  apple = isApplePlatform(),
): boolean {
  const expectedCtrl = shortcut.ctrl || (shortcut.mod && !apple);
  const expectedMeta = shortcut.meta || (shortcut.mod && apple);
  return (
    event.ctrlKey === expectedCtrl &&
    event.altKey === shortcut.alt &&
    event.shiftKey === shortcut.shift &&
    event.metaKey === expectedMeta
  );
}

export function formatShortcut(shortcut: Shortcut | string, apple = isApplePlatform()): string {
  const item = typeof shortcut === 'string' ? parseShortcut(shortcut) : shortcut;
  if (!item) return typeof shortcut === 'string' ? shortcut : '';
  const parts: string[] = [];
  if (item.ctrl || (item.mod && !apple)) parts.push(apple ? '⌃' : 'Ctrl');
  if (item.alt) parts.push(apple ? '⌥' : 'Alt');
  if (item.shift) parts.push(apple ? '⇧' : 'Shift');
  if (item.meta || (item.mod && apple)) parts.push(apple ? '⌘' : 'Meta');
  parts.push(item.key.length === 1 ? item.key.toUpperCase() : displayKey(item.key));
  return parts.join(apple ? '' : '+');
}

export function formatAriaShortcut(shortcut: Shortcut, apple = false): string {
  const parts: string[] = [];
  if (shortcut.ctrl || (shortcut.mod && !apple)) parts.push('Control');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.meta || (shortcut.mod && apple)) parts.push('Meta');
  parts.push(displayKey(shortcut.key));
  return parts.join('+');
}

function displayKey(key: string): string {
  const names: Record<string, string> = {
    esc: 'Esc',
    escape: 'Escape',
    enter: 'Enter',
    tab: 'Tab',
    space: 'Space',
    arrowup: 'ArrowUp',
    arrowdown: 'ArrowDown',
    arrowleft: 'ArrowLeft',
    arrowright: 'ArrowRight',
    home: 'Home',
    end: 'End',
    pageup: 'PageUp',
    pagedown: 'PageDown',
    backspace: 'Backspace',
    delete: 'Delete',
    insert: 'Insert',
  };
  return names[key] ?? key.toUpperCase();
}

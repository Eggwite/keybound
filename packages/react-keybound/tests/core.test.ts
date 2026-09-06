import { describe, expect, it } from 'vitest';
import {
  formatAriaShortcut,
  matchesShortcut,
  normalizeKey,
  parseMnemonic,
  parseShortcut,
} from '../src/core';

describe('parseMnemonic', () => {
  it('decodes escapes and marks the first Unicode grapheme', () => {
    expect(parseMnemonic('&& &e\u0301lan && &x')).toEqual({
      text: '& e\u0301lan & &x',
      key: 'e\u0301',
      index: 2,
      length: 2,
    });
    expect(parseMnemonic('Save&')).toEqual({ text: 'Save&', key: null, index: -1, length: 0 });
  });
});

describe('shortcuts', () => {
  it('requires a non-modifier key and matches exact modifiers', () => {
    const shortcut = parseShortcut('ctrl+shift+k');
    expect(shortcut).not.toBeNull();
    expect(parseShortcut('ctrl+shift')).toBeNull();
    expect(
      matchesShortcut(
        shortcut!,
        {
          key: 'K',
          ctrlKey: true,
          shiftKey: true,
          altKey: false,
          metaKey: false,
          isComposing: false,
          getModifierState: () => false,
        } as unknown as KeyboardEvent,
        false,
      ),
    ).toBe(true);
    expect(
      matchesShortcut(
        shortcut!,
        {
          key: 'k',
          ctrlKey: true,
          shiftKey: true,
          altKey: true,
          metaKey: false,
          isComposing: false,
          getModifierState: () => false,
        } as unknown as KeyboardEvent,
        false,
      ),
    ).toBe(false);
  });

  it('rejects empty tokens and uses canonical, locale-independent key names', () => {
    expect(parseShortcut('ctrl++k')).toBeNull();
    expect(parseShortcut('ctrl+shift')).toBeNull();
    expect(normalizeKey('ESC')).toBe('escape');
    expect(formatAriaShortcut(parseShortcut('ctrl+esc')!)).toBe('Control+Escape');
  });

  it('strictly adheres to semantic matching and rejects physical code fallbacks, Dead keys, AltGraph and composition', () => {
    const altS = parseShortcut('alt+s')!;
    // Layout-specific Option glyph (e.g. Option+S on macOS produces '\u00df') must NOT match 'alt+s'
    expect(
      matchesShortcut(
        altS,
        {
          key: '\u00df',
          code: 'KeyS',
          altKey: true,
          ctrlKey: false,
          shiftKey: false,
          metaKey: false,
          isComposing: false,
          getModifierState: () => false,
        } as unknown as KeyboardEvent,
        true,
      ),
    ).toBe(false);

    // Dead key accent prefix (e.g. Option+E produces 'Dead') must NOT match
    const altE = parseShortcut('alt+e')!;
    expect(
      matchesShortcut(
        altE,
        {
          key: 'Dead',
          code: 'KeyE',
          altKey: true,
          ctrlKey: false,
          shiftKey: false,
          metaKey: false,
          isComposing: false,
          getModifierState: () => false,
        } as unknown as KeyboardEvent,
        true,
      ),
    ).toBe(false);

    // AltGraph must NOT match
    expect(
      matchesShortcut(
        altS,
        {
          key: 's',
          altKey: true,
          ctrlKey: false,
          shiftKey: false,
          metaKey: false,
          isComposing: false,
          getModifierState: (m: string) => m === 'AltGraph',
        } as unknown as KeyboardEvent,
        false,
      ),
    ).toBe(false);

    // Composition must NOT match
    expect(
      matchesShortcut(
        altS,
        {
          key: 's',
          altKey: true,
          ctrlKey: false,
          shiftKey: false,
          metaKey: false,
          isComposing: true,
          getModifierState: () => false,
        } as unknown as KeyboardEvent,
        true,
      ),
    ).toBe(false);
  });
});

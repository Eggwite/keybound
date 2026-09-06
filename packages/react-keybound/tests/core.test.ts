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
});

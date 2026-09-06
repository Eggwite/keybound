type ParsedMnemonic = {
    text: string;
    key: string | null;
    index: number;
    length: number;
};
type Shortcut = {
    key: string;
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
    mod: boolean;
    source: string;
};
declare function normalizeKey(value: string): string;
/** Parses the first unescaped ampersand without changing the display text otherwise. */
declare function parseMnemonic(input: string): ParsedMnemonic;
declare function parseShortcut(input: string): Shortcut | null;
declare function isApplePlatform(): boolean;
declare function matchesShortcut(shortcut: Shortcut, event: KeyboardEvent, apple?: boolean): boolean;
declare function matchesShortcutModifiers(shortcut: Shortcut, event: Pick<KeyboardEvent, 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'>, apple?: boolean): boolean;
declare function formatShortcut(shortcut: Shortcut, apple?: boolean): string;
declare function formatAriaShortcut(shortcut: Shortcut, apple?: boolean): string;

export { type ParsedMnemonic, type Shortcut, formatAriaShortcut, formatShortcut, isApplePlatform, matchesShortcut, matchesShortcutModifiers, normalizeKey, parseMnemonic, parseShortcut };

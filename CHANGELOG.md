# Changelog

## 0.1.1 (2026-09-07)

- Examples page ergonomics: ensure each interactive example section uses unique, collision-free shortcuts so every demo responds independently.
- Cross-platform mnemonic modifier ergonomics: default `mnemonicModifier` to `'auto'` (resolves to `'mod'` / Command on macOS/iPadOS and `'alt'` on Windows/Linux).
- Add `PlatformModifierMap` support to configure per-platform modifiers (e.g. `{ mac: 'ctrl', windows: 'alt' }`).
- Add `mac-alt-mnemonic` development warning when `alt` is configured on Apple platforms to flag glyph/dead-key conflicts with semantic key matching.
- Update hint badges and demo UI to dynamically display platform-appropriate modifier symbols (`⌘` vs `Alt+`).

## 0.1.0 (2026-09-06)

- Inline JSX mnemonic and hotkey annotations with Next.js, Vite and Babel integration.
- React bindings with semantic activation, nested/modal scopes and configurable diagnostics.
- Optional hint overlay and live shortcut help; compiler metadata for static documentation.
- TypeScript declarations, optional styles, compact docs and an interactive Next.js playground.
- Initial public release of `react-keybound`.

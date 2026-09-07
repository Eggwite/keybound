# Keybound Agent Guide

This document is designed for AI coding assistants and developers using or contributing to `react-keybound`.

---

## 1. Using & Integrating `react-keybound`

`react-keybound` provides desktop-grade keyboard interactions (mnemonics, hotkeys, modal scopes, hints) for React applications with a tiny runtime (< 8 KB gzipped).

### Installation

```sh
npm install react-keybound
```

### Compiler Setup (Recommended for JSX Sugar)

To enable `<button>&Save</button>` and `<input hotkey="mod+k" />` JSX annotations:

- **Next.js (`next.config.ts`)**:

  ```ts
  import { withKeybound } from 'react-keybound/next';

  export default withKeybound({}, { components: ['Button'] });
  ```

- **Vite (`vite.config.ts`)**:

  ```ts
  import react from '@vitejs/plugin-react';
  import { defineConfig } from 'vite';
  import keybound from 'react-keybound/vite';

  export default defineConfig({
    plugins: [keybound(), react()],
  });
  ```

- **JSX Type Augmentation**:
  Include `import type {} from 'react-keybound/jsx';` in client code or layout to enable the optional `hotkey` prop on JSX elements.

### Application Usage

Wrap your application or subtree in `<KeyboundProvider>`:

```tsx
'use client';

import { KeyboundProvider } from 'react-keybound';
import type {} from 'react-keybound/jsx';

export function App() {
  return (
    <KeyboundProvider>
      {/* Mnemonics: 'Alt+S' (Win/Linux) or '⌘S' (macOS) underlines S and triggers save */}
      <button onClick={save}>&Save</button>

      {/* Hotkeys: '⌘K' (macOS) / 'Ctrl+K' (Win/Linux) focuses search */}
      <input hotkey="mod+k" aria-label="Search" placeholder="Search (⌘K)" />
    </KeyboundProvider>
  );
}
```

### Hooks (Compiler-Free & Dynamic Labels)

For dynamic strings, translated text, or build-step-free usage:

```tsx
import { useMnemonic, useHotkey } from 'react-keybound';

function DynamicButton({ text, onClick }: { text: string; onClick: () => void }) {
  const { label, triggerProps } = useMnemonic<HTMLButtonElement>(text, {
    onAction: onClick,
  });

  return <button {...triggerProps}>{label}</button>;
}

function SearchInput() {
  const { triggerProps } = useHotkey<HTMLInputElement>('mod+k');

  return <input {...triggerProps} placeholder="Search..." />;
}
```

### Key API Concepts

- **`&` Mnemonics**: `<button>&Save</button>` underlines **S** and activates via `mnemonicModifier` (`auto` defaults to `Alt+S` on Windows/Linux and `⌘S` on macOS/iPadOS). Use `&&` for literal `&`.
- **`mnemonicModifier` Prop**: Accepts `'auto'`, a specific modifier string (`'mod'`, `'ctrl'`, `'alt'`), or a platform map (`{ mac: 'ctrl', windows: 'alt' }`).
- **`hotkey` Attribute**: Explicit shortcut keys (`mod+k`, `ctrl+s`, `shift+?`). `mod` resolves to Meta on macOS and Ctrl elsewhere.
- **`<KeyboundScope>`**: Manages active/inactive subtrees and modal shortcut blocking (`modal={true}`).
- **`<KeyboundOverlay />`**: Visual hint badge overlay for available shortcuts.

---

## 2. Developing & Contributing to `react-keybound`

Instructions for agents and contributors working on the `react-keybound` repository itself. Read `docs/SPEC.md` before changing public behavior.

### Requirements & Setup

- Use Node 22.12+ and `npm`.
- Run `npm ci` to install dependencies.
- On Windows environments where the npm shim may be broken, invoke:
  `node "C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js"` when needed.

### Verification Suite

Run the full verification suite before completing work:

```sh
npm run check
```

This script runs linting (`eslint`), typechecking (`tsc`), unit/behavior tests (`vitest`), workspace build (`tsup`), Next.js site build (`next build`), Vite build (`vite build`), and package artifact verification.

### Codebase & Architectural Rules

- **Runtime Constraints**: `packages/react-keybound/src` must remain dependency-free beyond peer React/ReactDOM.
- **SSR & Browser Globals**: Access browser globals only inside committed React effects (`useEffect`), never during module evaluation or server rendering.
- **Compiler Separation**: Keep compiler-only dependencies (Babel transforms, Webpack loader, Vite plugin) separated from the runtime entry point (`react-keybound`).
- **DOM & Ref Safety**: Never mutate rendered DOM text directly behind React. Preserve element refs and event handlers.
- **Testing Philosophy**: Tests must verify behavior boundaries: compiler outputs, dispatch eligibility, scope isolation, package exports, and real Next/Vite builds. JSDOM does not calculate visual layout; stub bounding rectangles explicitly for visibility tests and do not describe JSDOM testing as true browser layout coverage.
- **Documentation & Releases**: Update user docs and `CHANGELOG.md` when changing public APIs. Package releases are strictly manual through `.github/workflows/release.yml`.

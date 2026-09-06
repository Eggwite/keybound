# Getting started

`react-keybound` is not published yet. Inside this repository, install with `npm ci` and run the live Next.js example with `npm run dev`.

## Configure one transform

Next.js:

```ts
import { withKeybound } from 'react-keybound/next';

export default withKeybound({}, { components: ['Button'] });
```

Vite:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import keybound from 'react-keybound/vite';

export default defineConfig({ plugins: [keybound(), react()] });
```

The allowlist tells the compiler which custom component labels it may replace. Native `button`, `a`, `label` and `summary` labels are understood by default. `data-keybound-ignore` skips an element.

## Add the provider

```tsx
'use client';

import { KeyboundProvider } from 'react-keybound';
import type {} from 'react-keybound/jsx';

export function App() {
  return (
    <KeyboundProvider>
      <button onClick={save}>&Save</button>
      <input hotkey="mod+k" aria-label="Search" />
    </KeyboundProvider>
  );
}
```

The `&` form removes the marker, underlines the following grapheme, and binds the provider's mnemonic modifier (Alt by default). Use `&&` for a literal ampersand. Explicit `hotkey` values use exactly the modifiers written; `mod` means Command on Apple platforms and Control elsewhere.

The type-only `react-keybound/jsx` import adds the compile-only `hotkey` prop to native JSX typing. It has no runtime code. Components inheriting native button/input props inherit the annotation; otherwise declare the prop locally or use a wrapper/hook.

## Dynamic and rich labels

Static labels get the shortest compiler syntax. Dynamic labels use runtime APIs:

```tsx
const { label, triggerProps } = useMnemonic<HTMLButtonElement>(translatedLabel);
return <Button {...triggerProps}>{label}</Button>;
```

```tsx
<Hotkey keys="mod+shift+p" label="Command palette">
  <Button onClick={openPalette}>Commands</Button>
</Hotkey>
```

Missing providers throw an actionable runtime error. Compiler warnings appear in the terminal and identify file/line; runtime eligibility/collision warnings appear in the browser console. Both are non-blocking and configurable.

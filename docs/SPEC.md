# Keybound 0.1 specification

Status: implementation contract. Package name: `react-keybound` (unclaimed at the initial registry check; no name reservation implied). Keybound is the product name.

## Scope

Compile-time keyboard annotations, desktop-style mnemonics and colocated shortcuts for React 18.3 and React 19. TypeScript, modern evergreen browsers, ESM. Build and test a Next.js App Router demo and a Vite consumer. No key sequences, global OS shortcuts, implicit third-party modal detection, legacy React, or cross-frame dispatch. The primary authoring surface is plain JSX with an opt-in transform. Hooks and wrappers support dynamic cases without a compiler. Never mutate rendered DOM text behind React.

## Public API contract

```tsx
import {
  KeyboundProvider,
  KeyboundScope,
  Mnemonic,
  Hotkey,
  useMnemonic,
  useHotkey,
  KeyboundOverlay,
} from 'react-keybound';

<KeyboundProvider>
  <Mnemonic text="&Save">
    <button onClick={save} />
  </Mnemonic>
  <Hotkey keys="mod+k" label="Search">
    <input aria-label="Search" />
  </Hotkey>
  <KeyboundOverlay />
</KeyboundProvider>;

const { label, text, triggerProps } = useMnemonic<HTMLButtonElement>('&Save');
<Button {...triggerProps} onClick={save}>
  {label}
</Button>;
useHotkey('mod+k', openSearch, { label: 'Search' });
```

- `useMnemonic<T extends HTMLElement = HTMLElement>(text, options?)` returns `label: ReactNode` (underline defaults on), `text: string` (clean accessible text), and `triggerProps` (`ref`, `aria-keyshortcuts`, `data-keybound`). `options` supports `enabled`, `action: 'auto' | 'click' | 'focus' | ((element, event) => void)`, `allowInInput`, `repeat`, `preventDefault`, `warnings`, and `className`/`style` for the marked character. The ref is a React-compatible callback ref. Controls keep their own event handlers and native semantics.
- `Mnemonic({text, children, ...options})` accepts exactly one element, clones it with composed refs/shortcut props and the rendered label as children. Existing child content is intentionally replaced; use the hook for icons, translated rich labels, or multiple text regions.
- `Hotkey({keys, label?, children, ...options})` accepts one element, retains its children, composes refs, infers activation; `useHotkey(keys, callback, options?)` registers a command with no visible target. Hook `options` additionally supports `targetRef` for visibility and overlay placement. Hook calls return void.
- `KeyboundProvider`: `children`, `enabled=true`, `mnemonicModifier='alt'` (modifier chord string), `reveal='always'|'modifier'|'never'`, `warnings` (boolean or map of codes to boolean), `onWarning(warning)`, `collision='last'|'first'`. No DOM wrapper. Default development warnings go to the browser console only after commit or on dispatch. Production silent by default; explicit `warnings=true` can opt in. Missing provider is a clear actionable programmer error, also during SSR.
- `KeyboundScope`: `children`, `active=true`, `modal=false`, `name?`. No DOM wrapper; React context follows portals. Inactive scope disables its subtree. Deepest active scope wins; within it, a focused target wins; otherwise stable registration order resolves using provider collision policy. The most recently activated modal scope blocks all bindings outside it, even if that modal has no matching key. Explicitly tie modal scope `active` to open state.
- `KeyboundOverlay`: opt-in decorative hints at eligible target rects. `open?` (controlled; default follows modifier), `className?`, `style?`, `renderHint?` receiving `{keys,label,element}`. Portals to document.body, pointer-events none and aria-hidden. No invisible command targets. Empty/hidden/disabled targets produce no hints. Coordinates update only while open using a single animation-frame loop so scrolling, resizing, layout movement, CSS visibility, and unmounts stay correct. Hidden by default on server and first hydration render. Honor reduced motion in optional CSS. Export optional CSS as `react-keybound/styles.css`; underline itself works without importing CSS.
- `react-keybound/core` exports pure `parseMnemonic(text)` -> `{text,key,index,length}` (`key: string|null`, UTF-16 index, marked grapheme length), `parseShortcut(keys)` and shortcut formatting as needed. Pure entry import never touches browser globals.

## JSX compiler contract

Export a Babel 7 plugin at `react-keybound/babel`. With this opt-in transform:

```tsx
<button onClick={save}>&Save</button>
// becomes
<Mnemonic text="&Save"><button onClick={save} /></Mnemonic>

<input hotkey="mod+k" aria-label="Search" />
// becomes
<Hotkey keys="mod+k"><input aria-label="Search" /></Hotkey>
```

Transform native `button`, `a`, `label`, `summary` static text with a mnemonic marker; configurable `components: ['Button', 'DialogTrigger', 'Tabs.Trigger']` opts custom components in. Pure escaped ampersands (`&&`) also decode for selected elements. Preserve props, refs, locations, directives, JSX whitespace semantics, comments and existing imports. Handle quoted string expressions as well as JSXText. Never transform arbitrary prose. Dynamic/rich children stay unchanged with an actionable optional compile diagnostic when a direct text mnemonic was detected; the hook handles them. `hotkey` accepts a string or expression and transforms native/custom elements explicitly, preserving their children. Avoid double binding when mnemonic + hotkey share a target: explicit hotkey wins, with marker rendered through a presentational label or a documented diagnostic/single binding decision. Plugin options `warnings: false` suppress terminal warnings; default warnings never fail compilation. Per-element `data-keybound-ignore` bypasses transform and is left as valid data markup. No global JSX type augmentation. Plugin output typechecks; production Next and Vite fixture builds validate real plugin wiring.

Provide `react-keybound/vite` default `keybound(options?)` as a pre-transform Vite plugin and `react-keybound/next` named `withKeybound(nextConfig?, options?)` as a Next config wrapper. Share Babel transform logic through `react-keybound/loader` (Webpack loader API; configure Turbopack rules explicitly too). Preserve JSX/TS for the framework's own compiler. Test the actual Next production path and a Vite fixture. Avoid requiring developers to maintain their own Babel config. Keep the raw Babel plugin available for other toolchains.

Optional `import type {} from 'react-keybound/jsx'` enables native JSX `hotkey?: string` typing; it is deliberately opt-in, not injected by the main import. Custom components that inherit native props (including shadcn Button/Input) inherit the annotation. Other custom components can use explicit wrappers or declare that prop. `hotkey='o'` means a literal unmodified key; provider `mnemonicModifier` affects mnemonic sugar only. This distinction must appear next to the example.

Compiler records `file.metadata.keybound` array of `{keys,label,file,line,column,kind}`. Expose a Node `extractManifest(files, options?)` utility at `react-keybound/compiler` that transforms explicitly supplied source files and returns the combined JSON-friendly metadata; no crawling app directories or plugin-global mutable state. Vite plugin optionally emits `keybound-manifest.json` from per-file metadata. Diagnostic codes include invalid shortcuts, static duplicates (file-local advisory only, never pretend to know runtime scopes), reserved/common browser combos, unsupported rich mnemonic labels, and unnamed explicit bindings. Callback and `warnings:false` options allow developer control. Static metadata is documentation, not authority for live visibility.

`useKeyboundCommands()` exposes a live list of eligible `{id, keys, label, element}` (updates while mounted, including DOM eligibility); `KeyboundHelp` renders an accessible, nonmodal shortcut list from it, with `className`, `style`, and optional `renderItem`. List rows describe shortcuts and do not claim to invoke commands. Runtime registrations are the default help source so hidden/unmounted UI is excluded. No forced keyboard shortcut or modal UX; apps may compose it inside their dialog.

Framework components use small explicit adapters: export `radixSelectAction(element,event)` at `react-keybound/adapters` for the Select trigger's keyboard semantics, while DialogTrigger/TabsTrigger use actual native click/focus semantics when supported. Verify adapters against real installed Radix primitives in tests/demo. Do not guess arbitrary third-party internals or automatically activate closed dialogs; scope context follows the declared React hierarchy. Document one reusable design-system recipe instead of separate framework packages.

## Behavioral decisions

- First unescaped `&` marks one Unicode grapheme; `&&` is literal `&`; a trailing `&` is literal. Subsequent markers are preserved literally to avoid silently deleting text. Normalize NFC for matching; render original text unchanged apart from the marker. Composed characters tested. Keyboard matching uses event.key, never a US-only physical key fallback. AltGr, composition, Dead/Process/Unidentified events are ignored. `mod` resolves to Meta on Apple, Ctrl elsewhere; explicit Ctrl remains Ctrl.
- Default underline uses `text-decoration` on a span (`data-keybound-mnemonic`), preserving accessible text and layout. Custom class/style or reveal policy overrides it. No HTML `accesskey` so the browser does not activate the same control twice.
- Hidden eligibility checked at dispatch, not cached at registration: disconnected, hidden/hidden ancestors, display:none, visibility:hidden/collapse, inert, aria-hidden ancestors, disabled/fieldset, aria-disabled ancestors, closed details content, and empty client rects are skipped. Offscreen but laid-out elements remain keyboard accessible; overlay only displays viewport-intersecting hints. Document these practical boundaries (not full visual occlusion detection).
- Inputs, textareas, select, contenteditable and role=textbox typing suppress shortcuts by default. Per-binding `allowInInput` opts in. User preventDefault handlers run first; ignore already-prevented events. Repeated events ignored unless enabled. Extra modifiers must match exactly, modifier-only shortcuts invalid. Only preventDefault after an eligible winning binding. Do not stop propagation.
- Auto action focuses text inputs/textarea/select/contenteditable, clicks buttons/links/checkbox/radio/summary, and focuses associated controls for labels. Custom activation can be supplied for headless library semantics. `.click()` cannot stand in for every library's pointerdown behavior; no blanket Radix adapter claim.
- One dispatcher per provider; no listener per binding, no DOM observer or polling while hints closed. Provider isolation prevents multiple provider handlers from consuming the same event after preventDefault. Stable callback refs prevent register churn. Strict Mode setup/cleanup is idempotent. Current callback/config used after committed rerenders. No window/document/navigator reads at import or server render.
- Diagnostics use stable codes `invalid-shortcut`, `collision`, `missing-target`, `invalid-mnemonic` as needed. Warnings are actionable, de-duplicated, non-blocking, can be silenced globally or per binding. Collisions are evaluated among eligible peers when dispatched, not all ever-mounted components. Diagnostic callbacks receive structured data and no unsolicited stack dumps. Compile diagnostics describe file/line; runtime warnings describe keys/labels and client origin.

## Success criteria

- [x] `<button>&Save</button>` actually compiles, underlines S, and activates once with Alt+S.
- [x] Hook and wrapper APIs work with native controls and ref-forwarding shadcn primitives, preserving refs and handlers.
- [x] Escapes, Unicode, changed labels/callbacks, unmounting, Strict Mode, and SSR/hydration behave correctly.
- [x] Hidden, disabled, inert, closed-details, editable, repeat, composition, AltGr, and cancelled-event cases are validated.
- [x] Nested, inactive and portal/modal scopes resolve deterministically; empty modal blocks background shortcuts.
- [x] Overlay reflects real eligibility and target positions while open; accepts custom rendering and styles.
- [x] Warnings are useful, suppressible and quiet in default production mode; no server console spam from runtime.
- [x] Lint, strict types, behavioral tests, package build, package export checks, packed consumer checks, Next production build and Vite build pass.
- [x] Runtime contains no third-party dependency beyond React/ReactDOM peers; package CSS optional, client directive preserved, pure/compiler entries separated. Record actual gzip size and enforce a reasonable budget, not marketing guesses.
- [x] Demo has real package-backed interactions: mnemonic playground, semantic focus/click controls, hidden/disabled state, portal/modal collision, configurable hints/styles, live event feedback, installation and sugar-high code.
- [x] Three user docs pages cover getting started/compiler, behavior/scopes and customization/API; contributor spec/guide/audit separate.
- [x] Single config helpers exist for Next/Vite; JSX typing is opt-in. Build diagnostics, manifest extraction and runtime-generated help are exercised. Radix adapter limitations are explicit and tested.
- [x] MIT, contributing, security, conduct, changelog, issue/PR templates, CI and manual draft release workflow exist. Publishing remains manually gated and disabled until repository/package ownership configured.

## Validation philosophy

Test meaningful behavior and integration boundaries, not a coverage percentage. JSDOM checks need explicit rect stubs because it has no layout. Real browser rendering/OS shortcuts are a manual release check unless the user explicitly authorizes browser verification. Never describe DOM simulation as browser coverage.

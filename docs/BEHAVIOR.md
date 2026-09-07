# Behavior and scopes

Keybound has one document key listener per provider. A key press is matched against committed registrations, then filtered using current DOM state.

## Eligibility

A target is skipped when it is disconnected, hidden through itself or an ancestor, inert, `aria-hidden`, disabled, inside a disabled fieldset, or inside collapsed `<details>` content. Empty client rectangles count as hidden. Offscreen but laid-out controls remain keyboard eligible; overlay hints only appear inside the viewport.

Normal bindings do not fire while typing in inputs, textareas, selects, contenteditable regions, or `role="textbox"`. Set `allowInInput: true` for deliberate editor shortcuts. Composition, AltGr, unknown/dead keys, unmatched extra modifiers, repeats, and already-prevented events are ignored by default. `repeat: true` opts one binding into repeats.

## Semantic Matching & Platform-Aware Mnemonic Modifiers

Keybound matches shortcuts semantically against `KeyboardEvent.key`, strictly following the user's active keyboard layout and remapping. It never uses physical key positions (`event.code`) or legacy key codes (`keyCode`).

### macOS & iPadOS Keyboard Quirks

On Apple keyboards, the Option key (`⌥`) acts as an alternative glyph and diacritic composer rather than a standard accelerator (e.g. `Option+S` produces `ß`, `Option+X` produces `≈`, and `Option+E` produces `Dead`). Because Keybound requires semantic character equality, these glyphs do not match ASCII letters under an `alt` modifier.

### Zero-Config `mnemonicModifier="auto"`

To provide desktop-grade keyboard intent across operating systems with zero developer friction, `<KeyboundProvider>` defaults `mnemonicModifier="auto"`:

- **Windows & Linux**: Resolves to `'alt'` (`Alt+S`), honoring traditional desktop accelerator conventions.
- **macOS & iPadOS**: Resolves to `'mod'` (`⌘S`), matching standard thumb ergonomics without producing alternate glyphs.

### Platform Mapping & Browser Shortcuts

While `mod` (`⌘`) provides a native Mac experience, browsers reserve select shortcuts (e.g. `⌘L` for the address bar, `⌘W` to close tabs, `⌘T` for new tabs, `⌘R` to reload) that web apps cannot reliably preventDefault or intercept in WebKit/Safari. If you require complete isolation from browser-reserved shortcuts on Mac or need to bind letters that browsers reserve, configure an explicit platform map using `Control` (`⌃`), which is 100% collision-free:

```tsx
<KeyboundProvider
  mnemonicModifier={{
    mac: 'ctrl', // ⌃S on macOS/iPadOS
    windows: 'alt', // Alt+S on Windows
    linux: 'alt', // Alt+S on Linux
  }}
>
  {children}
</KeyboundProvider>
```

### Advisory Warning: `mac-alt-mnemonic`

If a developer explicitly sets `mnemonicModifier="alt"` on an Apple platform, Keybound emits an advisory development warning (`[keybound:mac-alt-mnemonic]`). This warning is de-duplicated and suppressible globally or via `warnings={{ 'mac-alt-mnemonic': false }}`.

Keybound calls `preventDefault()` only after finding a winner. It never stops propagation.

## Activation

`action="auto"` focuses text-like controls and activates buttons, links, checkboxes, radios and summaries through native semantics. Labels focus their associated control. Choose `action="focus"`, `action="click"`, or a callback for custom/headless behavior.

A synthetic click cannot reproduce every component library's pointer sequence. Keep that boundary explicit. `react-keybound/adapters` includes the narrow Radix Select keyboard adapter; ordinary shadcn/Radix triggers that preserve native click/focus semantics need no special package.

## Scopes

```tsx
<KeyboundScope active={open} modal name="settings-dialog">
  <button>&Apply</button>
</KeyboundScope>
```

Inactive scope ancestry disables descendants. The newest active modal scope blocks every binding outside it, including when the modal has no matching command. Otherwise, deepest active scope wins; a binding containing current focus wins among peers; provider `collision="first" | "last"` resolves the remaining tie. Development collision warnings remain advisory and suppressible.

React context follows portals, so place `KeyboundScope` around portalled dialog content and tie `active` to open state. Keybound does not inspect arbitrary third-party modal internals.

## Server rendering

Package imports and server rendering do not read `window`, `document`, or `navigator`. Listeners and geometry begin after client commit. The overlay renders nothing on the server and during initial hydration.

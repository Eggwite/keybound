# Behavior and scopes

Keybound has one document key listener per provider. A key press is matched against committed registrations, then filtered using current DOM state.

## Eligibility

A target is skipped when it is disconnected, hidden through itself or an ancestor, inert, `aria-hidden`, disabled, inside a disabled fieldset, or inside collapsed `<details>` content. Empty client rectangles count as hidden. Offscreen but laid-out controls remain keyboard eligible; overlay hints only appear inside the viewport.

Normal bindings do not fire while typing in inputs, textareas, selects, contenteditable regions, or `role="textbox"`. Set `allowInInput: true` for deliberate editor shortcuts. Composition, AltGr, unknown/dead keys, unmatched extra modifiers, repeats, and already-prevented events are ignored by default. `repeat: true` opts one binding into repeats.

Keybound matches shortcuts semantically against `KeyboardEvent.key`, strictly following the user's active keyboard layout and remapping. It never uses physical key positions (`event.code`) or legacy key codes (`keyCode`). On macOS, the Option key acts as a glyph modifier/dead-key composer (e.g. `Option+S` produces alternative glyphs like `ß`, `Option+E` produces `Dead`). For applications targeting macOS or cross-platform mnemonics, set `mnemonicModifier="mod"` on `<KeyboundProvider>` (`⌘` on Apple, `Ctrl` elsewhere) so mnemonics remain accessible semantic characters. Note that setting `mnemonicModifier="mod"` preserves semantic character matching on Mac, but does not make browser-reserved shortcuts automatically safe to capture.

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

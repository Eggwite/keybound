# Customization and API

## Provider

`KeyboundProvider` accepts `enabled`, `mnemonicModifier`, `reveal`, `collision`, `warnings`, and `onWarning`. `reveal` is `always`, `modifier`, or `never`; `always` preserves classic WinForms-style underlines by default. Development warns by default; production stays silent unless explicitly enabled.

## Mnemonics

`useMnemonic<T>(text, options?)` returns `label`, clean accessible `text`, and `triggerProps`. Options include `enabled`, `action`, `allowInInput`, `repeat`, `preventDefault`, `warnings`, `className`, and `style`.

```tsx
<Mnemonic text="&Open">
  <Button onClick={open} />
</Mnemonic>
```

`Mnemonic` replaces its child's label. Use the hook when preserving icons or rich content.

## Explicit shortcuts

```tsx
<Hotkey keys="mod+s" label="Save">
  <Button onClick={save}>Save</Button>
</Hotkey>
```

`Hotkey` keeps its child's content. `useHotkey(keys, callback, options?)` registers a command without a visible control. Pass `targetRef` when it should participate in target visibility and hint positioning.

## Help and overlay

`useKeyboundCommands()` exposes current eligible registrations. `KeyboundHelp` accepts `className`, `style`, and `renderItem`; compose it inside your dialog.

`KeyboundOverlay` renders pointer-transparent hints into `document.body`. `open` controls it; otherwise it follows the mnemonic modifier. `renderHint`, `className`, and `style` own presentation. Optional baseline CSS:

```ts
import 'react-keybound/styles.css';
```

Mnemonic underlining works inline without the stylesheet. Overlay geometry updates only while open.

## Compiler controls

Compiler options are `components`, `warnings`, and `onDiagnostic`; Vite adds `manifest: true | string`. Static manifests describe authored bindings and source locations. Live help uses mounted/eligible registrations.

`react-keybound/babel` exports the Babel plugin; `react-keybound/compiler` exports `transformKeybound` and `extractManifest(files)`. `react-keybound/core` exposes pure parsing/formatting without browser side effects.

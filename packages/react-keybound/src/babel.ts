import type { NodePath, PluginObj, PluginPass } from '@babel/core';
import type * as t from '@babel/types';
import { parseMnemonic, parseShortcut } from './core';

export type KeyboundDiagnosticCode =
  | 'invalid-shortcut'
  | 'invalid-mnemonic'
  | 'static-duplicate'
  | 'reserved-shortcut'
  | 'unsupported-rich-mnemonic'
  | 'unnamed-binding'
  | 'hotkey-overrides-mnemonic';

export interface KeyboundDiagnostic {
  code: KeyboundDiagnosticCode;
  message: string;
  file?: string;
  line?: number;
  column?: number;
}

export interface KeyboundMetadata {
  keys: string;
  label?: string;
  file?: string;
  line?: number;
  column?: number;
  kind: 'mnemonic' | 'hotkey';
}

export interface KeyboundBabelOptions {
  components?: string[];
  warnings?: boolean;
  onDiagnostic?: (diagnostic: KeyboundDiagnostic) => void;
}

interface State extends PluginPass {
  opts: KeyboundBabelOptions;
  keybound?: {
    metadata: KeyboundMetadata[];
    diagnostics: Set<string>;
    wrappedElements: WeakSet<t.JSXElement>;
    api: BabelPluginApi;
    imports: Partial<Record<'Mnemonic' | 'Hotkey', t.Identifier>>;
    program: NodePath<t.Program>;
  };
}

const nativeMnemonicNames = new Set(['button', 'a', 'label', 'summary']);
const reservedShortcuts = new Set([
  'ctrl+w',
  'ctrl+t',
  'ctrl+n',
  'ctrl+r',
  'meta+w',
  'meta+t',
  'meta+n',
  'meta+r',
  'alt+f4',
]);

// Babel supplies the value at plugin creation time; keep the declaration tied to
// core so consumers do not need a direct @babel/types dependency.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type BabelTypes = (typeof import('@babel/core'))['types'];

function elementName(types: BabelTypes, name: t.JSXOpeningElement['name']): string | null {
  if (types.isJSXIdentifier(name)) return name.name;
  if (types.isJSXMemberExpression(name)) {
    const object = elementName(types, name.object as t.JSXOpeningElement['name']);
    return object && types.isJSXIdentifier(name.property)
      ? `${object}.${name.property.name}`
      : null;
  }
  return null;
}

function staticAttributeValue(types: BabelTypes, attribute: t.JSXAttribute): string | null {
  if (!attribute.value) return null;
  if (types.isStringLiteral(attribute.value)) return attribute.value.value;
  if (
    types.isJSXExpressionContainer(attribute.value) &&
    types.isStringLiteral(attribute.value.expression)
  ) {
    return attribute.value.expression.value;
  }
  if (
    types.isJSXExpressionContainer(attribute.value) &&
    types.isTemplateLiteral(attribute.value.expression) &&
    attribute.value.expression.expressions.length === 0
  ) {
    return (
      attribute.value.expression.quasis[0]?.value.cooked ??
      attribute.value.expression.quasis[0]?.value.raw ??
      null
    );
  }
  return null;
}

function directText(
  types: BabelTypes,
  children: t.JSXElement['children'],
): { value: string; rich: boolean } {
  let value = '';
  for (const child of children) {
    if (types.isJSXText(child)) {
      const lines = child.value.split(/\r\n|\n|\r/);
      for (let index = 0; index < lines.length; index += 1) {
        let line = lines[index].replace(/\t/g, ' ');
        if (index !== 0) line = line.replace(/^ +/, '');
        if (index !== lines.length - 1) line = line.replace(/ +$/, '');
        value += line;
      }
      continue;
    }
    if (types.isJSXExpressionContainer(child)) {
      if (types.isJSXEmptyExpression(child.expression)) continue;
      if (types.isStringLiteral(child.expression)) {
        value += child.expression.value;
        continue;
      }
      if (types.isTemplateLiteral(child.expression) && child.expression.expressions.length === 0) {
        value += child.expression.quasis
          .map((quasi) => quasi.value.cooked ?? quasi.value.raw)
          .join('');
        continue;
      }
    }
    return { value, rich: true };
  }
  return { value, rich: false };
}

function canCompactChild(types: BabelTypes, children: t.JSXElement['children']): boolean {
  return children.every((child) => types.isJSXText(child));
}

function mnemonicKey(value: string): string | null {
  return parseMnemonic(value).key;
}

function hasMnemonicMarker(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== '&') continue;
    if (value[index + 1] === '&') {
      index += 1;
      continue;
    }
    return true;
  }
  return false;
}

function displayText(value: string): string {
  return parseMnemonic(value).text;
}

function diagnostic(
  state: State,
  node: t.Node,
  code: KeyboundDiagnosticCode,
  message: string,
  position?: { line?: number; column?: number },
): void {
  if (state.opts.warnings === false) return;
  const location = position ?? node.loc?.start;
  const file = state.file.opts.filename;
  const identity = `${code}:${file ?? ''}:${location?.line ?? 0}:${location?.column ?? 0}:${message}`;
  const data = state.keybound!;
  if (data.diagnostics.has(identity)) return;
  data.diagnostics.add(identity);
  const item: KeyboundDiagnostic = {
    code,
    message,
    file: file ?? undefined,
    line: location?.line,
    column: location?.column,
  };
  if (state.opts.onDiagnostic) state.opts.onDiagnostic(item);
  else
    console.warn(
      `[react-keybound] ${file ?? 'unknown file'}${location ? `:${location.line}:${location.column}` : ''} ${message}`,
    );
}

function record(
  state: State,
  node: t.Node,
  metadata: Omit<KeyboundMetadata, 'file' | 'line' | 'column'>,
): void {
  const location = node.loc?.start;
  const item: KeyboundMetadata = {
    ...metadata,
    file: state.file.opts.filename ?? undefined,
    line: location?.line,
    column: location?.column,
  };
  state.keybound!.metadata.push(item);
}

function importedComponent(
  types: BabelTypes,
  programPath: NodePath<t.Program>,
  state: State,
  imported: 'Mnemonic' | 'Hotkey',
): t.Identifier {
  const program = programPath.node;
  const cache = state.keybound!.imports;
  if (cache[imported]) return cache[imported];
  for (const statement of program.body) {
    if (
      !types.isImportDeclaration(statement) ||
      statement.source.value !== 'react-keybound' ||
      statement.importKind === 'type'
    )
      continue;
    for (const specifier of statement.specifiers) {
      if (
        types.isImportSpecifier(specifier) &&
        types.isIdentifier(specifier.imported, { name: imported }) &&
        specifier.importKind !== 'type'
      ) {
        return (cache[imported] = types.identifier(specifier.local.name));
      }
    }
  }
  let local: string = imported;
  while (programPath.scope.hasBinding(local) || programPath.scope.hasGlobal(local))
    local = `Keybound${local}`;
  const identifier = types.identifier(local);
  const target = program.body.find(
    (statement): statement is t.ImportDeclaration =>
      types.isImportDeclaration(statement) &&
      statement.source.value === 'react-keybound' &&
      statement.importKind !== 'type',
  );
  const specifier = types.importSpecifier(types.identifier(local), types.identifier(imported));
  if (target) target.specifiers.push(specifier);
  else {
    const firstNonImport = program.body.findIndex(
      (statement) => !types.isImportDeclaration(statement),
    );
    program.body.splice(
      firstNonImport < 0 ? program.body.length : firstNonImport,
      0,
      types.importDeclaration([specifier], types.stringLiteral('react-keybound')),
    );
  }
  return (cache[imported] = identifier);
}

function wrapWithAttributes(
  types: BabelTypes,
  name: t.Identifier,
  attributes: t.JSXAttribute[],
  element: t.JSXElement,
): t.JSXElement {
  const opening = types.jsxOpeningElement(types.jsxIdentifier(name.name), attributes, false);
  const closing = types.jsxClosingElement(types.jsxIdentifier(name.name));
  return types.jsxElement(opening, closing, [element], false);
}

function hotkeyLabel(
  types: BabelTypes,
  opening: t.JSXOpeningElement,
  text: { value: string; rich: boolean },
): string | undefined {
  if (!text.rich) {
    const visible = displayText(text.value).trim();
    if (visible) return visible;
  }
  for (const name of ['aria-label', 'title']) {
    const attribute = opening.attributes.find(
      (item): item is t.JSXAttribute =>
        types.isJSXAttribute(item) && types.isJSXIdentifier(item.name, { name }),
    );
    const value = attribute ? staticAttributeValue(types, attribute) : null;
    if (value !== null) return value;
  }
  return undefined;
}

type BabelPluginApi = { types: BabelTypes };

export default function keyboundBabelPlugin(api: BabelPluginApi): PluginObj {
  const plugin: PluginObj<State> = {
    name: 'react-keybound',
    visitor: {
      Program: {
        enter(path, state) {
          state.keybound = {
            metadata: [],
            diagnostics: new Set(),
            wrappedElements: new WeakSet(),
            api,
            imports: {},
            program: path,
          };
        },
        exit(path, state) {
          const metadata = state.keybound!.metadata;
          const seen = new Map<string, KeyboundMetadata>();
          for (const item of metadata) {
            const normalized = item.keys.toLowerCase();
            const previous = seen.get(normalized);
            if (previous)
              diagnostic(
                state,
                path.node,
                'static-duplicate',
                `static duplicate "${item.keys}"; runtime scopes decide which eligible binding wins`,
                item,
              );
            else seen.set(normalized, item);
          }
          (state.file.metadata as Record<string, unknown>).keybound = metadata;
        },
      },
      JSXElement(path, state) {
        const { types: t } = state.keybound!.api;
        const wrappedElements = state.keybound!.wrappedElements;
        if (wrappedElements.has(path.node)) return;
        const opening = path.node.openingElement;
        const name = elementName(t, opening.name);
        if (!name) return;
        const attributes = opening.attributes;
        if (
          attributes.some(
            (attribute) =>
              t.isJSXAttribute(attribute) &&
              t.isJSXIdentifier(attribute.name, { name: 'data-keybound-ignore' }),
          )
        )
          return;
        const hotkey = attributes.find(
          (attribute): attribute is t.JSXAttribute =>
            t.isJSXAttribute(attribute) && t.isJSXIdentifier(attribute.name, { name: 'hotkey' }),
        );
        const selectedMnemonic =
          nativeMnemonicNames.has(name) || (state.opts.components ?? []).includes(name);
        const selectedHotkey = /^[a-z]/.test(name) || (state.opts.components ?? []).includes(name);
        const text = directText(t, path.node.children);
        const marked = mnemonicKey(text.value);
        const hasMarker = hasMnemonicMarker(text.value);

        if (hotkey && selectedHotkey) {
          opening.attributes = attributes.filter((attribute) => attribute !== hotkey);
          const staticKeys = staticAttributeValue(t, hotkey);
          const label = hotkeyLabel(t, opening, text);
          if (staticKeys) {
            if (!parseShortcut(staticKeys))
              diagnostic(
                state,
                hotkey,
                'invalid-shortcut',
                `"${staticKeys}" is not a valid shortcut; use a key with optional modifiers, for example "mod+k"`,
              );
            if (reservedShortcuts.has(staticKeys.toLowerCase()))
              diagnostic(
                state,
                hotkey,
                'reserved-shortcut',
                `"${staticKeys}" is commonly reserved by browsers or the operating system`,
              );
            if (label === undefined)
              diagnostic(
                state,
                hotkey,
                'unnamed-binding',
                'hotkey has no static label; add visible text, aria-label, or title for generated help metadata',
              );
            record(state, hotkey, { keys: staticKeys, label, kind: 'hotkey' });
          } else {
            diagnostic(
              state,
              hotkey,
              'unnamed-binding',
              'dynamic hotkey has no static manifest entry; provide a string literal to include it in generated help metadata',
            );
          }
          if (marked) {
            path.node.children = [t.jsxText(displayText(text.value))];
            diagnostic(
              state,
              opening,
              'hotkey-overrides-mnemonic',
              'hotkey takes precedence over the mnemonic marker on this element; the marker is removed from its displayed label',
            );
          }
          const component = importedComponent(t, state.keybound!.program, state, 'Hotkey');
          wrappedElements.add(path.node);
          const wrapperAttributes = [
            t.jsxAttribute(t.jsxIdentifier('keys'), hotkey.value ?? t.stringLiteral('')),
          ];
          if (label !== undefined)
            wrapperAttributes.push(
              t.jsxAttribute(t.jsxIdentifier('label'), t.stringLiteral(label)),
            );
          path.replaceWith(wrapWithAttributes(t, component, wrapperAttributes, path.node));
          return;
        }

        if (!selectedMnemonic || !hasMarker) return;
        if (text.rich) {
          diagnostic(
            state,
            opening,
            'unsupported-rich-mnemonic',
            'mnemonic markers in rich or dynamic labels cannot be compiled; use useMnemonic for this label',
          );
          return;
        }
        if (!marked) {
          diagnostic(
            state,
            opening,
            'invalid-mnemonic',
            'mnemonic marker must be followed by a character; write && for a literal ampersand',
          );
          return;
        }
        const textAttribute = t.jsxAttribute(t.jsxIdentifier('text'), t.stringLiteral(text.value));
        record(state, opening, {
          keys: `alt+${marked}`,
          label: displayText(text.value),
          kind: 'mnemonic',
        });
        const component = importedComponent(t, state.keybound!.program, state, 'Mnemonic');
        if (canCompactChild(t, path.node.children)) {
          path.node.children = [];
          path.node.openingElement.selfClosing = true;
          path.node.closingElement = null;
        }
        const openingWrapper = t.jsxOpeningElement(
          t.jsxIdentifier(component.name),
          [textAttribute],
          false,
        );
        const closingWrapper = t.jsxClosingElement(t.jsxIdentifier(component.name));
        wrappedElements.add(path.node);
        path.replaceWith(t.jsxElement(openingWrapper, closingWrapper, [path.node], false));
      },
    },
  };
  return plugin;
}

"use strict";

// packages/react-keybound/src/compiler.ts
var import_promises = require("fs/promises");
var import_core2 = require("@babel/core");

// packages/react-keybound/src/core.ts
var modifierNames = /* @__PURE__ */ new Set(["ctrl", "control", "alt", "shift", "meta", "cmd", "command", "mod"]);
function firstGrapheme(value) {
  const Segmenter = typeof Intl !== "undefined" ? Intl.Segmenter : void 0;
  if (Segmenter) {
    const segments = new Segmenter(void 0, { granularity: "grapheme" }).segment(value);
    const iterator = segments[Symbol.iterator]();
    return iterator.next().value?.segment ?? "";
  }
  return Array.from(value)[0] ?? "";
}
function normalizeKey(value) {
  const normalized = value.normalize("NFC").toLowerCase();
  const aliases = { esc: "escape", " ": "space" };
  return aliases[normalized] ?? normalized;
}
function parseMnemonic(input) {
  let text = "";
  let key = null;
  let index = -1;
  let length = 0;
  for (let cursor = 0; cursor < input.length; ) {
    if (input[cursor] !== "&") {
      text += input[cursor];
      cursor += 1;
      continue;
    }
    if (input[cursor + 1] === "&") {
      text += "&";
      cursor += 2;
      continue;
    }
    if (key === null && cursor + 1 < input.length) {
      const grapheme = firstGrapheme(input.slice(cursor + 1));
      if (grapheme) {
        key = grapheme;
        index = text.length;
        length = grapheme.length;
        text += grapheme;
        cursor += grapheme.length + 1;
        continue;
      }
    }
    text += "&";
    cursor += 1;
  }
  return { text, key, index, length };
}
function parseShortcut(input) {
  if (typeof input !== "string" || !input.trim()) return null;
  const rawTokens = input.split("+").map((token) => token.trim().toLowerCase());
  if (!rawTokens.length || rawTokens.some((token) => !token)) return null;
  const result = {
    key: "",
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
    mod: false,
    source: input
  };
  for (let token of rawTokens) {
    if (modifierNames.has(token)) {
      if (token === "ctrl" || token === "control") {
        if (result.ctrl) return null;
        result.ctrl = true;
      } else if (token === "alt") {
        if (result.alt) return null;
        result.alt = true;
      } else if (token === "shift") {
        if (result.shift) return null;
        result.shift = true;
      } else if (token === "meta" || token === "cmd" || token === "command") {
        if (result.meta) return null;
        result.meta = true;
      } else {
        if (result.mod) return null;
        result.mod = true;
      }
      continue;
    }
    if (result.key) return null;
    if (token === "plus") token = "+";
    if (!isShortcutKey(token)) return null;
    result.key = normalizeKey(token);
  }
  return result.key ? result : null;
}
var namedKeys = /* @__PURE__ */ new Set([
  "enter",
  "escape",
  "esc",
  "tab",
  "space",
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "home",
  "end",
  "pageup",
  "pagedown",
  "backspace",
  "delete",
  "insert"
]);
function isShortcutKey(value) {
  return namedKeys.has(value) || /^f(?:[1-9]|1[0-2])$/.test(value) || Array.from(value).length === 1;
}

// packages/react-keybound/src/babel.ts
var nativeMnemonicNames = /* @__PURE__ */ new Set(["button", "a", "label", "summary"]);
var reservedShortcuts = /* @__PURE__ */ new Set([
  "ctrl+w",
  "ctrl+t",
  "ctrl+n",
  "ctrl+r",
  "meta+w",
  "meta+t",
  "meta+n",
  "meta+r",
  "alt+f4"
]);
function elementName(types, name) {
  if (types.isJSXIdentifier(name)) return name.name;
  if (types.isJSXMemberExpression(name)) {
    const object = elementName(types, name.object);
    return object && types.isJSXIdentifier(name.property) ? `${object}.${name.property.name}` : null;
  }
  return null;
}
function staticAttributeValue(types, attribute) {
  if (!attribute.value) return null;
  if (types.isStringLiteral(attribute.value)) return attribute.value.value;
  if (types.isJSXExpressionContainer(attribute.value) && types.isStringLiteral(attribute.value.expression)) {
    return attribute.value.expression.value;
  }
  if (types.isJSXExpressionContainer(attribute.value) && types.isTemplateLiteral(attribute.value.expression) && attribute.value.expression.expressions.length === 0) {
    return attribute.value.expression.quasis[0]?.value.cooked ?? attribute.value.expression.quasis[0]?.value.raw ?? null;
  }
  return null;
}
function directText(types, children) {
  let value = "";
  for (const child of children) {
    if (types.isJSXText(child)) {
      const lines = child.value.split(/\r\n|\n|\r/);
      for (let index = 0; index < lines.length; index += 1) {
        let line = lines[index].replace(/\t/g, " ");
        if (index !== 0) line = line.replace(/^ +/, "");
        if (index !== lines.length - 1) line = line.replace(/ +$/, "");
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
        value += child.expression.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw).join("");
        continue;
      }
    }
    return { value, rich: true };
  }
  return { value, rich: false };
}
function canCompactChild(types, children) {
  return children.every((child) => types.isJSXText(child));
}
function mnemonicKey(value) {
  return parseMnemonic(value).key;
}
function hasMnemonicMarker(value) {
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== "&") continue;
    if (value[index + 1] === "&") {
      index += 1;
      continue;
    }
    return true;
  }
  return false;
}
function displayText(value) {
  return parseMnemonic(value).text;
}
function diagnostic(state, node, code, message, position) {
  if (state.opts.warnings === false) return;
  const location = position ?? node.loc?.start;
  const file = state.file.opts.filename;
  const identity = `${code}:${file ?? ""}:${location?.line ?? 0}:${location?.column ?? 0}:${message}`;
  const data = state.keybound;
  if (data.diagnostics.has(identity)) return;
  data.diagnostics.add(identity);
  const item = {
    code,
    message,
    file: file ?? void 0,
    line: location?.line,
    column: location?.column
  };
  if (state.opts.onDiagnostic) state.opts.onDiagnostic(item);
  else
    console.warn(
      `[react-keybound] ${file ?? "unknown file"}${location ? `:${location.line}:${location.column}` : ""} ${message}`
    );
}
function record(state, node, metadata) {
  const location = node.loc?.start;
  const item = {
    ...metadata,
    file: state.file.opts.filename ?? void 0,
    line: location?.line,
    column: location?.column
  };
  state.keybound.metadata.push(item);
}
function importedComponent(types, programPath, state, imported) {
  const program = programPath.node;
  const cache = state.keybound.imports;
  if (cache[imported]) return cache[imported];
  for (const statement of program.body) {
    if (!types.isImportDeclaration(statement) || statement.source.value !== "react-keybound" || statement.importKind === "type")
      continue;
    for (const specifier2 of statement.specifiers) {
      if (types.isImportSpecifier(specifier2) && types.isIdentifier(specifier2.imported, { name: imported }) && specifier2.importKind !== "type") {
        return cache[imported] = types.identifier(specifier2.local.name);
      }
    }
  }
  let local = imported;
  while (programPath.scope.hasBinding(local) || programPath.scope.hasGlobal(local))
    local = `Keybound${local}`;
  const identifier = types.identifier(local);
  const target = program.body.find(
    (statement) => types.isImportDeclaration(statement) && statement.source.value === "react-keybound" && statement.importKind !== "type"
  );
  const specifier = types.importSpecifier(types.identifier(local), types.identifier(imported));
  if (target) target.specifiers.push(specifier);
  else {
    const firstNonImport = program.body.findIndex(
      (statement) => !types.isImportDeclaration(statement)
    );
    program.body.splice(
      firstNonImport < 0 ? program.body.length : firstNonImport,
      0,
      types.importDeclaration([specifier], types.stringLiteral("react-keybound"))
    );
  }
  return cache[imported] = identifier;
}
function wrapWithAttributes(types, name, attributes, element) {
  const opening = types.jsxOpeningElement(types.jsxIdentifier(name.name), attributes, false);
  const closing = types.jsxClosingElement(types.jsxIdentifier(name.name));
  return types.jsxElement(opening, closing, [element], false);
}
function hotkeyLabel(types, opening, text) {
  if (!text.rich) {
    const visible = displayText(text.value).trim();
    if (visible) return visible;
  }
  for (const name of ["aria-label", "title"]) {
    const attribute = opening.attributes.find(
      (item) => types.isJSXAttribute(item) && types.isJSXIdentifier(item.name, { name })
    );
    const value = attribute ? staticAttributeValue(types, attribute) : null;
    if (value !== null) return value;
  }
  return void 0;
}
function keyboundBabelPlugin(api) {
  const plugin = {
    name: "react-keybound",
    visitor: {
      Program: {
        enter(path, state) {
          state.keybound = {
            metadata: [],
            diagnostics: /* @__PURE__ */ new Set(),
            wrappedElements: /* @__PURE__ */ new WeakSet(),
            api,
            imports: {},
            program: path
          };
        },
        exit(path, state) {
          const metadata = state.keybound.metadata;
          const seen = /* @__PURE__ */ new Map();
          for (const item of metadata) {
            const normalized = item.keys.toLowerCase();
            const previous = seen.get(normalized);
            if (previous)
              diagnostic(
                state,
                path.node,
                "static-duplicate",
                `static duplicate "${item.keys}"; runtime scopes decide which eligible binding wins`,
                item
              );
            else seen.set(normalized, item);
          }
          state.file.metadata.keybound = metadata;
        }
      },
      JSXElement(path, state) {
        const { types: t } = state.keybound.api;
        const wrappedElements = state.keybound.wrappedElements;
        if (wrappedElements.has(path.node)) return;
        const opening = path.node.openingElement;
        const name = elementName(t, opening.name);
        if (!name) return;
        const attributes = opening.attributes;
        if (attributes.some(
          (attribute) => t.isJSXAttribute(attribute) && t.isJSXIdentifier(attribute.name, { name: "data-keybound-ignore" })
        ))
          return;
        const hotkey = attributes.find(
          (attribute) => t.isJSXAttribute(attribute) && t.isJSXIdentifier(attribute.name, { name: "hotkey" })
        );
        const selectedMnemonic = nativeMnemonicNames.has(name) || (state.opts.components ?? []).includes(name);
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
                "invalid-shortcut",
                `"${staticKeys}" is not a valid shortcut; use a key with optional modifiers, for example "mod+k"`
              );
            if (reservedShortcuts.has(staticKeys.toLowerCase()))
              diagnostic(
                state,
                hotkey,
                "reserved-shortcut",
                `"${staticKeys}" is commonly reserved by browsers or the operating system`
              );
            if (label === void 0)
              diagnostic(
                state,
                hotkey,
                "unnamed-binding",
                "hotkey has no static label; add visible text, aria-label, or title for generated help metadata"
              );
            record(state, hotkey, { keys: staticKeys, label, kind: "hotkey" });
          } else {
            diagnostic(
              state,
              hotkey,
              "unnamed-binding",
              "dynamic hotkey has no static manifest entry; provide a string literal to include it in generated help metadata"
            );
          }
          if (marked) {
            path.node.children = [t.jsxText(displayText(text.value))];
            diagnostic(
              state,
              opening,
              "hotkey-overrides-mnemonic",
              "hotkey takes precedence over the mnemonic marker on this element; the marker is removed from its displayed label"
            );
          }
          const component2 = importedComponent(t, state.keybound.program, state, "Hotkey");
          wrappedElements.add(path.node);
          const wrapperAttributes = [
            t.jsxAttribute(t.jsxIdentifier("keys"), hotkey.value ?? t.stringLiteral(""))
          ];
          if (label !== void 0)
            wrapperAttributes.push(
              t.jsxAttribute(t.jsxIdentifier("label"), t.stringLiteral(label))
            );
          path.replaceWith(wrapWithAttributes(t, component2, wrapperAttributes, path.node));
          return;
        }
        if (!selectedMnemonic || !hasMarker) return;
        if (text.rich) {
          diagnostic(
            state,
            opening,
            "unsupported-rich-mnemonic",
            "mnemonic markers in rich or dynamic labels cannot be compiled; use useMnemonic for this label"
          );
          return;
        }
        if (!marked) {
          diagnostic(
            state,
            opening,
            "invalid-mnemonic",
            "mnemonic marker must be followed by a character; write && for a literal ampersand"
          );
          return;
        }
        const textAttribute = t.jsxAttribute(t.jsxIdentifier("text"), t.stringLiteral(text.value));
        record(state, opening, {
          keys: `alt+${marked}`,
          label: displayText(text.value),
          kind: "mnemonic"
        });
        const component = importedComponent(t, state.keybound.program, state, "Mnemonic");
        if (canCompactChild(t, path.node.children)) {
          path.node.children = [];
          path.node.openingElement.selfClosing = true;
          path.node.closingElement = null;
        }
        const openingWrapper = t.jsxOpeningElement(
          t.jsxIdentifier(component.name),
          [textAttribute],
          false
        );
        const closingWrapper = t.jsxClosingElement(t.jsxIdentifier(component.name));
        wrappedElements.add(path.node);
        path.replaceWith(t.jsxElement(openingWrapper, closingWrapper, [path.node], false));
      }
    }
  };
  return plugin;
}

// packages/react-keybound/src/compiler.ts
function transformKeybound(source, options = {}) {
  const result = (0, import_core2.transformSync)(source, {
    filename: options.filename,
    sourceMaps: options.sourceMaps ?? false,
    configFile: false,
    babelrc: false,
    parserOpts: { plugins: ["jsx", "typescript"] },
    plugins: [[keyboundBabelPlugin, options]]
  });
  return {
    code: result?.code ?? source,
    map: result?.map ?? null,
    metadata: (result?.metadata ?? {}).keybound ?? []
  };
}

// packages/react-keybound/src/loader.cts
function keyboundLoader(source, inputMap) {
  this.cacheable?.();
  const run = () => transformKeybound(source, {
    ...this.getOptions?.() ?? {},
    filename: this.resourcePath,
    sourceMaps: Boolean(inputMap)
  });
  const callback = this.async?.();
  if (callback) {
    try {
      const result = run();
      callback(null, result.code, result.map ?? inputMap);
    } catch (error) {
      callback(error instanceof Error ? error : new Error(String(error)));
    }
    return;
  }
  return run().code;
}
module.exports = keyboundLoader;
//# sourceMappingURL=loader.cjs.map
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
function isApplePlatform() {
  if (typeof navigator === "undefined") return false;
  const browser = navigator;
  const platform = browser.userAgentData?.platform ?? navigator.platform ?? "";
  const userAgent = navigator.userAgent ?? "";
  return /mac|iphone|ipad|ipod/i.test(`${platform} ${userAgent}`);
}
function resolveMnemonicModifier(setting = "auto", apple = isApplePlatform()) {
  if (setting === "auto") return apple ? "mod" : "alt";
  if (typeof setting === "string") return setting;
  if (apple) return setting.mac ?? "mod";
  return setting.windows ?? setting.linux ?? setting.default ?? "alt";
}
function matchesShortcut(shortcut, event, apple = isApplePlatform()) {
  if (event.isComposing || ["Dead", "Process", "Unidentified"].includes(event.key)) return false;
  if (event.getModifierState?.("AltGraph")) return false;
  return normalizeKey(event.key) === shortcut.key && matchesShortcutModifiers(shortcut, event, apple);
}
function matchesShortcutModifiers(shortcut, event, apple = isApplePlatform()) {
  const expectedCtrl = shortcut.ctrl || shortcut.mod && !apple;
  const expectedMeta = shortcut.meta || shortcut.mod && apple;
  return event.ctrlKey === expectedCtrl && event.altKey === shortcut.alt && event.shiftKey === shortcut.shift && event.metaKey === expectedMeta;
}
function formatShortcut(shortcut, apple = isApplePlatform()) {
  const item = typeof shortcut === "string" ? parseShortcut(shortcut) : shortcut;
  if (!item) return typeof shortcut === "string" ? shortcut : "";
  const parts = [];
  if (item.ctrl || item.mod && !apple) parts.push(apple ? "\u2303" : "Ctrl");
  if (item.alt) parts.push(apple ? "\u2325" : "Alt");
  if (item.shift) parts.push(apple ? "\u21E7" : "Shift");
  if (item.meta || item.mod && apple) parts.push(apple ? "\u2318" : "Meta");
  parts.push(item.key.length === 1 ? item.key.toUpperCase() : displayKey(item.key));
  return parts.join(apple ? "" : "+");
}
function formatAriaShortcut(shortcut, apple = false) {
  const parts = [];
  if (shortcut.ctrl || shortcut.mod && !apple) parts.push("Control");
  if (shortcut.alt) parts.push("Alt");
  if (shortcut.shift) parts.push("Shift");
  if (shortcut.meta || shortcut.mod && apple) parts.push("Meta");
  parts.push(displayKey(shortcut.key));
  return parts.join("+");
}
function displayKey(key) {
  const names = {
    esc: "Esc",
    escape: "Escape",
    enter: "Enter",
    tab: "Tab",
    space: "Space",
    arrowup: "ArrowUp",
    arrowdown: "ArrowDown",
    arrowleft: "ArrowLeft",
    arrowright: "ArrowRight",
    home: "Home",
    end: "End",
    pageup: "PageUp",
    pagedown: "PageDown",
    backspace: "Backspace",
    delete: "Delete",
    insert: "Insert"
  };
  return names[key] ?? key.toUpperCase();
}
export {
  formatAriaShortcut,
  formatShortcut,
  isApplePlatform,
  matchesShortcut,
  matchesShortcutModifiers,
  normalizeKey,
  parseMnemonic,
  parseShortcut,
  resolveMnemonicModifier
};
//# sourceMappingURL=core.js.map
"use client";

// packages/react-keybound/src/adapters.ts
function radixSelectAction(element, _event) {
  element.focus();
  element.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true })
  );
}
export {
  radixSelectAction
};
//# sourceMappingURL=adapters.js.map
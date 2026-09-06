'use client';

/** Opens a Radix Select trigger through the primitive's documented keyboard path. */
export function radixSelectAction(element: HTMLElement, _event: KeyboardEvent): void {
  element.focus();
  element.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }),
  );
}

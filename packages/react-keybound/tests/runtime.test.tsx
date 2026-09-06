import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { renderToString } from 'react-dom/server';
import * as Select from '@radix-ui/react-select';
import {
  Hotkey,
  KeyboundOverlay,
  KeyboundProvider,
  KeyboundScope,
  Mnemonic,
  radixSelectAction,
  useHotkey,
} from '../src';

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(
    () =>
      [
        {
          width: 80,
          height: 24,
          top: 10,
          left: 10,
          right: 90,
          bottom: 34,
          x: 10,
          y: 10,
          toJSON() {
            return {};
          },
        },
      ] as unknown as DOMRectList,
  );
});

afterEach(() => cleanup());

function keydown(init: KeyboardEventInit): boolean {
  return fireEvent.keyDown(document, { bubbles: true, cancelable: true, ...init });
}

describe('runtime dispatch', () => {
  it('renders a clean label and activates it once', () => {
    const save = vi.fn();
    const screen = render(
      <KeyboundProvider>
        <Mnemonic text="&Save">
          <button onClick={save}>old</button>
        </Mnemonic>
      </KeyboundProvider>,
    );
    expect(screen.getByRole('button').textContent).toBe('Save');
    expect(keydown({ key: 's', altKey: true })).toBe(false);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('strictly adheres to semantic matching and does not dispatch layout-specific glyphs or dead keys', () => {
    const save = vi.fn();
    const customAction = vi.fn();
    render(
      <KeyboundProvider>
        <Mnemonic text="&Save">
          <button onClick={save}>Save</button>
        </Mnemonic>
        <Hotkey keys="alt+s" action={customAction}>
          <button>Custom</button>
        </Hotkey>
      </KeyboundProvider>,
    );
    // On macOS, Option+S produces '\u00df' with code 'KeyS'. Semantic matching must reject this.
    expect(keydown({ key: '\u00df', code: 'KeyS', altKey: true })).toBe(true);
    // Dead key accent prefix must also be rejected
    expect(keydown({ key: 'Dead', code: 'KeyS', altKey: true })).toBe(true);
    expect(save).not.toHaveBeenCalled();
    expect(customAction).not.toHaveBeenCalled();
  });

  it('does not consume hidden, disabled, closed-details, editable or composing bindings', () => {
    const run = vi.fn();
    const Command = () => {
      useHotkey('mod+k', run);
      return null;
    };
    const screen = render(
      <KeyboundProvider>
        <Command />
        <Hotkey keys="alt+h">
          <button hidden>Hidden</button>
        </Hotkey>
        <Hotkey keys="alt+d">
          <button disabled>Disabled</button>
        </Hotkey>
        <details>
          <Hotkey keys="alt+c">
            <button>Closed</button>
          </Hotkey>
        </details>
        <input aria-label="typing" />
      </KeyboundProvider>,
    );
    expect(keydown({ key: 'h', altKey: true })).toBe(true);
    expect(keydown({ key: 'd', altKey: true })).toBe(true);
    expect(keydown({ key: 'c', altKey: true })).toBe(true);
    screen.getByLabelText('typing').focus();
    expect(keydown({ key: 'k', ctrlKey: true })).toBe(true);
    expect(keydown({ key: 'k', ctrlKey: true, isComposing: true })).toBe(true);
    expect(run).not.toHaveBeenCalled();
  });

  it('lets an active empty modal scope block background commands', () => {
    const run = vi.fn();
    const Command = () => {
      useHotkey('ctrl+j', run);
      return null;
    };
    render(
      <KeyboundProvider>
        <Command />
        <KeyboundScope modal active>
          <div />
        </KeyboundScope>
      </KeyboundProvider>,
    );
    expect(keydown({ key: 'j', ctrlKey: true })).toBe(true);
    expect(run).not.toHaveBeenCalled();
  });

  it('keeps modal scope priority through a React portal', () => {
    const background = vi.fn();
    const modal = vi.fn();
    const portal = document.createElement('div');
    document.body.append(portal);
    render(
      <KeyboundProvider>
        <Hotkey keys="alt+p">
          <button onClick={background}>Background</button>
        </Hotkey>
        {createPortal(
          <KeyboundScope modal>
            <Hotkey keys="alt+p">
              <button onClick={modal}>Modal</button>
            </Hotkey>
          </KeyboundScope>,
          portal,
        )}
      </KeyboundProvider>,
    );
    expect(keydown({ key: 'p', altKey: true })).toBe(false);
    expect(modal).toHaveBeenCalledTimes(1);
    expect(background).not.toHaveBeenCalled();
    portal.remove();
  });

  it('preserves the child handler when a Hotkey wraps a native control', () => {
    const click = vi.fn();
    render(
      <KeyboundProvider>
        <Hotkey keys="alt+x">
          <button onClick={click}>Close</button>
        </Hotkey>
      </KeyboundProvider>,
    );
    expect(keydown({ key: 'x', altKey: true })).toBe(false);
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('clicks checkbox and radio inputs before the generic input focus action', () => {
    const change = vi.fn();
    const screen = render(
      <KeyboundProvider>
        <Hotkey keys="alt+c">
          <input type="checkbox" onChange={change} />
        </Hotkey>
      </KeyboundProvider>,
    );
    expect(keydown({ key: 'c', altKey: true })).toBe(false);
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
    expect(change).toHaveBeenCalledTimes(1);
  });

  it('opens an installed Radix Select through its keyboard adapter', () => {
    const onOpenChange = vi.fn();
    render(
      <KeyboundProvider>
        <Select.Root onOpenChange={onOpenChange}>
          <Hotkey keys="alt+s" action={radixSelectAction}>
            <Select.Trigger aria-label="Choose status">
              <Select.Value placeholder="Choose" />
            </Select.Trigger>
          </Hotkey>
        </Select.Root>
      </KeyboundProvider>,
    );
    expect(keydown({ key: 's', altKey: true })).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('uses committed callback and option changes', () => {
    const first = vi.fn();
    const second = vi.fn();
    const Command = ({ enabled, run }: { enabled: boolean; run: () => void }) => {
      useHotkey('alt+l', run, { enabled });
      return null;
    };
    const screen = render(
      <KeyboundProvider>
        <Command enabled run={first} />
      </KeyboundProvider>,
    );
    screen.rerender(
      <KeyboundProvider>
        <Command enabled run={second} />
      </KeyboundProvider>,
    );
    expect(keydown({ key: 'l', altKey: true })).toBe(false);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    screen.rerender(
      <KeyboundProvider enabled={false}>
        <Command enabled run={second} />
      </KeyboundProvider>,
    );
    expect(keydown({ key: 'l', altKey: true })).toBe(true);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('ignores repeats, extra modifiers, AltGr and cancelled events by default', () => {
    const run = vi.fn();
    const Command = () => {
      useHotkey('ctrl+r', run);
      useHotkey('ctrl+alt+g', run);
      return null;
    };
    render(
      <KeyboundProvider>
        <Command />
      </KeyboundProvider>,
    );
    keydown({ key: 'r', ctrlKey: true, repeat: true });
    keydown({ key: 'r', ctrlKey: true, shiftKey: true });
    const altGraph = new KeyboardEvent('keydown', {
      key: 'g',
      ctrlKey: true,
      altKey: true,
      bubbles: true,
      cancelable: true,
    });
    vi.spyOn(altGraph, 'getModifierState').mockReturnValue(true);
    document.dispatchEvent(altGraph);
    const cancelled = new KeyboardEvent('keydown', {
      key: 'r',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    cancelled.preventDefault();
    document.dispatchEvent(cancelled);
    expect(run).not.toHaveBeenCalled();
  });

  it('emits structured development warnings and honors suppression', () => {
    const onWarning = vi.fn();
    const Invalid = () => {
      useHotkey('ctrl+wat', vi.fn(), { label: 'Broken' });
      return null;
    };
    const screen = render(
      <KeyboundProvider onWarning={onWarning}>
        <Invalid />
      </KeyboundProvider>,
    );
    expect(onWarning).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'invalid-shortcut', label: 'Broken' }),
    );
    screen.unmount();
    onWarning.mockClear();
    render(
      <KeyboundProvider warnings={false} onWarning={onWarning}>
        <Invalid />
      </KeyboundProvider>,
    );
    expect(onWarning).not.toHaveBeenCalled();
  });

  it('does not let an inactive modal ancestor block background commands', () => {
    const run = vi.fn();
    const Command = () => {
      useHotkey('ctrl+n', run);
      return null;
    };
    render(
      <KeyboundProvider>
        <Command />
        <KeyboundScope active={false} modal>
          <KeyboundScope active modal>
            <div />
          </KeyboundScope>
        </KeyboundScope>
      </KeyboundProvider>,
    );
    expect(keydown({ key: 'n', ctrlKey: true })).toBe(false);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('guards editable descendants from shortcut dispatch', () => {
    const run = vi.fn();
    const Command = () => {
      useHotkey('ctrl+e', run);
      return null;
    };
    const screen = render(
      <KeyboundProvider>
        <Command />
        <div contentEditable suppressContentEditableWarning>
          <span>text</span>
        </div>
      </KeyboundProvider>,
    );
    const span = screen.getByText('text');
    fireEvent.keyDown(span, { key: 'e', ctrlKey: true });
    expect(run).not.toHaveBeenCalled();
  });

  it('stays single-dispatch under Strict Mode and composes child refs', () => {
    const click = vi.fn();
    const childRef = vi.fn();
    const screen = render(
      <React.StrictMode>
        <KeyboundProvider>
          <Hotkey keys="alt+r">
            <button ref={childRef} onClick={click}>
              Run
            </button>
          </Hotkey>
        </KeyboundProvider>
      </React.StrictMode>,
    );
    expect(childRef).toHaveBeenLastCalledWith(expect.any(HTMLButtonElement));
    expect(keydown({ key: 'r', altKey: true })).toBe(false);
    expect(click).toHaveBeenCalledTimes(1);
    screen.unmount();
    expect(childRef).toHaveBeenLastCalledWith(null);
  });

  it('filters inert and aria-hidden ancestors', () => {
    const inertClick = vi.fn();
    const ariaClick = vi.fn();
    const screen = render(
      <KeyboundProvider>
        <div data-testid="inert-parent">
          <Hotkey keys="alt+i">
            <button onClick={inertClick}>Inert</button>
          </Hotkey>
        </div>
        <div aria-hidden="true">
          <Hotkey keys="alt+a">
            <button onClick={ariaClick}>Hidden</button>
          </Hotkey>
        </div>
      </KeyboundProvider>,
    );
    screen.getByTestId('inert-parent').setAttribute('inert', '');
    expect(keydown({ key: 'i', altKey: true })).toBe(true);
    expect(keydown({ key: 'a', altKey: true })).toBe(true);
    expect(inertClick).not.toHaveBeenCalled();
    expect(ariaClick).not.toHaveBeenCalled();
  });

  it('renders a customizable overlay for positioned eligible targets', () => {
    let nextFrame: FrameRequestCallback | undefined;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      nextFrame = callback;
      return 1;
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 80,
      height: 24,
      top: 10,
      left: 12,
      right: 92,
      bottom: 34,
      x: 12,
      y: 10,
      toJSON: () => ({}),
    });
    const screen = render(
      <KeyboundProvider>
        <Hotkey keys="mod+s" label="Save">
          <button>Save</button>
        </Hotkey>
        <KeyboundOverlay
          open
          className="custom-overlay"
          style={{ zIndex: 42 }}
          renderHint={({ label }) => <em>{label}</em>}
        />
      </KeyboundProvider>,
    );
    act(() => nextFrame?.(0));
    const hint = screen.getByText('Save', { selector: 'em' });
    const overlay = hint.closest('[aria-hidden="true"]') as HTMLElement;
    expect(overlay.className).toBe('custom-overlay');
    expect(overlay.style.zIndex).toBe('42');
  });

  it('server-renders labels without rendering or measuring the overlay', () => {
    const markup = renderToString(
      <KeyboundProvider>
        <Mnemonic text="&Save">
          <button />
        </Mnemonic>
        <KeyboundOverlay open />
      </KeyboundProvider>,
    );
    expect(markup).toContain('>S</span>ave');
    expect(markup).not.toContain('data-keybound-overlay-hint');
  });

  it('keeps middle-letter mnemonics and containing words intact as unified elements', () => {
    const screen = render(
      <KeyboundProvider>
        <Mnemonic text="E&xport document">
          <button>old</button>
        </Mnemonic>
      </KeyboundProvider>,
    );
    const button = screen.getByRole('button');
    expect(button.textContent).toBe('Export document');
    const word = button.querySelector('[data-keybound-word]');
    expect(word).not.toBeNull();
    expect(word?.textContent).toBe('Export');
    const mnemonic = word?.querySelector('[data-keybound-mnemonic]');
    expect(mnemonic?.textContent).toBe('x');
    expect(keydown({ key: 'x', altKey: true })).toBe(false);
  });
});

import { transformSync } from '@babel/core';
import keyboundBabelPlugin from '../src/babel';
import { extractManifest, transformKeybound } from '../src/compiler';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function compile(source: string, options: Record<string, unknown> = {}) {
  return transformSync(source, {
    filename: '/app/example.tsx',
    configFile: false,
    babelrc: false,
    parserOpts: { plugins: ['jsx', 'typescript'] },
    plugins: [[keyboundBabelPlugin, { warnings: false, ...options }]],
  })!;
}

function metadata(result: ReturnType<typeof compile>) {
  return (result.metadata as unknown as Record<string, unknown>).keybound;
}

describe('Keybound JSX compiler', () => {
  it('wraps plain native mnemonic text and preserves ordinary element props', () => {
    const result = compile('const view = <button ref={saveRef} onClick={save}>&Save</button>;');

    expect(result.code).toContain('import { Mnemonic } from "react-keybound";');
    expect(result.code).toContain(
      '<Mnemonic text="&Save"><button ref={saveRef} onClick={save} /></Mnemonic>',
    );
    expect(metadata(result)).toEqual([
      expect.objectContaining({
        kind: 'mnemonic',
        keys: 'alt+S',
        label: 'Save',
        file: expect.stringMatching(/example\.tsx$/),
        line: 1,
      }),
    ]);
  });

  it('keeps escaped ampersands, handles Unicode, and accepts static expression text', () => {
    const escaped = compile('const view = <button>&& &é</button>;');
    const expression = compile('const view = <a>{"&Ångström"}</a>;');

    expect(escaped.code).toContain('text="&& &\\xE9"');
    expect(metadata(escaped)).toEqual([expect.objectContaining({ keys: 'alt+é', label: '& é' })]);
    expect(expression.code).toContain('text="&\\xC5ngstr\\xF6m"');
    expect(metadata(expression)).toEqual([expect.objectContaining({ keys: 'alt+Å' })]);
  });

  it('turns hotkey into a single Hotkey binding and removes the annotation prop', () => {
    const result = compile('const view = <input hotkey="mod+k" aria-label="Search" />;');

    expect(result.code).toContain('import { Hotkey } from "react-keybound";');
    expect(result.code).toContain(
      '<Hotkey keys="mod+k" label="Search"><input aria-label="Search" /></Hotkey>',
    );
    expect(result.code).not.toContain('hotkey=');
    expect(metadata(result)).toEqual([
      expect.objectContaining({ kind: 'hotkey', keys: 'mod+k', label: 'Search' }),
    ]);
  });

  it('prefers visible hotkey text, then aria-label, then title', () => {
    const visible = compile('<button hotkey="mod+s" aria-label="Aria" title="Title">Save</button>');
    const titled = compile('<input hotkey="mod+k" title="Search" />');

    expect(visible.code).toContain(
      '<Hotkey keys="mod+s" label="Save"><button aria-label="Aria" title="Title">Save</button></Hotkey>',
    );
    expect(titled.code).toContain(
      '<Hotkey keys="mod+k" label="Search"><input title="Search" /></Hotkey>',
    );
  });

  it('lets explicit hotkey win over marker sugar without double binding', () => {
    const result = compile('const view = <button hotkey="mod+s">&Save</button>;');

    expect(result.code).toContain(
      '<Hotkey keys="mod+s" label="Save"><button>Save</button></Hotkey>',
    );
    expect(result.code).not.toContain('Mnemonic');
  });

  it('supports configured component names and leaves ignored and rich labels alone', () => {
    const diagnostics: Array<{ code: string }> = [];
    const result = compile(
      'const view = <><Button>&Open</Button><button data-keybound-ignore>&Skip</button><button>&Sa<strong>ve</strong></button></>;',
      {
        components: ['Button'],
        warnings: true,
        onDiagnostic: (diagnostic: { code: string }) => diagnostics.push(diagnostic),
      },
    );

    expect(result.code).toContain('<Mnemonic text="&Open"><Button /></Mnemonic>');
    expect(result.code).toContain('<button data-keybound-ignore>&Skip</button>');
    expect(result.code).toContain('&Sa<strong>ve</strong>');
    expect(diagnostics).toContainEqual(
      expect.objectContaining({ code: 'unsupported-rich-mnemonic' }),
    );
  });

  it('reports nonblocking static shortcut diagnostics and builds a supplied-file manifest', async () => {
    const diagnostics: Array<{ code: string }> = [];
    compile(
      'const view = <><button hotkey="ctrl+w">Close</button><button hotkey="ctrl+w">Again</button></>;',
      {
        warnings: true,
        onDiagnostic: (diagnostic: { code: string }) => diagnostics.push(diagnostic),
      },
    );
    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'reserved-shortcut' }),
        expect.objectContaining({ code: 'static-duplicate' }),
      ]),
    );

    const directory = await mkdtemp(join(tmpdir(), 'keybound-'));
    const file = join(directory, 'actions.tsx');
    await writeFile(file, 'export const Action = () => <button hotkey="mod+k">Search</button>;');
    await expect(extractManifest([file], { warnings: false })).resolves.toEqual([
      expect.objectContaining({ kind: 'hotkey', keys: 'mod+k', file }),
    ]);
  });

  it('exposes a framework-neutral transform helper', () => {
    const result = transformKeybound('export const Save = () => <button>&Save</button>', {
      filename: 'save.tsx',
      warnings: false,
    });
    expect(result.code).toContain('Mnemonic');
    expect(result.metadata).toEqual([
      expect.objectContaining({ file: expect.stringMatching(/save\.tsx$/), keys: 'alt+S' }),
    ]);
  });

  it("uses JSX's whitespace semantics for multiline labels", () => {
    const result = compile(`const view = <button>
      &Save
    </button>;`);

    expect(result.code).toContain('<Mnemonic text="&Save"><button /></Mnemonic>');
  });

  it('preserves dynamic hotkey expressions and diagnoses malformed static shortcuts', () => {
    const dynamic = compile('const key = getKey(); const view = <input hotkey={key} />;');
    expect(dynamic.code).toContain('<Hotkey keys={key}><input /></Hotkey>');
    expect(metadata(dynamic)).toEqual([]);

    const diagnostics: Array<{ code: string }> = [];
    compile('const view = <input hotkey="ctrl+wat" />;', {
      warnings: true,
      onDiagnostic: (diagnostic: { code: string }) => diagnostics.push(diagnostic),
    });
    expect(diagnostics).toContainEqual(expect.objectContaining({ code: 'invalid-shortcut' }));
  });

  it('keeps client directives before compiler-added imports', () => {
    const result = compile('"use client"; const view = <button>&Save</button>;');

    const code = result.code ?? '';
    expect(code.indexOf('"use client";')).toBeLessThan(code.indexOf('import { Mnemonic }'));
  });
});

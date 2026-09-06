import { readFile } from 'node:fs/promises';
import { transformSync } from '@babel/core';
import keyboundBabelPlugin, { type KeyboundBabelOptions, type KeyboundMetadata } from './babel';

export { keyboundBabelPlugin };
export type {
  KeyboundBabelOptions,
  KeyboundDiagnostic,
  KeyboundDiagnosticCode,
  KeyboundMetadata,
} from './babel';

export interface TransformKeyboundOptions extends KeyboundBabelOptions {
  filename?: string;
  sourceMaps?: boolean;
}

export interface TransformKeyboundResult {
  code: string;
  map: unknown;
  metadata: KeyboundMetadata[];
}

export function transformKeybound(
  source: string,
  options: TransformKeyboundOptions = {},
): TransformKeyboundResult {
  const result = transformSync(source, {
    filename: options.filename,
    sourceMaps: options.sourceMaps ?? false,
    configFile: false,
    babelrc: false,
    parserOpts: { plugins: ['jsx', 'typescript'] },
    plugins: [[keyboundBabelPlugin, options]],
  });
  return {
    code: result?.code ?? source,
    map: result?.map ?? null,
    metadata:
      (((result?.metadata ?? {}) as Record<string, unknown>).keybound as
        KeyboundMetadata[] | undefined) ?? [],
  };
}

export async function extractManifest(
  files: Iterable<string>,
  options: KeyboundBabelOptions = {},
): Promise<KeyboundMetadata[]> {
  const records: KeyboundMetadata[] = [];
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    records.push(...transformKeybound(source, { ...options, filename: file }).metadata);
  }
  return records;
}

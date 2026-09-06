import type { Plugin } from 'vite';
import { transformKeybound, type TransformKeyboundOptions } from './compiler';

export interface KeyboundViteOptions extends TransformKeyboundOptions {
  manifest?: boolean | string;
}

export default function keybound(options: KeyboundViteOptions = {}): Plugin {
  const metadata = new Map<string, unknown[]>();
  const isSource = (filename: string): boolean =>
    /\.[cm]?[jt]sx$/i.test(filename) &&
    !filename.includes('\0') &&
    !/(?:^|[\\/])node_modules(?:[\\/]|$)/.test(filename);
  return {
    name: 'react-keybound',
    enforce: 'pre',
    buildStart() {
      metadata.clear();
    },
    transform(code, id) {
      const filename = id.split('?', 1)[0];
      if (!isSource(filename)) return null;
      const result = transformKeybound(code, { ...options, filename, sourceMaps: true });
      metadata.set(filename, result.metadata);
      return { code: result.code, map: result.map as never };
    },
    watchChange(id, change) {
      if (change.event === 'delete') metadata.delete(id.split('?', 1)[0]);
    },
    generateBundle() {
      if (!options.manifest) return;
      this.emitFile({
        type: 'asset',
        fileName:
          typeof options.manifest === 'string' ? options.manifest : 'keybound-manifest.json',
        source: JSON.stringify([...metadata.values()].flat(), null, 2),
      });
    },
  };
}

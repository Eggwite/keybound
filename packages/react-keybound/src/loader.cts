import { transformKeybound, type TransformKeyboundOptions } from './compiler';

interface LoaderContext {
  resourcePath: string;
  getOptions?: () => TransformKeyboundOptions;
  cacheable?: (cacheable?: boolean) => void;
  async?: () => ((error: Error | null, code?: string, map?: unknown) => void) | undefined;
}

function keyboundLoader(this: LoaderContext, source: string, inputMap?: unknown): string | void {
  this.cacheable?.();
  const run = () =>
    transformKeybound(source, {
      ...(this.getOptions?.() ?? {}),
      filename: this.resourcePath,
      sourceMaps: Boolean(inputMap),
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

// Webpack and Turbopack call loader modules through their CommonJS export.
module.exports = keyboundLoader;

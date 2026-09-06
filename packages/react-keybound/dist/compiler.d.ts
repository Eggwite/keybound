import { KeyboundBabelOptions, KeyboundMetadata } from './babel.js';
export { KeyboundDiagnostic, KeyboundDiagnosticCode, default as keyboundBabelPlugin } from './babel.js';
import '@babel/core';

interface TransformKeyboundOptions extends KeyboundBabelOptions {
    filename?: string;
    sourceMaps?: boolean;
}
interface TransformKeyboundResult {
    code: string;
    map: unknown;
    metadata: KeyboundMetadata[];
}
declare function transformKeybound(source: string, options?: TransformKeyboundOptions): TransformKeyboundResult;
declare function extractManifest(files: Iterable<string>, options?: KeyboundBabelOptions): Promise<KeyboundMetadata[]>;

export { KeyboundBabelOptions, KeyboundMetadata, type TransformKeyboundOptions, type TransformKeyboundResult, extractManifest, transformKeybound };

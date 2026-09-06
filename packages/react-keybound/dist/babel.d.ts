import * as _babel_core from '@babel/core';
import { PluginObj } from '@babel/core';

type KeyboundDiagnosticCode = 'invalid-shortcut' | 'invalid-mnemonic' | 'static-duplicate' | 'reserved-shortcut' | 'unsupported-rich-mnemonic' | 'unnamed-binding' | 'hotkey-overrides-mnemonic';
interface KeyboundDiagnostic {
    code: KeyboundDiagnosticCode;
    message: string;
    file?: string;
    line?: number;
    column?: number;
}
interface KeyboundMetadata {
    keys: string;
    label?: string;
    file?: string;
    line?: number;
    column?: number;
    kind: 'mnemonic' | 'hotkey';
}
interface KeyboundBabelOptions {
    components?: string[];
    warnings?: boolean;
    onDiagnostic?: (diagnostic: KeyboundDiagnostic) => void;
}
type BabelTypes = (typeof _babel_core)['types'];
type BabelPluginApi = {
    types: BabelTypes;
};
declare function keyboundBabelPlugin(api: BabelPluginApi): PluginObj;

export { type KeyboundBabelOptions, type KeyboundDiagnostic, type KeyboundDiagnosticCode, type KeyboundMetadata, keyboundBabelPlugin as default };

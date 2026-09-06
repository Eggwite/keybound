import { Plugin } from 'vite';
import { TransformKeyboundOptions } from './compiler.js';
import './babel.js';
import '@babel/core';

interface KeyboundViteOptions extends TransformKeyboundOptions {
    manifest?: boolean | string;
}
declare function keybound(options?: KeyboundViteOptions): Plugin;

export { type KeyboundViteOptions, keybound as default };

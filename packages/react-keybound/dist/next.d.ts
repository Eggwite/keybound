import { TransformKeyboundOptions } from './compiler.js';
import './babel.js';
import '@babel/core';

type WebpackConfig = {
    module?: {
        rules?: unknown[];
    };
    [key: string]: unknown;
};
type TurbopackLoader = string | {
    loader: string;
    options?: Record<string, unknown>;
};
type TurbopackRule = {
    loaders?: TurbopackLoader[];
    as?: string;
    condition?: unknown;
    [key: string]: unknown;
};
type TurbopackRuleCollection = TurbopackRule | TurbopackLoader | Array<TurbopackRule | TurbopackLoader>;
type NextConfig = Record<string, unknown> & {
    webpack?: (config: WebpackConfig, context: unknown) => WebpackConfig | void;
    turbopack?: {
        rules?: Record<string, TurbopackRuleCollection>;
        [key: string]: unknown;
    };
};
declare function withKeybound(nextConfig?: NextConfig, options?: TransformKeyboundOptions): NextConfig;

export { withKeybound };

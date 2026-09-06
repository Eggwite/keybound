import type { TransformKeyboundOptions } from './compiler';

type WebpackConfig = {
  module?: { rules?: unknown[] };
  [key: string]: unknown;
};

type TurbopackLoader = string | { loader: string; options?: Record<string, unknown> };

type TurbopackRule = {
  loaders?: TurbopackLoader[];
  as?: string;
  condition?: unknown;
  [key: string]: unknown;
};

type TurbopackRuleCollection =
  TurbopackRule | TurbopackLoader | Array<TurbopackRule | TurbopackLoader>;

type NextConfig = Record<string, unknown> & {
  webpack?: (config: WebpackConfig, context: unknown) => WebpackConfig | void;
  turbopack?: { rules?: Record<string, TurbopackRuleCollection>; [key: string]: unknown };
};

const extensions = ['*.js', '*.jsx', '*.ts', '*.tsx', '*.mjs', '*.cjs'];

function addTurbopackLoader(
  existing: TurbopackRuleCollection | undefined,
  options: TransformKeyboundOptions,
): TurbopackRuleCollection {
  const loader = { loader: 'react-keybound/loader', options: { ...options } };
  // Keep the source extension so Turbopack's built-in JSX/TypeScript compiler can
  // parse the loader output. `as: "*.js"` is for asset loaders and turns foo.js
  // into foo.js.js when applied to source files.
  const keyboundRule: TurbopackRule = { loaders: [loader], condition: { not: 'foreign' } };
  if (Array.isArray(existing)) return [keyboundRule, ...existing];
  return existing ? [keyboundRule, existing] : keyboundRule;
}

export function withKeybound(
  nextConfig: NextConfig = {},
  options: TransformKeyboundOptions = {},
): NextConfig {
  const userWebpack = nextConfig.webpack;
  const userTurbopack = nextConfig.turbopack;
  const userRules = userTurbopack?.rules ?? {};
  const keyboundRules = Object.fromEntries(
    extensions.map((extension) => [extension, addTurbopackLoader(userRules[extension], options)]),
  );
  return {
    ...nextConfig,
    webpack(config, context) {
      const resolved = userWebpack?.(config, context) ?? config;
      resolved.module ??= {};
      resolved.module.rules ??= [];
      resolved.module.rules.unshift({
        test: /\.[cm]?[jt]sx?$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: [{ loader: 'react-keybound/loader', options }],
      });
      return resolved;
    },
    turbopack: {
      ...userTurbopack,
      rules: { ...userRules, ...keyboundRules },
    },
  };
}

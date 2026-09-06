// packages/react-keybound/src/next.ts
var extensions = ["*.js", "*.jsx", "*.ts", "*.tsx", "*.mjs", "*.cjs"];
function addTurbopackLoader(existing, options) {
  const loader = { loader: "react-keybound/loader", options: { ...options } };
  const keyboundRule = { loaders: [loader], condition: { not: "foreign" } };
  if (Array.isArray(existing)) return [keyboundRule, ...existing];
  return existing ? [keyboundRule, existing] : keyboundRule;
}
function withKeybound(nextConfig = {}, options = {}) {
  const userWebpack = nextConfig.webpack;
  const userTurbopack = nextConfig.turbopack;
  const userRules = userTurbopack?.rules ?? {};
  const keyboundRules = Object.fromEntries(
    extensions.map((extension) => [extension, addTurbopackLoader(userRules[extension], options)])
  );
  return {
    ...nextConfig,
    webpack(config, context) {
      const resolved = userWebpack?.(config, context) ?? config;
      resolved.module ??= {};
      resolved.module.rules ??= [];
      resolved.module.rules.unshift({
        test: /\.[cm]?[jt]sx?$/,
        enforce: "pre",
        exclude: /node_modules/,
        use: [{ loader: "react-keybound/loader", options }]
      });
      return resolved;
    },
    turbopack: {
      ...userTurbopack,
      rules: { ...userRules, ...keyboundRules }
    }
  };
}
export {
  withKeybound
};
//# sourceMappingURL=next.js.map
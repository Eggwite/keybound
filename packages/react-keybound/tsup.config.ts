import { defineConfig } from 'tsup';
import { copyFile, mkdir } from 'node:fs/promises';

const outDir = 'packages/react-keybound/dist';
const shared = {
  outDir,
  format: ['esm'] as ['esm'],
  target: 'es2022',
  sourcemap: true,
  dts: true,
  splitting: false,
  treeshake: false,
  external: ['react', 'react-dom', 'react/jsx-runtime', '@babel/core', 'vite', 'next'],
};

export default defineConfig([
  {
    ...shared,
    entry: { index: 'packages/react-keybound/src/index.ts' },
    banner: { js: '"use client";' },
    onSuccess: async () => {
      await mkdir(outDir, { recursive: true });
      await Promise.all([
        copyFile('packages/react-keybound/src/styles.css', `${outDir}/styles.css`),
        copyFile('packages/react-keybound/src/jsx.d.ts', `${outDir}/jsx.d.ts`),
      ]);
    },
  },
  {
    ...shared,
    entry: Object.fromEntries(
      ['core', 'adapters', 'babel', 'compiler', 'vite', 'next'].map((name) => [
        name,
        `packages/react-keybound/src/${name}.ts`,
      ]),
    ),
  },
  {
    ...shared,
    dts: false,
    format: ['cjs'],
    entry: { loader: 'packages/react-keybound/src/loader.cts' },
  },
]);

import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile, mkdir, rename } from 'node:fs/promises';
import { gzipSync, gunzipSync } from 'node:zlib';
import { join, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const root = process.cwd();
const packageDirectory = join(root, 'packages', 'react-keybound');
const distDirectory = join(packageDirectory, 'dist');
const npmCli = process.env.npm_execpath;
const requiredDistFiles = [
  'index.js',
  'index.d.ts',
  'core.js',
  'core.d.ts',
  'babel.js',
  'babel.d.ts',
  'compiler.js',
  'compiler.d.ts',
  'vite.js',
  'vite.d.ts',
  'next.js',
  'next.d.ts',
  'loader.cjs',
  'jsx.d.ts',
  'adapters.js',
  'adapters.d.ts',
  'styles.css',
];

function run(command, arguments_, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, arguments_, {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options,
    });
    let output = '';
    child.stdout.on('data', (chunk) => {
      output += chunk;
    });
    child.stderr.on('data', (chunk) => {
      output += chunk;
    });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0
        ? resolvePromise(output)
        : reject(new Error(`${command} ${arguments_.join(' ')} failed:\n${output}`)),
    );
  });
}

function unpackTarball(buffer, directory) {
  const archive = gunzipSync(buffer);
  const files = [];
  for (let offset = 0; offset + 512 <= archive.length;) {
    const header = archive.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const name = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '');
    const sizeText = header.subarray(124, 136).toString('utf8').replace(/\0.*$/, '').trim();
    const size = Number.parseInt(sizeText || '0', 8);
    const type = String.fromCharCode(header[156] || 48);
    if (!name.startsWith('package/') || name.includes('..'))
      throw new Error(`unsafe path in packed tarball: ${name}`);
    const destination = resolve(directory, name);
    if (!destination.startsWith(`${resolve(directory)}${sep}`))
      throw new Error(`tarball entry escapes destination: ${name}`);
    files.push(name);
    if (type !== '5') {
      const content = archive.subarray(offset + 512, offset + 512 + size);
      files.push({ destination, content });
    }
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  return files;
}

async function extractTarball(buffer, directory) {
  const entries = unpackTarball(buffer, directory);
  const names = [];
  for (const entry of entries) {
    if (typeof entry === 'string') {
      names.push(entry);
      continue;
    }
    await mkdir(resolve(entry.destination, '..'), { recursive: true });
    await writeFile(entry.destination, entry.content);
  }
  return names;
}

for (const file of requiredDistFiles) {
  await readFile(join(distDirectory, file)).catch(() => {
    throw new Error(`missing package output: dist/${file}; run npm run build:package first`);
  });
}

const clientEntry = await readFile(join(distDirectory, 'index.js'), 'utf8');
if (!clientEntry.startsWith('"use client";'))
  throw new Error('dist/index.js must preserve the use client directive');
if (
  !/from ["']react["']/.test(clientEntry) ||
  /react\.(?:production|development)/.test(clientEntry)
) {
  throw new Error('dist/index.js must externalize React instead of bundling it');
}
const runtimeBudget = 8 * 1024;
const gzipBytes = gzipSync(clientEntry).byteLength;
if (gzipBytes > runtimeBudget)
  throw new Error(`runtime entry is ${gzipBytes} gzip bytes; the budget is ${runtimeBudget}`);
console.log(`runtime entry: ${gzipBytes} gzip bytes (budget: ${runtimeBudget} bytes)`);
const runtime = await import(
  `${pathToFileURL(join(distDirectory, 'index.js')).href}?export-smoke=1`
);
for (const name of [
  'KeyboundProvider',
  'Mnemonic',
  'Hotkey',
  'KeyboundScope',
  'KeyboundOverlay',
  'KeyboundHelp',
  'useMnemonic',
  'useHotkey',
]) {
  if (!(name in runtime)) throw new Error(`runtime entry is missing ${name}`);
}
const require = createRequire(import.meta.url);
if (typeof require(join(distDirectory, 'loader.cjs')) !== 'function')
  throw new Error('loader.cjs must export a callable loader');

await run(process.execPath, [
  join(root, 'node_modules', 'publint', 'src', 'cli.js'),
  packageDirectory,
]);
if (!npmCli) throw new Error('check-package must run through npm so npm_execpath is available');

const temporary = await mkdtemp(join(root, '.package-check-'));
try {
  const result = await run(
    process.execPath,
    [npmCli, 'pack', '--json', '--pack-destination', temporary],
    { cwd: packageDirectory },
  );
  const [{ filename }] = JSON.parse(result);
  const tarball = join(temporary, filename);
  const names = await extractTarball(await readFile(tarball), temporary);
  for (const file of [
    'package/package.json',
    'package/README.md',
    'package/LICENSE',
    ...requiredDistFiles.map((file) => `package/dist/${file}`),
  ]) {
    if (!names.includes(file)) throw new Error(`npm tarball is missing ${file}`);
  }

  const installedPackage = join(temporary, 'node_modules', 'react-keybound');
  await mkdir(join(temporary, 'node_modules'), { recursive: true });
  await rename(join(temporary, 'package'), installedPackage);
  const core = await import(
    `${pathToFileURL(join(installedPackage, 'dist', 'core.js')).href}?package-smoke=1`
  );
  if (core.parseMnemonic('&Save').text !== 'Save')
    throw new Error('packed core import smoke test failed');
  const smokeFile = join(temporary, 'smoke.tsx');
  await writeFile(
    smokeFile,
    'import { KeyboundProvider, useMnemonic } from "react-keybound";\nimport { parseMnemonic } from "react-keybound/core";\nimport type {} from "react-keybound/jsx";\nconst mnemonic: string = parseMnemonic("&Save").text;\nfunction View() { const binding = useMnemonic<HTMLButtonElement>("&Save"); return <KeyboundProvider><button hotkey="mod+s" {...binding.triggerProps}>{binding.label}</button></KeyboundProvider>; }\nvoid mnemonic; void View;\n',
  );
  await run(process.execPath, [
    join(root, 'node_modules', 'typescript', 'bin', 'tsc'),
    '--noEmit',
    '--strict',
    '--skipLibCheck',
    '--module',
    'NodeNext',
    '--moduleResolution',
    'NodeNext',
    '--jsx',
    'react-jsx',
    smokeFile,
  ]);
  console.log('packed tarball import/typecheck smoke passed');
} finally {
  await rm(temporary, { recursive: true, force: true });
}

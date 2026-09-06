import { spawn } from 'node:child_process';
import { npm } from './run.mjs';

await npm(['run', 'build:package']);
const children = [
  spawn(process.execPath, [process.env.npm_execpath, 'run', 'build:package', '--', '--watch'], {
    stdio: 'inherit',
  }),
  spawn(
    process.execPath,
    [process.env.npm_execpath, 'run', 'dev', '--workspace', '@keybound/web'],
    { stdio: 'inherit' },
  ),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
}
for (const child of children) {
  child.on('error', (error) => {
    console.error(error);
    stop(1);
  });
  child.on('exit', (code) => stop(code ?? 0));
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());

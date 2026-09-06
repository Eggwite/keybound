import { spawn } from 'node:child_process';
export function run(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.on('error', reject);
    child.on('exit', (code, signal) =>
      code === 0 ? resolve() : reject(new Error(`${command} exited ${code ?? signal}`)),
    );
  });
}
export function npm(args, options) {
  const cli = process.env.npm_execpath;
  if (!cli) throw new Error('Run this script with npm run so npm_execpath is available.');
  return run(process.execPath, [cli, ...args], options);
}

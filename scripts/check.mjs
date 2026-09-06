import { npm } from './run.mjs';
for (const script of ['lint', 'typecheck', 'test', 'build', 'check:package']) {
  await npm(['run', script]);
}

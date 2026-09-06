import { npm } from './run.mjs';
await npm(['run', 'build:package']);
await npm(['run', 'build', '--workspace', '@keybound/web']);
await npm(['run', 'build', '--workspace', '@keybound/vite-fixture']);

import { readFile, appendFile } from 'node:fs/promises';
const pkg = JSON.parse(await readFile('packages/react-keybound/package.json', 'utf8'));
if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(pkg.version)) throw new Error('Invalid release version.');
if (!process.env.GITHUB_OUTPUT) throw new Error('This script runs inside GitHub Actions.');
await appendFile(process.env.GITHUB_OUTPUT, `version=${pkg.version}\n`);

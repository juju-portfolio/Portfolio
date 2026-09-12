import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkPages } from './check-pages.mjs';

const baseArgument = process.argv
  .slice(2)
  .find((arg) => arg.startsWith('--base='));
const rawBase = baseArgument?.slice(7) ?? process.env.PAGES_BASE_PATH ?? '';
const base = rawBase === '/' ? '' : rawBase.replace(/\/$/, '');
if (
  base &&
  (!/^\/[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*$/.test(base) ||
    base.split('/').some((p) => p === '.' || p === '..'))
) {
  throw new Error(
    'Pages base must be empty or a repository path such as /portfolio.',
  );
}
const root = fileURLToPath(new URL('../', import.meta.url));
const out = new URL('../out/', import.meta.url);
// Fail closed: a failed new build must not leave an older publishable artifact.
await rm(out, { recursive: true, force: true });
const built = spawnSync(
  process.execPath,
  [
    fileURLToPath(
      new URL('../node_modules/vinext/dist/cli.js', import.meta.url),
    ),
    'build',
  ],
  {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      GITHUB_PAGES_BUILD: '1',
      NEXT_PUBLIC_SITE_BASE_PATH: base,
    },
  },
);
if (built.error) throw built.error;
if (built.status !== 0) process.exit(built.status || 1);
await mkdir(out, { recursive: true });
const client = new URL('../dist/client/', import.meta.url);
// Pages mounts out/ at the repository prefix. Copy the generated asset tree
// at the artifact root without deleting any similarly named public directory.
const generatedAssets = base
  ? new URL(`${base.slice(1)}/_next/`, client)
  : null;
await cp(client, out, {
  recursive: true,
  filter: (source) =>
    !generatedAssets ||
    source !== fileURLToPath(generatedAssets).replace(/\/$/, ''),
});
if (generatedAssets)
  await cp(generatedAssets, new URL('_next/', out), { recursive: true });
await writeFile(new URL('.nojekyll', out), '');
await checkPages(fileURLToPath(out), base);
console.log(`GitHub Pages artifact ready: out/ (URL base ${base || '/'})`);

import { cp, mkdir, rm, writeFile, readFile } from 'node:fs/promises';

const source = new URL('../', import.meta.url);
const destination = new URL('../outputs/github-pages-source/', import.meta.url);
const entries = [
  '.github',
  'app',
  'components',
  'content',
  'hooks',
  'lib',
  'public',
  'scripts',
  'tests',
  'package.json',
  'package-lock.json',
  'next.config.ts',
  'vite.config.ts',
  'tsconfig.json',
  'components.json',
  '.gitignore',
  '.oxlintrc.json',
  '.oxfmtrc.json',
  'GITHUB_PAGES.md',
];

// Generated delivery folder only. The explicit allowlist excludes workspace
// inputs, evidence, local environment, Site identity, caches and build output.
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
for (const entry of entries)
  await cp(new URL(entry, source), new URL(entry, destination), {
    recursive: true,
  });
await writeFile(
  new URL('README.md', destination),
  await readFile(new URL('GITHUB_PAGES.md', source)),
);
console.log(
  'GitHub source prepared in outputs/github-pages-source/. Commit its contents at the repository root, including .github/.',
);

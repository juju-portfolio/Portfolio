import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

export async function checkPages(directory, base = '') {
  const root = path.resolve(directory);
  const html = await readFile(path.join(root, 'index.html'), 'utf8');
  if (!html.includes('Juwairiyyah') || !html.includes('Curious about people')) {
    throw new Error(
      'The static export must contain the rendered portfolio, not an empty app shell.',
    );
  }
  let fileCount = 0;
  const origin = 'https://pages.example';
  async function checkReference(reference, source) {
    if (!reference || /^(?:#|data:|https?:|mailto:|\/\/)/.test(reference))
      return;
    const url = new URL(
      reference.replaceAll('&amp;', '&'),
      `${origin}${base}/${source === 'index.html' ? '' : source}`,
    );
    if (base && !url.pathname.startsWith(`${base}/`))
      throw new Error(`Unprefixed Pages asset ${reference} in ${source}`);
    const relative = decodeURIComponent(
      url.pathname.slice(base.length),
    ).replace(/^\//, '');
    const resolved = path.resolve(root, relative || 'index.html');
    if (!resolved.startsWith(`${root}${path.sep}`))
      throw new Error(`Escaping asset reference ${reference}`);
    if (!(await stat(resolved).catch(() => null))?.isFile())
      throw new Error(`Missing exported asset ${reference} in ${source}`);
  }
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      const relative = path.relative(root, file).split(path.sep).join('/');
      if (entry.isSymbolicLink())
        throw new Error(`Pages artifact contains a symlink: ${relative}`);
      if (
        /^(?:server|inputs|scripts|node_modules|\.openai)(?:\/|$)/.test(
          relative,
        ) ||
        /(?:^|\/)\.env/.test(relative) ||
        relative.endsWith('.map')
      ) {
        throw new Error(`Unexpected private or server artifact: ${relative}`);
      }
      if (entry.isDirectory()) await walk(file);
      else {
        fileCount++;
        if (!/\.(?:html|css)$/.test(file)) continue;
        const text = await readFile(file, 'utf8');
        const pattern = file.endsWith('.html')
          ? /(?:src|href)="([^"]+)"/g
          : /url\(["']?([^\s)"']+)["']?\)/g;
        for (const match of text.matchAll(pattern))
          await checkReference(match[1], relative);
      }
    }
  }
  await walk(root);
  console.log(
    `Static export verified: ${fileCount} files; HTML/CSS assets resolve under ${base || '/'}.`,
  );
}

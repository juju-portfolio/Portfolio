import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const options = Object.fromEntries(
  process.argv.slice(2).map((arg) => arg.replace(/^--/, '').split('=')),
);
const base = (options.base || '').replace(/\/$/, '');
const root = path.resolve(fileURLToPath(new URL('../out/', import.meta.url)));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.rsc': 'text/x-component',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

// Local QA only. GitHub serves these files itself; no server is deployed.
createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', 'http://localhost');
    if (base && url.pathname === base) {
      response.writeHead(301, { Location: `${base}/${url.search}` });
      response.end();
      return;
    }
    if (!url.pathname.startsWith(`${base}/`)) throw new Error('Not found');
    const relative = decodeURIComponent(url.pathname.slice(base.length));
    let file = path.resolve(root, `.${relative}`);
    if (file !== root && !file.startsWith(`${root}${path.sep}`))
      throw new Error('Not found');
    let info = await stat(file);
    if (info.isDirectory()) {
      file = path.join(file, 'index.html');
      info = await stat(file);
    }
    if (!info.isFile()) throw new Error('Not found');
    response.writeHead(200, {
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    if (request.method === 'HEAD') response.end();
    else createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('Not found');
  }
}).listen(Number(options.port || 4173), '127.0.0.1', () => {
  console.log(
    `Static Pages preview: http://localhost:${options.port || 4173}${base}/`,
  );
});

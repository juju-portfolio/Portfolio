/** Keep authored asset paths unchanged while serving at a Pages repository URL. */
export function withBasePath(path: string, basePath: string) {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const base = basePath.replace(/\/$/, '');
  if (!base || path === base || path.startsWith(`${base}/`)) return path;
  return `${base}${path}`;
}

export const publicAsset = (path: string) =>
  withBasePath(path, process.env.NEXT_PUBLIC_SITE_BASE_PATH || '');

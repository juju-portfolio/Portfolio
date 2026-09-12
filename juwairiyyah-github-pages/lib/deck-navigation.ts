export type DeckLocation = { slug: string; slideId: string | null };
export function readDeckLocation(href: string): DeckLocation | null {
  const url = new URL(href, 'http://localhost');
  const slug = url.searchParams.get('project');
  return slug ? { slug, slideId: url.searchParams.get('slide') } : null;
}
export function deckUrl(href: string, location: DeckLocation | null) {
  const url = new URL(href, 'http://localhost');
  if (location) {
    url.searchParams.set('project', location.slug);
    if (location.slideId) url.searchParams.set('slide', location.slideId);
    else url.searchParams.delete('slide');
  } else {
    url.searchParams.delete('project');
    url.searchParams.delete('slide');
  }
  return url.pathname + url.search + url.hash;
}
export function validSlideIndex(ids: string[], requested: string | null) {
  const n = ids.indexOf(requested ?? '');
  return n < 0 ? 0 : n;
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { withBasePath } from '../lib/public-asset.ts';
import { deckUrl, readDeckLocation } from '../lib/deck-navigation.ts';

test('Pages prefixes local assets once and preserves external links and version queries', () => {
  assert.equal(
    withBasePath('/media/guide/female/wave.webp?v=fuller', '/portfolio'),
    '/portfolio/media/guide/female/wave.webp?v=fuller',
  );
  assert.equal(
    withBasePath('/portfolio/favicon.svg', '/portfolio/'),
    '/portfolio/favicon.svg',
  );
  assert.equal(withBasePath('/favicon.svg', ''), '/favicon.svg');
  for (const url of [
    'https://example.com/a.png',
    '//cdn.example.com/a.png',
    '#work',
    'data:image/png;base64,AA',
  ])
    assert.equal(withBasePath(url, '/portfolio'), url);
});

test('opening and closing a deck preserves the GitHub repository path', () => {
  const href = 'https://example.github.io/portfolio/?campaign=intern#work';
  const opened = deckUrl(href, { slug: 'jbot', slideId: 'overview' });
  assert.equal(
    opened,
    '/portfolio/?campaign=intern&project=jbot&slide=overview#work',
  );
  assert.deepEqual(readDeckLocation(`https://example.github.io${opened}`), {
    slug: 'jbot',
    slideId: 'overview',
  });
  assert.equal(
    deckUrl(`https://example.github.io${opened}`, null),
    '/portfolio/?campaign=intern#work',
  );
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCatalog,
  validateDeck,
  validateReadiness,
} from '../lib/validate-content.ts';
import {
  readDeckLocation,
  deckUrl,
  validSlideIndex,
} from '../lib/deck-navigation.ts';
import { samplePortraitProgress, PHASES } from '../lib/motion-progress.ts';
import { projects as realProjects, readiness } from '../content/projects.ts';
import campus from './fixtures/campus-01.ts';
import habits from './fixtures/habit-01.ts';
import gensolar from '../content/decks/gensolar.ts';
import games from '../content/decks/video-games.ts';
import jbot from '../content/decks/jbot.ts';
import mood from '../content/decks/mood-detection.ts';
import agriculture from '../content/decks/agriculture.ts';
const projects = [campus, habits].map((deck) => ({
  id: deck.projectId,
  slug: deck.projectId,
  title: 'Test fixture',
  kind: 'concept',
  summary: 'Private test fixture',
  contribution: 'Contract test',
  publication: 'draft',
}));
const clone = (x) => structuredClone(x);

test('native and image fixture decks have complete, separate content contracts', () => {
  assert.doesNotThrow(() => validateCatalog(projects, [campus, habits]));
  assert.ok(habits.slides.some((s) => s.kind === 'image'));
});
test('catalog rejects duplicate identifiers, missing decks, and mismatched decks', () => {
  assert.throws(
    () => validateCatalog([...projects, projects[0]], [campus, habits]),
    /Duplicate/,
  );
  assert.throws(() => validateCatalog(projects, [campus]), /exactly one/);
  const mismatched = clone(habits);
  mismatched.projectId = 'different';
  assert.throws(
    () => validateCatalog(projects, [campus, mismatched]),
    /exactly one/,
  );
});
test('empty decks, duplicate slide/block IDs, and unavailable cue targets fail validation', () => {
  const empty = clone(campus);
  empty.slides = [];
  assert.throws(() => validateDeck(empty));
  const duplicate = clone(campus);
  duplicate.slides.push(duplicate.slides[0]);
  assert.throws(() => validateDeck(duplicate), /Duplicate/);
  const block = clone(campus);
  block.slides[0].blocks.push(block.slides[0].blocks[0]);
  assert.throws(() => validateDeck(block), /Duplicate/);
  const target = clone(campus);
  target.slides[0].guide.targetId = 'missing';
  assert.throws(() => validateDeck(target), /target/);
});
test('image slides require alt, transcript, valid local assets and bounded hotspots', () => {
  for (const mutate of [
    (s) => (s.image.alt = ''),
    (s) => (s.transcript = ''),
    (s) => (s.image.src = '/media/../secret'),
    (s) => (s.image.width = 0),
    (s) => (s.hotspots[0].x = 0.99),
    (s) => (s.hotspots[0].width = NaN),
  ]) {
    const changed = clone(habits);
    mutate(changed.slides.find((s) => s.kind === 'image'));
    assert.throws(() => validateDeck(changed));
  }
});
test('release gate rejects every missing personal-content requirement', () => {
  assert.throws(
    () => validateReadiness(readiness, projects),
    /Release blocked/,
  );
  const ready = {
    contentStatus: 'verified',
    portraitStatus: 'supplied',
    characterStatus: 'reviewed',
  };
  const publicProjects = projects.map((p) => ({ ...p, publication: 'ready' }));
  assert.doesNotThrow(() => validateReadiness(ready, publicProjects));
  for (const [key, value] of [
    ['contentStatus', 'fixture'],
    ['portraitStatus', 'missing'],
    ['characterStatus', 'pending'],
  ])
    assert.throws(() =>
      validateReadiness({ ...ready, [key]: value }, publicProjects),
    );
  assert.throws(() => validateReadiness(ready, projects));
});
test('portrait sampling is reversible with photo fully absent whenever artwork exits', () => {
  const samples = [
    0, 79, 80, 81, 140, 199, 200, 201, 290, 379, 380, 381, 470, 559, 560, 561,
    1000,
  ];
  const forward = new Map(samples.map((s) => [s, samplePortraitProgress(s)]));
  for (const s of [...samples].reverse()) {
    const p = samplePortraitProgress(s);
    assert.deepEqual(p, forward.get(s));
    if (p.exit > 0 || p.dock > 0) assert.equal(p.photoOpacity, 0);
    if (p.photoOpacity > 0) {
      assert.equal(p.exit, 0);
      assert.equal(p.dock, 0);
    }
  }
  assert.equal(samplePortraitProgress(PHASES.start).photoOpacity, 1);
  assert.equal(samplePortraitProgress(PHASES.morphEnd).photoOpacity, 0);
  assert.equal(samplePortraitProgress(PHASES.dockEnd).dock, 1);
});
test('URL state preserves unrelated parameters and anchors; invalid slides recover', () => {
  const original = 'https://example.test/?utm_source=resume#work';
  const opened = deckUrl(original, { slug: 'campus', slideId: null });
  assert.deepEqual(readDeckLocation('https://example.test' + opened), {
    slug: 'campus',
    slideId: null,
  });
  const advanced = deckUrl('https://example.test' + opened, {
    slug: 'campus',
    slideId: 'decision',
  });
  assert.match(advanced, /utm_source=resume/);
  assert.match(advanced, /#work$/);
  assert.equal(
    deckUrl('https://example.test' + advanced, null),
    '/?utm_source=resume#work',
  );
  assert.equal(readDeckLocation(original), null);
  assert.equal(validSlideIndex(['overview', 'decision'], 'bad-id'), 0);
  assert.equal(validSlideIndex(['overview', 'decision'], 'decision'), 1);
});

test('evidence release check rejects stale wording and missing source coverage', async () => {
  const { contentHash, validateEvidence } =
    await import('../scripts/validate-evidence.ts');
  const content = {
    profile: { name: 'Applicant' },
    projects: [{ id: 'p-1', title: 'Project title' }],
  };
  const review = {
    reviewer: 'Source reviewer',
    contentHash: contentHash(content),
    entries: [
      {
        claimId: 'name',
        publicFieldPaths: ['profile.name'],
        basis: 'source',
        source: {
          file: 'resume.pdf',
          location: 'page 1',
          supportingExcerpt: 'Applicant',
        },
        proposedPublicWording: 'Applicant',
        attribution: 'individual',
        state: 'supported',
      },
    ],
    nonFactualFields: [
      {
        path: 'projects.0.title',
        reason: 'Editorial project title, checked against scope',
      },
    ],
  };
  assert.doesNotThrow(() => validateEvidence(content, review));
  assert.throws(
    () =>
      validateEvidence({ ...content, profile: { name: 'Different' } }, review),
    /stale/,
  );
  assert.throws(
    () => validateEvidence(content, { ...review, entries: [] }),
    /coverage/,
  );
  assert.throws(
    () =>
      validateEvidence(content, {
        ...review,
        entries: [{ ...review.entries[0], source: undefined }],
      }),
    /source/,
  );
});

test('all five résumé projects have separate decks and valid factual panels', () => {
  const decks = [gensolar, games, jbot, mood, agriculture];
  assert.equal(realProjects.length, 5);
  assert.doesNotThrow(() => validateCatalog(realProjects, decks));
  assert.ok(realProjects.every((p) => p.kind !== 'concept'));
  for (const deck of decks) {
    const proposal = deck.slides.at(-1);
    assert.match(proposal.section, /PROPOSED|I WOULD/);
    assert.match(proposal.introduction, /would|proposed/i);
    assert.ok(deck.slides.length >= 4);
  }
  const invalid = clone(gensolar);
  invalid.slides[0].blocks.find((b) => b.kind === 'exhibit').items[0].text = '';
  assert.throws(() => validateDeck(invalid), /Exhibit item text/);
});

test('authored exhibits reject empty stages and unsupported layouts', () => {
  for (const mutate of [
    (block) => {
      block.items = [];
    },
    (block) => {
      block.layout = 'unknown';
    },
    (block) => {
      block.items[0].title = '';
    },
  ]) {
    const changed = clone(gensolar);
    mutate(changed.slides[0].blocks[0]);
    assert.throws(() => validateDeck(changed));
  }
});

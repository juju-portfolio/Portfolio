import test from 'node:test';
import assert from 'node:assert/strict';
import { findViewportRest, pageLaunchWidth } from '../lib/viewport-rest.ts';
import { guideEnvelope, rectContains } from '../lib/guide-layout.ts';
import { resizeAtFeet } from '../lib/guide-travel.ts';
import { flightPoint } from '../lib/character-behavior.ts';

const current = { x: 220, y: 90, width: 72 };
test('a contact viewport parks at the bottom with links and footer copy clear', () => {
  const obstacles = [
    { left: 22, right: 492, top: 160, bottom: 400 },
    { left: 22, right: 271, top: 423, bottom: 467 },
    { left: 22, right: 102, top: 477, bottom: 521 },
    { left: 22, right: 72, top: 553, bottom: 603 },
    { left: 22, right: 330, top: 620, bottom: 656 },
  ];
  const parked = findViewportRest(
    { width: 530, height: 763 },
    obstacles,
    current,
  );
  assert.ok(parked);
  assert.equal(parked.rest.width, 88);
  assert.ok(parked.rest.y + parked.rest.width * 1.5 > 740);
  const wings = guideEnvelope(parked.launch, true);
  assert.ok(rectContains(parked.clip, wings, 12));
  assert.ok(rectContains(parked.clip, guideEnvelope(parked.rest, false), 12));
  for (const r of obstacles)
    assert.ok(
      wings.left >= r.right + 8 ||
        wings.right <= r.left - 8 ||
        wings.top >= r.bottom + 8 ||
        wings.bottom <= r.top - 8,
    );
});
test('lower right controls and tour panel move parking to the clear left side on mobile', () => {
  const viewport = { width: 390, height: 740 };
  const protectedPanel = { left: 205, right: 390, top: 410, bottom: 740 };
  const first = findViewportRest(viewport, [protectedPanel], current);
  assert.ok(first);
  assert.ok(guideEnvelope(first.launch, true).right <= 197);
  assert.deepEqual(
    findViewportRest(viewport, [protectedPanel], current),
    first,
  );
});
test('a completely occupied viewport does not place a body over controls', () => {
  assert.equal(
    findViewportRest(
      { width: 320, height: 540 },
      [{ left: 0, right: 320, top: 0, bottom: 540 }],
      current,
    ),
    null,
  );
});

test('a direct card target after parking retains the validated wing span', () => {
  const parked = findViewportRest({ width: 530, height: 763 }, [], {
    x: 430,
    y: 400,
    width: 88,
  });
  assert.ok(parked);
  const width = pageLaunchWidth('viewport-rest', 84);
  assert.equal(width, parked.launch.width);
  // The authored 84px launch would clip at this right-edge parking location.
  assert.equal(
    rectContains(
      parked.clip,
      guideEnvelope(resizeAtFeet(parked.rest, 84), true),
      12,
    ),
    false,
  );
  const launch = resizeAtFeet(parked.rest, width);
  const card = { x: 220, y: 320, width };
  for (let i = 0; i <= 60; i++) {
    const sample = flightPoint(launch, card, i / 60, 16);
    assert.ok(sample.width <= parked.launch.width);
    assert.ok(rectContains(parked.clip, guideEnvelope(sample, true), 12));
  }
  assert.equal(pageLaunchWidth('rest', 84), 84);
});

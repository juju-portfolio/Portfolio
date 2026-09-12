import test from 'node:test';
import assert from 'node:assert/strict';
import {
  actorVisual,
  presenterRoute,
  presenterLoop,
} from '../lib/presenter-motion.ts';
import { flightPoint } from '../lib/character-behavior.ts';
import { guideEnvelope, rectContains } from '../lib/guide-layout.ts';

test('flight chooses wings and airborne body atomically; a resting body cannot remain in fly pose', () => {
  for (const pose of ['neutral', 'smile', 'wave', 'pout', 'fly', 'point']) {
    assert.deepEqual(actorVisual(true, pose), { pose: 'fly', wings: true });
    assert.equal(actorVisual(false, pose).wings, false);
    assert.notEqual(actorVisual(false, pose).pose, 'fly');
  }
});

test('the presenter lands exactly on its slot without clipping feather tips at every supported width', () => {
  for (const viewport of [320, 390, 556, 760, 1024, 1440, 1920]) {
    const left = viewport <= 760 ? 12 : viewport * 0.02 + 16;
    const right =
      viewport <= 760
        ? viewport - 12
        : Math.min(viewport * 0.98, 1520 + left) - 246;
    const top = 500;
    const stage = { left, right, top, bottom: top + 170 };
    const home = { width: 72, x: left + 68, y: top + 52.6 };
    const route = presenterRoute(stage, home);
    assert.ok(route);
    assert.deepEqual(route.end, home);
    assert.ok(
      route.start.x - route.end.x >= 89,
      `substantial flight at ${viewport}px`,
    );
    for (let frame = 0; frame <= 240; frame++) {
      const box = flightPoint(route.start, route.end, frame / 240, 0);
      assert.ok(rectContains(stage, guideEnvelope(box, true), 5));
    }
  }
});

test('an offscreen or undersized presenter does not start an invisible flight', () => {
  const home = { width: 72, x: 68, y: 53 };
  assert.equal(
    presenterRoute({ left: 0, right: 300, top: -5, bottom: 170 }, home),
    null,
  );
  assert.equal(
    presenterRoute({ left: 0, right: 120, top: 0, bottom: 70 }, home),
    null,
  );
});

test('rapid slide changes rebase continuously without resetting to the far edge', () => {
  const stage = { left: 12, right: 378, top: 600, bottom: 770 };
  const home = { width: 72, x: 80, y: 652.6 };
  const route = presenterRoute(stage, home);
  const midway = presenterLoop(route, home, 0.23);
  assert.deepEqual(presenterLoop(route, midway, 0), midway);
  assert.deepEqual(presenterLoop(route, midway, 1), route.end);
  for (let frame = 0; frame <= 240; frame++) {
    assert.ok(
      rectContains(
        stage,
        guideEnvelope(presenterLoop(route, midway, frame / 240), true),
        5,
      ),
    );
  }
});

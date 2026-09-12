import test from 'node:test';
import assert from 'node:assert/strict';
import {
  selectGuideStop,
  guideEnvelope,
  pocketBox,
  rectContains,
  canChangePocket,
} from '../lib/guide-layout.ts';

const rect = (top, bottom) => ({ left: 22, right: 368, top, bottom });
const ids = ['campus', 'habits', 'about', 'contact'];

test('route advances through every section and reverses without a first-card ceiling', () => {
  for (let active = 0; active < ids.length; active++) {
    const stops = ids.map((id, i) => ({
      id,
      rect: rect((i - active) * 650 + 120, (i - active) * 650 + 650),
    }));
    assert.equal(
      selectGuideStop(stops, 844, ids[Math.max(0, active - 1)]),
      ids[active],
    );
    assert.equal(
      selectGuideStop(stops, 844, ids[Math.min(ids.length - 1, active + 1)]),
      ids[active],
    );
  }
});

test('a direct jump chooses the visible section and equal-row cards retain their stop', () => {
  assert.equal(
    selectGuideStop(
      [
        { id: 'campus', rect: rect(-2000, -1400) },
        { id: 'contact', rect: rect(100, 650) },
      ],
      844,
      'campus',
    ),
    'contact',
  );
  assert.equal(
    selectGuideStop(
      [
        { id: 'campus', rect: rect(120, 700) },
        { id: 'habits', rect: rect(120, 700) },
      ],
      900,
      'habits',
    ),
    'habits',
  );
});

test('open pocket includes the entire wing envelope with edge clearance', () => {
  for (const width of [276, 346, 512, 620, 1272]) {
    const opening = { left: 22, right: 22 + width, top: 100, bottom: 340 };
    const box = pocketBox(opening);
    assert.ok(box);
    assert.ok(rectContains(opening, guideEnvelope(box, true), 11.99));
    assert.ok(box.width <= 96);
  }
  assert.equal(pocketBox({ left: 0, right: 80, top: 0, bottom: 100 }), null);
  assert.equal(pocketBox({ left: 0, right: 390, top: 400, bottom: 100 }), null);
});

test('body fit alone does not establish wing clearance', () => {
  const viewport = { left: 0, top: 0, right: 390, bottom: 844 };
  const box = { x: 280, y: 200, width: 96 };
  assert.ok(rectContains(viewport, guideEnvelope(box, false)));
  assert.equal(rectContains(viewport, guideEnvelope(box, true)), false);
});

test('visible slots and active touch must not change document geometry', () => {
  assert.equal(canChangePocket(rect(100, 340), 844, false), false);
  assert.equal(canChangePocket(rect(830, 1070), 844, false), false);
  assert.equal(canChangePocket(rect(-300, -40), 844, false), true);
  assert.equal(canChangePocket(rect(950, 1190), 844, false), true);
  assert.equal(canChangePocket(rect(-300, -40), 844, true), false);
});

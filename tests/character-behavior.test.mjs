import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hasSeenEverySlide,
  fitCharacter,
  flightPoint,
} from '../lib/character-behavior.ts';
import { sampleWingCycle, WING_FRAME_COUNT } from '../lib/wing-keyframes.ts';

test('the last slide alone does not mean the whole deck was viewed', () => {
  const ids = ['intro', 'decision', 'result'];
  assert.equal(hasSeenEverySlide(ids, new Set(['intro', 'result'])), false);
  assert.equal(
    hasSeenEverySlide(ids, new Set(['result', 'decision', 'intro'])),
    true,
  );
  assert.equal(hasSeenEverySlide(ids, new Set(['intro', 'intro'])), false);
  assert.equal(hasSeenEverySlide([], new Set()), false);
  assert.equal(hasSeenEverySlide(['different-deck'], new Set(ids)), false);
});

test('a return destination remains inside a resized narrow viewport', () => {
  const box = fitCharacter(
    { x: 1400, y: 1000, width: 190 },
    { width: 390, height: 844 },
  );
  assert.ok(box.x + box.width * 0.88 <= 390);
  assert.ok(box.y + box.width * 1.5 <= 832);
  assert.ok(box.y >= 12);
});

test('flight has exact endpoints, a lifted midpoint, and no accumulated drift', () => {
  const from = { x: 1200, y: 570, width: 156 };
  const to = { x: 1000, y: 340, width: 188 };
  assert.deepEqual(flightPoint(from, to, -1), from);
  assert.deepEqual(flightPoint(from, to, 1), to);
  assert.ok(flightPoint(from, to, 0.5).y < (from.y + to.y) / 2);
  assert.deepEqual(flightPoint(to, from, 1), from);
});

test('flight eases to a stop at both ends without an initial vertical kick', () => {
  const from = { x: 1200, y: 570, width: 120 };
  const to = { x: 1000, y: 340, width: 188 };
  const distance = (a, b) =>
    Math.hypot(a.x - b.x, a.y - b.y, a.width - b.width);
  const delta = 0.0001;
  assert.ok(distance(flightPoint(from, to, delta), from) / delta < 0.01);
  assert.ok(distance(flightPoint(from, to, 1 - delta), to) / delta < 0.01);
  // Compact flight must stay within its shallow reserved lane.
  for (let i = 0; i <= 100; i++) {
    const p = flightPoint(
      { x: 90, y: 300, width: 96 },
      { x: 200, y: 300, width: 96 },
      i / 100,
      8,
    );
    assert.ok(p.y >= 292 && p.y <= 300);
  }
});

test('wing cycle closes continuously and has smooth stroke reversals', () => {
  assert.equal(WING_FRAME_COUNT, 48);
  assert.deepEqual(sampleWingCycle(0), sampleWingCycle(1));
  for (let i = 0; i <= 1000; i++) {
    const pose = sampleWingCycle(i / 1000);
    assert.ok(pose.angle >= -29 && pose.angle <= 14);
    assert.ok(pose.spread >= 0.65 && pose.spread <= 1);
    assert.ok(Math.abs(pose.flex) <= 3);
  }
  const d = 0.00001;
  for (const t of [0, 0.42, 1]) {
    const center = sampleWingCycle(t).angle;
    assert.ok(Math.abs(sampleWingCycle(t - d).angle - center) / d < 0.02);
    assert.ok(Math.abs(sampleWingCycle(t + d).angle - center) / d < 0.02);
  }
});

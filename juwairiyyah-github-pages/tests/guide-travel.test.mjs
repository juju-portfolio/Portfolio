import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clearLanding,
  planGuideTravel,
  sampleGuideTravel,
  stepHop,
  cardLanding,
  resizeAtFeet,
  carriedFlight,
} from '../lib/guide-travel.ts';
import { guideEnvelope, rectContains } from '../lib/guide-layout.ts';
const viewport = { width: 1000, height: 720 };
const from = { x: 150, y: 300, width: 60 },
  to = { x: 650, y: 300, width: 60 };

test('landing reserves complete wings and refuses a cramped clear area', () => {
  const clear = { left: 0, right: 300, top: 0, bottom: 300 };
  const landing = clearLanding(clear);
  assert.equal(landing.width, 72);
  assert.ok(rectContains(clear, guideEnvelope(landing, true)));
  assert.equal(clearLanding({ left: 0, right: 120, top: 0, bottom: 80 }), null);
});
test('card art grows into existing space while its folded body and launch wings both fit', () => {
  for (const clear of [
    { left: 34, right: 356, top: 436, bottom: 657 },
    { left: 34, right: 286, top: 180, bottom: 360 },
    { left: 634, right: 1344, top: 295, bottom: 615 },
  ]) {
    const landing = cardLanding(clear);
    assert.ok(landing);
    assert.ok(landing.rest.width > landing.launch.width * 1.4);
    assert.ok(rectContains(clear, guideEnvelope(landing.rest, false), 8));
    assert.ok(rectContains(clear, guideEnvelope(landing.launch, true), 5));
    for (let i = 0; i <= 100; i++) {
      const width =
        landing.rest.width +
        ((landing.launch.width - landing.rest.width) * i) / 100;
      const resized = resizeAtFeet(landing.rest, width);
      assert.ok(
        Math.abs(
          resized.x +
            resized.width / 2 -
            landing.rest.x -
            landing.rest.width / 2,
        ) < 1e-9,
      );
      assert.ok(
        Math.abs(
          resized.y +
            resized.width * 1.5 -
            landing.rest.y -
            landing.rest.width * 1.5,
        ) < 1e-9,
      );
      assert.ok(rectContains(clear, guideEnvelope(resized, false), 8));
    }
  }
  assert.equal(cardLanding({ left: 0, right: 110, top: 0, bottom: 80 }), null);
});
test('an unobstructed route has no unnecessary detour', () => {
  assert.deepEqual(planGuideTravel(from, to, [], viewport), [from, to]);
});
test('scroll interruption continuously shrinks the larger body with full wings inside narrow viewports', () => {
  for (const width of [320, 390, 842, 1440]) {
    const viewport = { width, height: 844 };
    const clear = { left: 22, right: width - 22, top: 220, bottom: 510 };
    const rest = cardLanding(clear, width).rest;
    let box = rest;
    for (let i = 0; i <= 100; i++) {
      const requestedWidth = rest.width + ((72 - rest.width) * i) / 100;
      box = carriedFlight({ ...box, y: box.y - 3 }, requestedWidth, viewport);
      assert.ok(
        rectContains(
          { left: 0, right: width, top: 0, bottom: 844 },
          guideEnvelope(box, true),
          11.99,
        ),
      );
      assert.ok(box.width <= rest.width);
    }
    // Even an interrupted larger desktop body cannot invert mobile bounds.
    const resized = carriedFlight({ x: 700, y: 900, width: 176 }, 176, {
      width: 320,
      height: 560,
    });
    assert.ok(
      rectContains(
        { left: 0, right: 320, top: 0, bottom: 560 },
        guideEnvelope(resized, true),
        11.99,
      ),
    );
  }
});
test('rounded detour keeps the entire wing envelope away from text', () => {
  const obstacle = { left: 400, right: 440, top: 230, bottom: 380 };
  const route = planGuideTravel(from, to, [obstacle], viewport);
  assert.ok(route && route.length > 3);
  assert.deepEqual(route[0], from);
  assert.deepEqual(route.at(-1), to);
  for (let i = 0; i <= 1000; i++) {
    const box = sampleGuideTravel(route, from, to, i / 1000),
      r = guideEnvelope(box, true);
    assert.ok(
      r.right < obstacle.left ||
        r.left > obstacle.right ||
        r.bottom < obstacle.top ||
        r.top > obstacle.bottom,
    );
  }
});
test('a sealed corridor and offscreen endpoints explicitly require the foreground fallback', () => {
  assert.equal(
    planGuideTravel(
      from,
      to,
      [{ left: 390, right: 450, top: 0, bottom: 720 }],
      viewport,
    ),
    null,
  );
  assert.equal(planGuideTravel({ ...from, y: -120 }, to, [], viewport), null);
});
test('flight and compact hop settle at exact endpoints with no velocity kick', () => {
  const route = [from, to],
    d = 0.00001;
  assert.deepEqual(sampleGuideTravel(route, from, to, -1), from);
  assert.deepEqual(sampleGuideTravel(route, from, to, 2), to);
  assert.ok(
    Math.abs(sampleGuideTravel(route, from, to, d).x - from.x) / d < 0.01,
  );
  assert.ok(
    Math.abs(sampleGuideTravel(route, from, to, 1 - d).x - to.x) / d < 0.01,
  );
  const nearby = { ...from, x: from.x - 10 };
  assert.deepEqual(stepHop(from, nearby, 0), from);
  assert.deepEqual(stepHop(from, nearby, 1), nearby);
  assert.equal(stepHop(from, nearby, 0.5).y, from.y - 8);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { fitCoverFlight, sampleCoverFlight } from '../lib/guide-showcase.ts';
import { guideEnvelope, rectContains } from '../lib/guide-layout.ts';

test('mobile cover flight reserves substantial movement without crossing text boundaries', () => {
  for (const viewport of [320, 390, 556, 640]) {
    const clip = { left: 34, right: viewport - 34, top: 140, bottom: 365 };
    const stage = fitCoverFlight(clip);
    assert.ok(stage);
    assert.ok(stage.radiusX * 2 >= 56);
    for (let frame = 0; frame <= 240; frame++) {
      const { box } = sampleCoverFlight(stage, frame / 240);
      assert.ok(rectContains(clip, guideEnvelope(box, true), 7.99));
    }
  }
});

test('cover flight is a continuous closed arc with gentle endpoint velocity', () => {
  const stage = fitCoverFlight({ left: 34, right: 356, top: 140, bottom: 365 });
  const start = sampleCoverFlight(stage, 0);
  const finish = sampleCoverFlight(stage, 1);
  assert.ok(Math.abs(start.box.x - finish.box.x) < 1e-8);
  assert.ok(Math.abs(start.box.y - finish.box.y) < 1e-8);
  const next = sampleCoverFlight(stage, 0.001);
  assert.ok(
    Math.hypot(next.box.x - start.box.x, next.box.y - start.box.y) < 0.0001,
  );
  assert.equal(
    fitCoverFlight({ left: 0, right: 220, top: 0, bottom: 110 }),
    null,
  );
});

import type { CharacterBox } from './character-behavior';
import { guideEnvelope, rectContains, type GuideRect } from './guide-layout.ts';
import { resizeAtFeet } from './guide-travel.ts';

const PARKING_FLIGHT_WIDTH = 56;

/** A parked actor must depart at the same wing size its landing validated. */
export const pageLaunchWidth = (
  activity: string | undefined,
  authoredWidth: number,
) => (activity === 'viewport-rest' ? PARKING_FLIGHT_WIDTH : authoredWidth);

const intersects = (a: GuideRect, b: GuideRect, gap = 8) =>
  a.left < b.right + gap &&
  a.right > b.left - gap &&
  a.top < b.bottom + gap &&
  a.bottom > b.top - gap;

/** A temporary landing in existing lower-viewport space, without a layout rail. */
export function findViewportRest(
  viewport: { width: number; height: number },
  obstacles: GuideRect[],
  current: CharacterBox,
) {
  const bounds = {
    left: 0,
    right: viewport.width,
    top: 0,
    bottom: viewport.height,
  };
  const candidates: {
    rest: CharacterBox;
    launch: CharacterBox;
    score: number;
  }[] = [];
  for (const width of [88, 72, 64, 56]) {
    const flightWidth = Math.min(PARKING_FLIGHT_WIDTH, width);
    const side = Math.max(width / 2, flightWidth * 1.26) + 16;
    const minX = side,
      maxX = viewport.width - side;
    if (maxX < minX) continue;
    const bottom = viewport.height - 16 - flightWidth * 0.05;
    const minFoot = viewport.height * 0.45 + width * 1.5;
    for (let foot = bottom; foot >= minFoot; foot -= 16) {
      for (let i = 0; i <= 12; i++) {
        const x = maxX - ((maxX - minX) * i) / 12;
        const rest = { width, x: x - width / 2, y: foot - width * 1.5 };
        const launch = resizeAtFeet(rest, flightWidth);
        const body = guideEnvelope(rest, false),
          wings = guideEnvelope(launch, true);
        if (!rectContains(bounds, body, 12) || !rectContains(bounds, wings, 12))
          continue;
        if (obstacles.some((r) => intersects(body, r) || intersects(wings, r)))
          continue;
        candidates.push({
          rest,
          launch,
          score:
            (bottom - foot) * 12 +
            (88 - width) * 2 +
            Math.abs(x - current.x - current.width / 2) * 0.1,
        });
      }
    }
  }
  candidates.sort((a, b) => a.score - b.score);
  if (!candidates[0]) return null;
  const { rest, launch } = candidates[0];
  return { rest, launch, clip: bounds };
}

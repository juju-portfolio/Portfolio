import { flightPoint, type CharacterBox } from './character-behavior.ts';
import type { GuideRect } from './guide-layout';
export type RoutePoint = { x: number; y: number };
/** Resize on the planted foot point, so takeoff/landing never skate. */
export function resizeAtFeet(box: CharacterBox, width: number): CharacterBox {
  return {
    width,
    x: box.x + (box.width - width) * 0.5,
    y: box.y + (box.width - width) * 1.5,
  };
}
/** Standing art uses the body envelope; only its launch reserves spread wings. */
export function cardLanding(clear: GuideRect, viewportWidth = Infinity) {
  const height = clear.bottom - clear.top;
  const breadth = clear.right - clear.left;
  const width = Math.min(
    176,
    breadth - 24,
    (height - 20) / 1.5,
    (viewportWidth - 24) / 2.52,
  );
  const flightWidth = Math.min(84, (breadth - 24) / 2.52, (height - 20) / 2.2);
  if (width < 56 || flightWidth < 48) return null;
  const footX =
    breadth > 400
      ? (clear.left + clear.right) / 2
      : clear.right - Math.max(width / 2, flightWidth * 1.26) - 12;
  const rest = {
    width,
    x: footX - width / 2,
    y: clear.bottom - 10 - width * 1.5,
  };
  return { rest, launch: resizeAtFeet(rest, flightWidth) };
}
export function carriedFlight(
  box: CharacterBox,
  requestedWidth: number,
  viewport: { width: number; height: number },
) {
  const width = Math.min(
    box.width,
    requestedWidth,
    (viewport.width - 24) / 2.52,
    (viewport.height - 24) / 2.2,
  );
  const resized = resizeAtFeet(box, width);
  return {
    width,
    x: Math.max(
      width * 0.76 + 12,
      Math.min(viewport.width - width * 1.76 - 12, resized.x),
    ),
    y: Math.max(
      width * 0.65 + 12,
      Math.min(viewport.height - width * 1.55 - 12, resized.y),
    ),
  };
}
export function clearLanding(clear: GuideRect): CharacterBox | null {
  const width = Math.min(
    72,
    (clear.right - clear.left - 24) / 2.52,
    (clear.bottom - clear.top - 20) / 2.2,
  );
  if (width < 48) return null;
  return {
    width,
    x: clear.right - width * 1.76 - 12,
    y: clear.bottom - width * 1.55 - 10,
  };
}
export function expandForWings(r: GuideRect, width: number): GuideRect {
  return {
    left: r.left - width * 1.76 - 5,
    right: r.right + width * 0.76 + 5,
    top: r.top - width * 1.55 - 5,
    bottom: r.bottom + width * 0.65 + 5,
  };
}
function crosses(a: RoutePoint, b: RoutePoint, r: GuideRect) {
  let lo = 0,
    hi = 1;
  for (const [start, delta, min, max] of [
    [a.x, b.x - a.x, r.left, r.right],
    [a.y, b.y - a.y, r.top, r.bottom],
  ]) {
    if (Math.abs(delta) < 1e-8) {
      if (start < min || start > max) return false;
    } else {
      const one = (min - start) / delta,
        two = (max - start) / delta;
      lo = Math.max(lo, Math.min(one, two));
      hi = Math.min(hi, Math.max(one, two));
      if (lo > hi) return false;
    }
  }
  return true;
}
/** Small visibility graph routes wings around real text/control rectangles. */
export function planGuideTravel(
  from: CharacterBox,
  to: CharacterBox,
  obstacles: GuideRect[],
  viewport: { width: number; height: number },
) {
  const width = Math.max(from.width, to.width);
  const safe = {
    left: width * 0.76 + 8,
    right: viewport.width - width * 1.76 - 8,
    top: width * 0.65 + 8,
    bottom: viewport.height - width * 1.55 - 8,
  };
  const expanded = obstacles.map((r) => expandForWings(r, width));
  const inside = (p: RoutePoint) =>
    p.x >= safe.left &&
    p.x <= safe.right &&
    p.y >= safe.top &&
    p.y <= safe.bottom;
  const clear = (a: RoutePoint, b: RoutePoint) =>
    inside(a) && inside(b) && !expanded.some((r) => crosses(a, b, r));
  if (clear(from, to)) return [from, to];
  const nodes: RoutePoint[] = [from, to];
  for (const r of expanded)
    for (const x of [r.left - 24, r.right + 24])
      for (const y of [r.top - 24, r.bottom + 24]) {
        const p = { x, y };
        if (inside(p) && !expanded.some((o) => crosses(p, p, o))) nodes.push(p);
      }
  const distance = nodes.map(() => Infinity),
    previous = nodes.map(() => -1),
    used = new Set<number>();
  distance[0] = 0;
  for (let round = 0; round < nodes.length; round++) {
    let u = -1;
    for (let j = 0; j < nodes.length; j++)
      if (!used.has(j) && (u < 0 || distance[j] < distance[u])) u = j;
    if (u < 0 || !Number.isFinite(distance[u])) break;
    if (u === 1) break;
    used.add(u);
    for (let v = 0; v < nodes.length; v++)
      if (!used.has(v) && clear(nodes[u], nodes[v])) {
        const candidate =
          distance[u] +
          Math.hypot(nodes[v].x - nodes[u].x, nodes[v].y - nodes[u].y) +
          8;
        if (candidate < distance[v]) {
          distance[v] = candidate;
          previous[v] = u;
        }
      }
  }
  if (!Number.isFinite(distance[1])) return null;
  const route: RoutePoint[] = [];
  for (let at = 1; at >= 0; at = previous[at]) route.unshift(nodes[at]);
  // Round graph corners, then verify the whole wing envelope still clears.
  const rounded: RoutePoint[] = [route[0]];
  for (let i = 1; i < route.length - 1; i++) {
    const a = route[i - 1],
      b = route[i],
      c = route[i + 1];
    const before = Math.hypot(b.x - a.x, b.y - a.y);
    const after = Math.hypot(c.x - b.x, c.y - b.y);
    const cut = Math.min(18, before * 0.2, after * 0.2);
    const start = {
      x: b.x + ((a.x - b.x) * cut) / before,
      y: b.y + ((a.y - b.y) * cut) / before,
    };
    const end = {
      x: b.x + ((c.x - b.x) * cut) / after,
      y: b.y + ((c.y - b.y) * cut) / after,
    };
    rounded.push(start);
    for (let step = 1; step <= 16; step++) {
      const t = step / 16,
        u = 1 - t;
      rounded.push({
        x: u * u * start.x + 2 * u * t * b.x + t * t * end.x,
        y: u * u * start.y + 2 * u * t * b.y + t * t * end.y,
      });
    }
  }
  rounded.push(route[route.length - 1]);
  return rounded.slice(1).every((p, i) => clear(rounded[i], p))
    ? rounded
    : route;
}
export function sampleGuideTravel(
  path: RoutePoint[],
  from: CharacterBox,
  to: CharacterBox,
  progress: number,
): CharacterBox {
  const t = Math.max(0, Math.min(1, progress)),
    eased = t * t * t * (t * (t * 6 - 15) + 10);
  const lengths = path
    .slice(1)
    .map((p, i) => Math.hypot(p.x - path[i].x, p.y - path[i].y));
  const total = lengths.reduce((a, b) => a + b, 0);
  let travelled = eased * total;
  for (let i = 0; i < lengths.length; i++) {
    if (travelled <= lengths[i] || i === lengths.length - 1) {
      const q = lengths[i] ? travelled / lengths[i] : 1;
      return {
        x: path[i].x + (path[i + 1].x - path[i].x) * q,
        y: path[i].y + (path[i + 1].y - path[i].y) * q,
        width: from.width + (to.width - from.width) * eased,
      };
    }
    travelled -= lengths[i];
  }
  return { ...to };
}
export function stepHop(from: CharacterBox, to: CharacterBox, t: number) {
  return flightPoint(from, to, t, 8);
}

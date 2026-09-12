import type { CharacterBox } from './character-behavior';

export type GuideRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};
export type GuideStopBounds = { id: string; rect: GuideRect };

export function selectGuideStop(
  stops: GuideStopBounds[],
  height: number,
  current = '',
) {
  const line = height * 0.44;
  const visible = stops.filter(
    ({ rect }) => rect.bottom > 32 && rect.top < height - 24,
  );
  if (!visible.length) return current || stops[0]?.id || '';
  const distance = (r: GuideRect) =>
    line < r.top ? r.top - line : line > r.bottom ? line - r.bottom : 0;
  const ranked = [...visible].sort(
    (a, b) => distance(a.rect) - distance(b.rect),
  );
  const previous = visible.find((s) => s.id === current);
  return previous &&
    distance(previous.rect) <= distance(ranked[0].rect) + height * 0.12
    ? previous.id
    : ranked[0].id;
}

// Conservative envelope for the banked/flapping rig, not just its body canvas.
export function guideEnvelope(box: CharacterBox, wings: boolean): GuideRect {
  return wings
    ? {
        left: box.x - box.width * 0.76,
        right: box.x + box.width * 1.76,
        top: box.y - box.width * 0.65,
        bottom: box.y + box.width * 1.55,
      }
    : {
        left: box.x,
        right: box.x + box.width,
        top: box.y,
        bottom: box.y + box.width * 1.5,
      };
}
export function rectContains(outer: GuideRect, inner: GuideRect, margin = 0) {
  return (
    inner.left >= outer.left + margin &&
    inner.right <= outer.right - margin &&
    inner.top >= outer.top + margin &&
    inner.bottom <= outer.bottom - margin
  );
}
export function pocketBox(rect: GuideRect): CharacterBox | null {
  const width = Math.min(
    96,
    (rect.right - rect.left - 24) / 2.52,
    (rect.bottom - rect.top - 24) / 2.2,
  );
  if (width < 48) return null;
  return {
    width,
    x: (rect.left + rect.right - width) / 2,
    y: rect.top + 12 + width * 0.65,
  };
}
export function canChangePocket(
  rect: GuideRect,
  height: number,
  interacting: boolean,
) {
  return !interacting && (rect.bottom < -16 || rect.top > height + 32);
}

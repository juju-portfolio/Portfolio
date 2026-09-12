export type CharacterBox = { x: number; y: number; width: number };
export type CharacterPose =
  | 'neutral'
  | 'smile'
  | 'fly'
  | 'wave'
  | 'point'
  | 'shake'
  | 'think'
  | 'excited'
  | 'pout'
  | 'approve'
  | 'idea'
  | 'thanks'
  | 'laptop'
  | 'step'
  | 'hop';

// Completion means seeing every actual slide in this opening, in any order.
export function hasSeenEverySlide(
  ids: readonly string[],
  visited: ReadonlySet<string>,
) {
  return ids.length > 0 && ids.every((id) => visited.has(id));
}

export function fitCharacter(
  box: CharacterBox,
  viewport: { width: number; height: number },
): CharacterBox {
  const width = Math.min(
    box.width,
    viewport.width * 0.36,
    viewport.height * 0.45,
  );
  return {
    width,
    x: Math.max(4, Math.min(viewport.width - width - 4, box.x)),
    y: Math.max(12, Math.min(viewport.height - width * 1.5 - 12, box.y)),
  };
}

export function flightPoint(
  from: CharacterBox,
  to: CharacterBox,
  progress: number,
  arcHeight?: number,
): CharacterBox {
  const t = Math.max(0, Math.min(1, progress));
  // Quintic easing and a zero-slope arc prevent a kick at takeoff/landing.
  const eased = t * t * t * (t * (t * 6 - 15) + 10);
  const lift = 16 * eased * eased * (1 - eased) * (1 - eased);
  return {
    x: from.x + (to.x - from.x) * eased,
    y:
      from.y +
      (to.y - from.y) * eased -
      lift * (arcHeight ?? Math.min(90, Math.abs(to.x - from.x) * 0.15 + 35)),
    width: from.width + (to.width - from.width) * eased,
  };
}

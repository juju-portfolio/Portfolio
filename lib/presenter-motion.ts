import {
  flightPoint,
  type CharacterBox,
  type CharacterPose,
} from './character-behavior.ts';
import type { GuideRect } from './guide-layout';

/** A motion segment chooses its body and wings together. Pausing freezes both. */
export function actorVisual(moving: boolean, pose: CharacterPose = 'smile') {
  return {
    pose: moving
      ? ('fly' as const)
      : pose === 'fly'
        ? ('smile' as const)
        : pose,
    wings: moving,
  };
}

/** Flight stays inside the presenter surface, including the swept feather tips. */
export function presenterRoute(stage: GuideRect, home: CharacterBox) {
  const width = Math.min(
    home.width,
    (stage.bottom - stage.top - 10) / 2.2,
    (stage.right - stage.left - 24) / 2.52,
  );
  if (width < 48 || stage.top < 0 || stage.left < 0) return null;
  const y = stage.top + (stage.bottom - stage.top) / 2 - width * 0.45;
  const left = stage.left + width * 0.76 + 12;
  const right = stage.right - width * 1.76 - 12;
  const end = { width, x: Math.max(left, Math.min(right, home.x)), y };
  return { start: { width, x: Math.min(right, end.x + 200), y }, end, home };
}

/** Slide changes leave from the actual position, then return on a local arc. */
export function presenterLoop(
  route: NonNullable<ReturnType<typeof presenterRoute>>,
  origin: CharacterBox,
  progress: number,
) {
  return progress <= 0.5
    ? flightPoint(origin, route.start, progress * 2, 0)
    : flightPoint(route.start, route.end, (progress - 0.5) * 2, 0);
}

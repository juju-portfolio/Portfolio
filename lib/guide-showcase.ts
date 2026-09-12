import type { CharacterBox } from './character-behavior';
import type { GuideRect } from './guide-layout';

export type CoverFlight = {
  clip: GuideRect;
  center: CharacterBox;
  radiusX: number;
  radiusY: number;
};

// Reserve travel as well as wing clearance inside the existing coloured cover.
export function fitCoverFlight(clip: GuideRect): CoverFlight | null {
  const width = Math.min(
    84,
    (clip.right - clip.left - 80) / 2.52,
    (clip.bottom - clip.top - 44) / 2.2,
  );
  if (width < 60) return null;
  return {
    clip,
    center: {
      width,
      x: (clip.left + clip.right - width) / 2,
      y: (clip.top + clip.bottom) / 2 - width * 0.45,
    },
    radiusX: (clip.right - clip.left - width * 2.52 - 24) / 2,
    radiusY: (clip.bottom - clip.top - width * 2.2 - 16) / 2,
  };
}

export function sampleCoverFlight(stage: CoverFlight, progress: number) {
  const t = Math.max(0, Math.min(1, progress));
  const eased = t * t * t * (t * (t * 6 - 15) + 10);
  const angle = eased * Math.PI * 2;
  return {
    box: {
      ...stage.center,
      x: stage.center.x + stage.radiusX * Math.cos(angle),
      y: stage.center.y + stage.radiusY * Math.sin(angle),
    },
    bank: Math.sin(angle) * -6,
  };
}

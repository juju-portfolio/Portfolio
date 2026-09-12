export const PHASES = {
  start: 80,
  morphEnd: 200,
  exitEnd: 380,
  dockEnd: 560,
} as const;
export const clamp = (n: number) => Math.max(0, Math.min(1, n));
export const smooth = (n: number) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};
export function samplePortraitProgress(scroll: number) {
  const morph = smooth(
    (scroll - PHASES.start) / (PHASES.morphEnd - PHASES.start),
  );
  const exit = smooth(
    (scroll - PHASES.morphEnd) / (PHASES.exitEnd - PHASES.morphEnd),
  );
  const dock = smooth(
    (scroll - PHASES.exitEnd) / (PHASES.dockEnd - PHASES.exitEnd),
  );
  return {
    morph,
    exit,
    dock,
    photoOpacity: 1 - morph,
    avatarOpacity: morph,
    phase:
      scroll <= PHASES.start
        ? 'photo'
        : scroll <= PHASES.morphEnd
          ? 'morph'
          : scroll <= PHASES.exitEnd
            ? 'exit'
            : scroll < PHASES.dockEnd
              ? 'dock'
              : 'guide',
  };
}

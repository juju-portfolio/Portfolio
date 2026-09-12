// 48 authored wing poses per cycle, continuously interpolated by the compositor.
// A faster power stroke and slower feathered recovery share a stationary shoulder joint.
export const WING_FRAME_COUNT = 48;
export function sampleWingCycle(t: number) {
  const phase = ((t % 1) + 1) % 1;
  const down = phase < 0.42;
  const local = down ? phase / 0.42 : (phase - 0.42) / 0.58;
  const ease = (1 - Math.cos(local * Math.PI)) / 2;
  const stroke = down ? ease : 1 - ease;
  return {
    angle: 14 - 43 * stroke,
    spread:
      0.82 +
      0.18 * Math.sin(stroke * Math.PI) -
      (!down ? 0.15 * Math.sin(local * Math.PI) : 0),
    flex: Math.sin(phase * Math.PI * 2 - 0.35) * 3,
  };
}
export const featherKeyframes = ['left', 'right']
  .map((side) => {
    const sign = side === 'left' ? 1 : -1;
    const samples = Array.from({ length: WING_FRAME_COUNT + 1 }, (_, i) => {
      const { angle, spread, flex } = sampleWingCycle(i / WING_FRAME_COUNT);
      return `${((i / WING_FRAME_COUNT) * 100).toFixed(4)}%{transform:rotate(${(angle * sign).toFixed(3)}deg) scaleX(${spread.toFixed(4)}) skewY(${(flex * sign).toFixed(3)}deg)}`;
    });
    return `@keyframes feather-${side}{${samples.join('')}}`;
  })
  .join('\n');

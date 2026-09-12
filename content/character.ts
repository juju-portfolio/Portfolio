/** Replace the portrait file and adjust these anchors when using a real photo.
 * All coordinates are fractions of the source image, measured from top-left.
 * Pose canvases share the same 2:3 geometry; keep their eyes and body aligned.
 */
export const characterArt = {
  assetVersion: 'fuller-20260912',
  portraitKind: 'illustrated' as 'illustrated' | 'photo',
  portrait: {
    src: '/media/guide/female/portrait.webp',
    width: 1024,
    height: 1536,
    alt: 'Illustrated portrait inspired by Juwairiyyah’s reference photo',
  },
  alignment: {
    portraitEyes: [0.52275, 0.22324],
    avatarEyes: [0.49473, 0.14277],
    portraitObjectY: 0.35,
    avatarScale: 1.765,
  },
  poses: {
    neutral: '/media/guide/female/neutral.webp',
    point: '/media/guide/female/point.webp',
    smile: '/media/guide/female/neutral.webp',
    excited: '/media/guide/female/wave.webp',
    think: '/media/guide/female/think.webp',
    fly: '/media/guide/female/fly.webp',
    wave: '/media/guide/female/wave.webp',
    shake: '/media/guide/female/neutral.webp',
    pout: '/media/guide/female/pout.webp',
    approve: '/media/guide/female/approve.webp',
    idea: '/media/guide/female/idea.webp',
    thanks: '/media/guide/female/thanks.webp',
    laptop: '/media/guide/female/laptop.webp',
    step: '/media/guide/female/step.webp',
    hop: '/media/guide/female/hop.webp',
  },
} as const;

import type { ProjectDeck } from '@/lib/content-types';
const deck: ProjectDeck = {
  projectId: 'habit-01',
  slides: [
    {
      id: 'overview',
      kind: 'native',
      title: 'Small enough to start.',
      guide: {
        text: 'A second sample project, using the same presentation and guide. Nothing opens in another website.',
        pose: 'neutral',
      },
      blocks: [
        {
          id: 'intro',
          kind: 'text',
          text: 'An illustrative habit-building concept: make one useful action easier to begin, rather than asking someone to change everything at once.',
        },
        {
          id: 'scope',
          kind: 'list',
          items: [
            'Fictional development story',
            'A hypothesis about starting small',
            'No applicant experience or results implied',
          ],
        },
      ],
    },
    {
      id: 'decision',
      kind: 'native',
      title: 'Reduce the size of the first ask.',
      guide: {
        text: 'The highlighted block makes the proposed decision easy to scan.',
        pose: 'point',
        targetId: 'choice',
      },
      blocks: [
        {
          id: 'choice',
          kind: 'decision',
          choice: 'Begin with one small action.',
          rationale:
            'A narrow first step could make the experience feel more approachable.',
          alternative:
            'Adding streaks, leaderboards, and a large habit catalogue would introduce several ideas before testing the first one.',
        },
      ],
    },
    {
      id: 'visual',
      kind: 'image',
      title: 'A simple loop to explore.',
      guide: {
        text: 'This slide is an image, still inside the same deck. The text version below keeps it accessible.',
        pose: 'point',
        targetId: 'review',
      },
      image: {
        src: '/media/projects/habit-01/flow.svg',
        width: 1200,
        height: 675,
        alt: 'Proposed habit loop: choose one action, try it in daily life, and reflect on what helped.',
      },
      transcript:
        'Proposed exploration, not a completed study. Step 1: Choose one action. Make the first step specific and small. Step 2: Try it in daily life. Notice when it is easy or difficult to start. Step 3: Reflect on what helped. Adjust the next attempt using what you learned. No testing or outcomes are claimed.',
      hotspots: [
        {
          id: 'review',
          x: 0.67,
          y: 0.27,
          width: 0.29,
          height: 0.5,
          label: 'Reflect on what helped',
        },
      ],
    },
    {
      id: 'next',
      kind: 'native',
      title: 'Make room for what comes next.',
      guide: {
        text: 'This example ends here. Closing returns you to the exact place you left in the portfolio.',
        pose: 'neutral',
      },
      blocks: [
        {
          id: 'next',
          kind: 'outcome',
          evidence: 'proposed',
          text: 'A future experiment could compare different ways of introducing the first action. Its result would belong here only after the experiment is actually run.',
        },
        {
          id: 'note',
          kind: 'text',
          text: 'The applicant’s real projects and evidence will replace these samples once the résumé and supporting materials are supplied.',
        },
      ],
    },
  ],
};
export default deck;

import type { ProjectDeck } from '@/lib/content-types';
const deck: ProjectDeck = {
  projectId: 'campus-01',
  slides: [
    {
      id: 'overview',
      kind: 'native',
      title: 'A new place. A clearer first step.',
      guide: {
        text: 'This is a sample story. Walk through it to see how a project presentation will feel.',
        pose: 'neutral',
      },
      blocks: [
        {
          id: 'intro',
          kind: 'text',
          text: 'An illustrative exploration of campus navigation. What if getting to your next class felt a little less uncertain?',
        },
        {
          id: 'scope',
          kind: 'list',
          items: [
            'Fictional development concept',
            'Designed to demonstrate this portfolio experience',
            'No research or outcomes are claimed',
          ],
        },
      ],
    },
    {
      id: 'problem',
      kind: 'native',
      title: 'A map is only the beginning.',
      guide: {
        text: 'The question here is about confidence, not just directions. This is a hypothesis to investigate.',
        pose: 'point',
        targetId: 'question',
      },
      blocks: [
        {
          id: 'context',
          kind: 'text',
          text: 'A new student may know the building name without knowing which entrance to use or what the walk looks like.',
        },
        {
          id: 'question',
          kind: 'decision',
          choice: 'How might we make the next step obvious?',
          rationale:
            'A proposed focus on clear walking directions and recognizable landmarks.',
          alternative:
            'A directory of every campus service would broaden the scope before the core need is understood.',
        },
      ],
    },
    {
      id: 'decision',
      kind: 'native',
      title: 'One useful path, before more features.',
      guide: {
        text: 'This is where the trade-off belongs: the choice, the reason, and what gets left for later.',
        pose: 'point',
        targetId: 'tradeoff',
      },
      blocks: [
        {
          id: 'tradeoff',
          kind: 'decision',
          choice: 'Prioritize the walk to a destination.',
          rationale:
            'Keep the proposed first experience focused on finding a building and knowing what to do next.',
          alternative: 'Events, recommendations, and social features can wait.',
        },
        {
          id: 'honesty',
          kind: 'text',
          text: 'This is an illustrative product decision, not a claim about a project the applicant has completed.',
        },
      ],
    },
    {
      id: 'walkthrough',
      kind: 'native',
      title: 'From destination to next step.',
      guide: {
        text: 'Follow the three steps. Your actual screens can sit here, with me pointing out what matters.',
        pose: 'point',
        targetId: 'steps',
      },
      blocks: [
        {
          id: 'steps',
          kind: 'list',
          items: [
            'Choose a destination by name.',
            'Preview the route and entrance.',
            'Follow one clear instruction at a time.',
          ],
        },
        {
          id: 'proposal',
          kind: 'outcome',
          evidence: 'proposed',
          text: 'A future prototype could test whether a route preview improves confidence before someone begins walking.',
        },
      ],
    },
    {
      id: 'learning',
      kind: 'native',
      title: 'What would we need to learn?',
      guide: {
        text: 'An honest ending matters. With the real résumé, this becomes a supported result or a thoughtful next step.',
        pose: 'neutral',
      },
      blocks: [
        {
          id: 'next',
          kind: 'list',
          items: [
            'Which part of an unfamiliar route causes uncertainty?',
            'What information is useful before the walk starts?',
            'Can a first-time visitor find the right entrance?',
          ],
        },
        {
          id: 'status',
          kind: 'outcome',
          evidence: 'proposed',
          text: 'No interviews, usability tests, or production measurements were conducted for this development example.',
        },
      ],
    },
  ],
};
export default deck;

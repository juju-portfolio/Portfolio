import type { ProjectDeck } from '@/lib/content-types';
const deck: ProjectDeck = {
  projectId: 'gensolar',
  slides: [
    {
      id: 'overview',
      kind: 'native',
      title: 'I built responsive components for solar management.',
      introduction:
        'My contribution to GenSolar was part of my frontend internship at IdeasPlus Technology Solutions, January–April 2026.',
      section: 'MY CONTRIBUTION',
      guide: {
        text: 'Start with my contribution: the frontend. The broader delivery experience comes from my IdeasPlus internship.',
        pose: 'point',
        targetId: 'exhibit',
        dock: 'end',
      },
      blocks: [
        {
          id: 'exhibit',
          kind: 'exhibit',
          layout: 'comparison',
          label: 'PROJECT + DELIVERY CONTEXT',
          items: [
            {
              label: 'GenSolar',
              title: 'Responsive frontend',
              text: 'I developed components for the solar management platform. My contribution focused on the frontend.',
            },
            {
              label: 'IdeasPlus internship',
              title: 'Working through delivery',
              text: 'Across my internship, I collaborated on planning, testing, and deployment while developing responsive web applications.',
            },
          ],
        },
      ],
    },
    {
      id: 'priority',
      kind: 'native',
      title: 'One task. A clear next action.',
      introduction:
        'For this illustrative concept, I would use one task: reviewing a solar installation record and retrying an unavailable status. I would confirm the actual task with the team before implementing it.',
      section: 'PRODUCT REVIEW · PROPOSED',
      guide: {
        text: 'Follow the same sequence on a phone and a larger screen: identify, understand, act.',
        pose: 'point',
        targetId: 'exhibit',
        dock: 'start',
      },
      blocks: [
        {
          id: 'exhibit',
          kind: 'exhibit',
          layout: 'flow',
          label: 'ILLUSTRATIVE CONCEPT · SOLAR INSTALLATION RECORD',
          items: [
            {
              label: '01 · Identify',
              title: 'Solar installation record',
              text: 'Keep the installation name visible so the person knows which record they are reviewing.',
            },
            {
              label: '02 · Understand',
              title: 'Status unavailable',
              text: 'Explain that the status could not load, without implying the installation itself has failed.',
            },
            {
              label: '03 · Act',
              title: 'Retry status',
              text: 'Use the same “Retry status” action on a phone and a larger screen; preserve the installation context.',
            },
          ],
          takeaway:
            'I would prioritize task clarity before adding secondary information.',
        },
      ],
    },
    {
      id: 'states',
      kind: 'native',
      title: 'Responsive should include the difficult moments.',
      introduction:
        'My proposed acceptance criteria would cover what happens while the interface is waiting, unavailable, or squeezed onto a smaller screen.',
      section: 'PRODUCT REVIEW · PROPOSED',
      guide: {
        text: 'The error state deserves the same attention as the ideal screen. A clear recovery path helps someone keep going.',
        pose: 'point',
        targetId: 'exhibit',
        dock: 'end',
      },
      blocks: [
        {
          id: 'exhibit',
          kind: 'exhibit',
          layout: 'states',
          label: 'PROPOSED ACCEPTANCE SCENARIOS',
          items: [
            {
              label: 'Narrow screen',
              title: 'Preserve the essentials',
              text: 'The installation name, unavailable-status message, and “Retry status” action remain readable without horizontal scrolling.',
            },
            {
              label: 'Waiting',
              title: 'Make progress legible',
              text: 'After “Retry status,” show loading feedback without implying the installation status is known.',
            },
            {
              label: 'Unavailable data',
              title: 'Offer a way forward',
              text: 'If the retry fails, retain the installation name and explain that the status is still unavailable.',
            },
          ],
        },
      ],
    },
    {
      id: 'next',
      kind: 'native',
      title: 'Watch a task before expanding the feature list.',
      introduction:
        'I would review one agreed task with representative users on two screen sizes, then bring the observed friction back to the team.',
      section: 'HOW I WOULD TAKE THIS FORWARD',
      guide: {
        text: 'My first product question would be: can someone confidently take the next step?',
        pose: 'point',
        targetId: 'exhibit',
        dock: 'start',
      },
      blocks: [
        {
          id: 'exhibit',
          kind: 'exhibit',
          layout: 'flow',
          label: 'PROPOSED TASK REVIEW',
          items: [
            {
              label: 'Observe',
              title: 'Where do people hesitate?',
              text: 'Using the illustrative record, ask someone to identify the installation, explain the unavailable status, and retry.',
            },
            {
              label: 'Diagnose',
              title: 'What caused the wrong turn?',
              text: 'Separate unclear labels or hierarchy from a genuinely missing capability.',
            },
            {
              label: 'Prioritize',
              title: 'Fix the first obstacle',
              text: 'If people cannot find the action, improve its placement and wording before adding more features.',
            },
          ],
          takeaway:
            'The next decision would follow observed task completion, hesitation, and recovery.',
        },
      ],
    },
  ],
};
export default deck;

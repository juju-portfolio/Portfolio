import type { ProjectDeck } from '@/lib/content-types';
const deck: ProjectDeck = {
  projectId: 'video-games',
  slides: [
    {
      id: 'overview',
      kind: 'native',
      title: 'I built a dashboard for exploring gaming trends.',
      introduction:
        'My interactive Power BI dashboard examines video-game data covering 1995–2020, including releases, platform trends, developer performance, and user popularity.',
      section: 'WHAT I BUILT',
      guide: {
        text: 'The dashboard spans four perspectives. The next step is helping a reader choose the right one for their question.',
        pose: 'point',
        targetId: 'exhibit',
        dock: 'end',
      },
      blocks: [
        {
          id: 'exhibit',
          kind: 'exhibit',
          layout: 'questions',
          label: 'FOUR ANALYTICAL LENSES',
          items: [
            {
              label: 'Releases',
              title: 'How does release activity change?',
              text: 'Explore game releases across the covered years.',
            },
            {
              label: 'Platforms',
              title: 'How do platform trends compare?',
              text: 'Look at platforms within the historical scope of the dashboard.',
            },
            {
              label: 'Developers',
              title: 'How is performance represented?',
              text: 'Developer performance is one of the dashboard’s analysis areas.',
            },
            {
              label: 'Popularity',
              title: 'What does the user signal show?',
              text: 'User popularity is another analysis area; its definition would be a focus of my next review.',
            },
          ],
          takeaway:
            'Dashboard scope · Power BI · 1995–2020. This exhibit maps the analysis areas rather than reproducing chart results.',
        },
      ],
    },
    {
      id: 'comparison',
      kind: 'native',
      title: 'Start with a question, then choose the view.',
      introduction:
        'For a future iteration, I would make a historical platform comparison a guided task rather than expecting a reader to interpret every view at once.',
      section: 'PRODUCT REVIEW · PROPOSED',
      guide: {
        text: 'The period and measure should stay consistent as the reader moves between platforms.',
        pose: 'point',
        targetId: 'exhibit',
        dock: 'start',
      },
      blocks: [
        {
          id: 'exhibit',
          kind: 'exhibit',
          layout: 'flow',
          label: 'PROPOSED COMPARISON WORKFLOW',
          items: [
            {
              label: 'Frame',
              title: 'Choose comparable years',
              text: 'Start within the dataset’s 1995–2020 coverage and state the period being examined.',
            },
            {
              label: 'Compare',
              title: 'Select the platforms',
              text: 'Keep the same time scope and measure across the comparison.',
            },
            {
              label: 'Interpret',
              title: 'Explain the difference',
              text: 'Ask the reader to describe what the chosen measure establishes and where it stops.',
            },
          ],
          takeaway:
            'I would prioritize a legible comparison over additional charts that introduce new interpretation work.',
        },
      ],
    },
    {
      id: 'definitions',
      kind: 'native',
      title: '“Popularity” needs a definition beside it.',
      introduction:
        'Before using a metric to inform a decision, I would make its definition and limitations easy to find. The same review applies to developer performance.',
      section: 'PRODUCT REVIEW · PROPOSED',
      guide: {
        text: 'A familiar metric name can hide different meanings. I would make the definition part of the reading experience.',
        pose: 'point',
        targetId: 'exhibit',
        dock: 'end',
      },
      blocks: [
        {
          id: 'exhibit',
          kind: 'exhibit',
          layout: 'comparison',
          label: 'PROPOSED METRIC EXPLAINER',
          items: [
            {
              label: 'Definition',
              title: 'What is being counted?',
              text: 'Name the underlying measure and how it is aggregated.',
            },
            {
              label: 'Coverage',
              title: 'Which records and years?',
              text: 'State the included period and make gaps or exclusions understandable.',
            },
            {
              label: 'Limits',
              title: 'What can it establish?',
              text: 'Explain what the measure cannot prove; avoid treating a popularity signal as a complete picture of success.',
            },
          ],
        },
      ],
    },
    {
      id: 'next',
      kind: 'native',
      title: 'Test the explanation, not the number of charts.',
      introduction:
        'I would ask a reader to find a platform comparison and explain it using the dashboard, then use the observed friction to choose the next improvement.',
      section: 'HOW I WOULD TAKE THIS FORWARD',
      guide: {
        text: 'A strong outcome for this review is a defensible explanation supported by the view—not simply more exploration.',
        pose: 'point',
        targetId: 'exhibit',
        dock: 'start',
      },
      blocks: [
        {
          id: 'exhibit',
          kind: 'exhibit',
          layout: 'states',
          label: 'PROPOSED REVIEW CHECKPOINTS',
          items: [
            {
              label: 'Find',
              title: 'Can they locate the relevant view?',
              text: 'Observe wrong turns before offering guidance.',
            },
            {
              label: 'Read',
              title: 'Do they interpret the labels correctly?',
              text: 'Ask what the measure and selected time scope mean.',
            },
            {
              label: 'Support',
              title: 'Can they point to the evidence?',
              text: 'Have the reader cite the view supporting their explanation and acknowledge its limits.',
            },
          ],
          takeaway:
            'I would resolve the largest comprehension obstacle before expanding the dashboard.',
        },
      ],
    },
  ],
};
export default deck;

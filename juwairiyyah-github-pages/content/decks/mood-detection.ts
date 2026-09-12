import type { ProjectDeck } from '@/lib/content-types';
const deck: ProjectDeck = {
  projectId: 'mood-detection',
  slides: [
    {
      id: 'overview',
      kind: 'native',
      title: 'Exploring expressions through computer vision.',
      introduction:
        'AI Mood Detection is a real-time emotion-detection project using DeepFace and OpenCV. It raises a product question I find especially important: how should an interface communicate an uncertain interpretation?',
      section: 'PROJECT OVERVIEW',
      guide: {
        text: 'The project title says “mood.” I would make clear that an expression estimate is not a fact about someone’s inner feelings.',
        pose: 'point',
        targetId: 'exhibit',
        dock: 'end',
      },
      blocks: [
        {
          id: 'exhibit',
          kind: 'exhibit',
          layout: 'flow',
          label: 'CONCEPTUAL EXPERIENCE',
          items: [
            {
              label: 'Input',
              title: 'A face in view',
              text: 'The interaction begins with a visible facial expression.',
            },
            {
              label: 'Technology',
              title: 'DeepFace + OpenCV',
              text: 'These are the project’s computer-vision tools.',
            },
            {
              label: 'Output',
              title: 'An interpretation to understand',
              text: 'I would make the scope and limits of the output clear.',
            },
          ],
          takeaway:
            'Conceptual illustration of the experience, not a specification of the implementation.',
        },
      ],
    },
    {
      id: 'states',
      kind: 'native',
      title: 'Make the system’s limits visible.',
      introduction:
        'I would present this as a transparent demo, with clear control over capture and language that avoids overstating what an estimate can tell us.',
      section: 'PRODUCT REVIEW · PROPOSED',
      guide: {
        text: 'Clear start and stop behavior would be part of the experience—not an afterthought.',
        pose: 'point',
        targetId: 'exhibit',
        dock: 'start',
      },
      blocks: [
        {
          id: 'exhibit',
          kind: 'exhibit',
          layout: 'states',
          label: 'PROPOSED INTERACTION STATES',
          items: [
            {
              label: 'No usable face',
              title: 'Help the person recover',
              text: 'Explain that a face is not available and suggest repositioning rather than showing a misleading result.',
            },
            {
              label: 'Estimate available',
              title: 'Use careful wording',
              text: 'Describe the output as an expression estimate, not a diagnosis or a statement of how someone feels.',
            },
            {
              label: 'Stop',
              title: 'End capture clearly',
              text: 'Offer a visible stop control and an unambiguous indication that capture has ended.',
            },
          ],
        },
      ],
    },
    {
      id: 'evaluation',
      kind: 'native',
      title: 'Find the failure conditions before expanding.',
      introduction:
        'I would evaluate the demo with consent across a small set of conditions, documenting what happens before making any reliability claim.',
      section: 'PRODUCT REVIEW · PROPOSED',
      guide: {
        text: 'I would record failures as carefully as successful runs. They define what the demo can responsibly promise.',
        pose: 'point',
        targetId: 'exhibit',
        dock: 'end',
      },
      blocks: [
        {
          id: 'exhibit',
          kind: 'exhibit',
          layout: 'comparison',
          label: 'PROPOSED EVALUATION CONDITIONS',
          items: [
            {
              label: 'Lighting',
              title: 'Changes in illumination',
              text: 'To evaluate: whether the face remains usable and how the output changes.',
            },
            {
              label: 'Camera position',
              title: 'Changes in framing',
              text: 'To evaluate: recovery when the person is off-center or partially out of view.',
            },
            {
              label: 'Expression',
              title: 'Variation in expression',
              text: 'To evaluate: whether the output is understandable and where an interpretation is misleading.',
            },
          ],
          takeaway:
            'I would record the condition, visible output, and recovery path for each run.',
        },
      ],
    },
    {
      id: 'next',
      kind: 'native',
      title: 'Keep the promise smaller than the uncertainty.',
      introduction:
        'My proposed priority would be a comprehensible, controllable demonstration before adding more predictions or extending it into consequential uses.',
      section: 'HOW I WOULD TAKE THIS FORWARD',
      guide: {
        text: 'The strongest next feature may be a clearer limit. I would keep the promise aligned with what the demo can support.',
        pose: 'point',
        targetId: 'exhibit',
        dock: 'start',
      },
      blocks: [
        {
          id: 'exhibit',
          kind: 'exhibit',
          layout: 'flow',
          label: 'PROPOSED PRIORITY ORDER',
          items: [
            {
              label: 'First',
              title: 'User control',
              text: 'Make starting and stopping the interaction obvious.',
            },
            {
              label: 'Next',
              title: 'Understandable output',
              text: 'Clarify uncertainty and provide recoverable failure states.',
            },
            {
              label: 'Then',
              title: 'A justified next use case',
              text: 'Expand only after identifying a legitimate task and reviewing the observed failure patterns.',
            },
          ],
          takeaway:
            'The product decision I would bring to the team: improve trust and comprehension before increasing the feature set.',
        },
      ],
    },
  ],
};
export default deck;

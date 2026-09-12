import type { ProjectDeck } from '@/lib/content-types';
const deck: ProjectDeck = {
  projectId: 'jbot',
  slides: [
    {
      id: 'overview',
      kind: 'native',
      title: 'I built a conversational assistant with Gemini.',
      introduction:
        'JBot connects a chat interface with the Gemini API. I would take it forward by defining a focused first task and evaluating what makes an answer useful.',
      section: 'WHAT I BUILT',
      guide: {
        text: 'The integration makes conversation possible. A focused user task would make its value easier to evaluate.',
        pose: 'point',
        targetId: 'exhibit',
        dock: 'end',
      },
      blocks: [
        {
          id: 'exhibit',
          kind: 'exhibit',
          layout: 'flow',
          label: 'THE CONVERSATION AT A GLANCE',
          items: [
            {
              label: 'Input',
              title: 'A question in plain language',
              text: 'A message is the starting point of the conversation.',
            },
            {
              label: 'Integration',
              title: 'Gemini API',
              text: 'The API powers the assistant’s conversational responses.',
            },
            {
              label: 'Experience',
              title: 'An answer to read and assess',
              text: 'The product question is whether that response helps with the task.',
            },
          ],
          takeaway:
            'A conceptual view of the interaction; the following slide shows the project interface.',
        },
      ],
    },
    {
      id: 'interface',
      kind: 'image',
      title: 'A simple place to start a conversation.',
      introduction:
        'The project interface puts the message field at the center of the first action, with keyboard guidance and a light/dark appearance control.',
      guide: {
        text: 'The message field is the starting point. I would test whether a new visitor knows what to ask without additional explanation.',
        pose: 'point',
        targetId: 'message-field',
        dock: 'start',
      },
      image: {
        src: '/media/projects/jbot/interface.png',
        width: 1280,
        height: 720,
        alt: 'JBot project interface: welcome message, message field, send control, and appearance toggle.',
      },
      transcript:
        'Project interface. The screen is titled AI Chat Assistant. A welcome message sits above a message field and send control. Keyboard guidance says Enter to send and Shift+Enter for a new line. An appearance control is visible at the top right.',
      hotspots: [
        {
          id: 'message-field',
          x: 0.11,
          y: 0.79,
          width: 0.78,
          height: 0.08,
          label: 'Message field and send control',
        },
      ],
    },
    {
      id: 'first-task',
      kind: 'native',
      title: 'Give the first conversation a purpose.',
      introduction:
        'I would start with one use case: helping someone understand an unfamiliar concept. A small set of starters could make the blank message field less demanding.',
      section: 'PRODUCT REVIEW · PROPOSED',
      guide: {
        text: 'I would test a narrow first task before promising a general-purpose assistant.',
        pose: 'point',
        targetId: 'exhibit',
        dock: 'end',
      },
      blocks: [
        {
          id: 'exhibit',
          kind: 'exhibit',
          layout: 'questions',
          label: 'PROPOSED PROMPT STARTERS',
          items: [
            {
              label: 'Understand',
              title: 'Explain a concept simply',
              text: '“Explain an API to someone who has never written code.”',
            },
            {
              label: 'Apply',
              title: 'Connect it to an example',
              text: '“Show me an everyday example of an API.”',
            },
            {
              label: 'Check',
              title: 'Find the remaining confusion',
              text: '“What is the difference between an API and a user interface?”',
            },
          ],
          takeaway:
            'Trade-off: a focused starting experience is easier to evaluate, but deliberately offers less breadth than “ask anything.”',
        },
      ],
    },
    {
      id: 'recovery',
      kind: 'native',
      title: 'Design the conversation around uncertainty.',
      introduction:
        'For the next iteration, I would define the behavior of each state before polishing the happy path. These are proposed interaction rules.',
      section: 'PRODUCT REVIEW · PROPOSED',
      guide: {
        text: 'Retry and clarification solve different problems. I would give each a distinct response.',
        pose: 'point',
        targetId: 'exhibit',
        dock: 'start',
      },
      blocks: [
        {
          id: 'exhibit',
          kind: 'exhibit',
          layout: 'states',
          label: 'PROPOSED CONVERSATION STATES',
          items: [
            {
              label: 'Waiting',
              title: 'Acknowledge the request',
              text: 'Show a waiting state so the user knows the message was received.',
            },
            {
              label: 'Failure',
              title: 'Keep the draft recoverable',
              text: 'Explain the failure and offer retry without requiring the question to be typed again.',
            },
            {
              label: 'Unclear request',
              title: 'Ask for the missing context',
              text: 'Use a clarifying question when the request lacks enough information for a useful answer.',
            },
          ],
        },
      ],
    },
    {
      id: 'next',
      kind: 'native',
      title: 'Define “useful” before adding more capability.',
      introduction:
        'I would build a small evaluation set around the first use case, then review the responses against the same criteria each time.',
      section: 'HOW I WOULD TAKE THIS FORWARD',
      guide: {
        text: 'A fluent answer is only the beginning. I would review whether it actually resolves the question.',
        pose: 'point',
        targetId: 'exhibit',
        dock: 'end',
      },
      blocks: [
        {
          id: 'exhibit',
          kind: 'exhibit',
          layout: 'comparison',
          label: 'PROPOSED EVALUATION SET',
          items: [
            {
              label: 'Clear request',
              title: 'Relevance + clarity',
              text: '“Explain an API to someone who has never coded.” I would look for a simple explanation and an understandable example.',
            },
            {
              label: 'Ambiguous request',
              title: 'Clarification',
              text: '“Explain the model.” I would look for a clarifying question about which model, rather than a silent assumption.',
            },
            {
              label: 'Unanswerable request',
              title: 'Honest limits',
              text: '“Which API did my private app call yesterday?” I would look for an acknowledgment of missing access, rather than an invented answer.',
            },
          ],
          takeaway:
            'I would use recurring failures to choose the next change: prompt guidance, clarification behavior, or recovery.',
        },
      ],
    },
  ],
};
export default deck;

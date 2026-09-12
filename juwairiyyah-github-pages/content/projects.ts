import type { ProjectSummary, PublicationReadiness } from '@/lib/content-types';
export const readiness: PublicationReadiness = {
  contentStatus: 'verified',
  portraitStatus: 'illustrated',
  characterStatus: 'reviewed',
};
const catalog: ProjectSummary[] = [
  {
    id: 'gensolar',
    slug: 'gensolar',
    title: 'GenSolar',
    kind: 'professional',
    summary: 'Responsive frontend components for a solar management platform.',
    contribution:
      'Frontend component development; contributed to GenSolar during the IdeasPlus internship.',
    timeframe: 'IdeasPlus internship · Jan–Apr 2026',
    publication: 'ready',
    cover: {
      eyebrow: 'FRONTEND DEVELOPMENT',
      headline: ['Solar management.', 'Responsive by design.'],
      tags: ['Frontend', 'Solar management'],
      theme: 'solar',
      note: 'Professional experience',
    },
  },
  {
    id: 'video-games',
    slug: 'video-games',
    title: 'Video Games Analytics Dashboard',
    kind: 'project',
    summary:
      'An interactive Power BI dashboard exploring game releases, platform trends, developer performance, and user popularity.',
    contribution: 'Built the interactive Power BI dashboard.',
    publication: 'ready',
    cover: {
      eyebrow: 'DATA ANALYTICS',
      headline: ['Games. Platforms.', 'Patterns.'],
      tags: ['Power BI', '1995–2020 data'],
      theme: 'games',
      note: 'Interactive analytics dashboard',
    },
  },
  {
    id: 'jbot',
    slug: 'jbot',
    title: 'JBot AI Assistant',
    kind: 'project',
    summary:
      'An AI chatbot powered by the Gemini API for conversational interactions.',
    contribution: 'Developed the AI chatbot using the Gemini API.',
    publication: 'ready',
    cover: {
      eyebrow: 'CONVERSATIONAL AI',
      headline: ['A conversation.', 'Powered by AI.'],
      tags: ['Gemini API', 'AI chatbot'],
      theme: 'jbot',
      note: 'AI assistant project',
    },
  },
  {
    id: 'mood-detection',
    slug: 'mood-detection',
    title: 'AI Mood Detection',
    kind: 'project',
    summary: 'A real-time emotion detection system using DeepFace and OpenCV.',
    contribution: 'Real-time emotion detection with DeepFace and OpenCV.',
    publication: 'ready',
    cover: {
      eyebrow: 'COMPUTER VISION',
      headline: ['Expressions.', 'Meet computer vision.'],
      tags: ['DeepFace', 'OpenCV'],
      theme: 'mood',
      note: 'Emotion detection project',
    },
  },
  {
    id: 'agriculture',
    slug: 'agriculture',
    title: 'Agriculture Analytics Dashboard',
    kind: 'project',
    summary: 'A Tableau dashboard supporting data-driven farming decisions.',
    contribution: 'Agriculture analytics dashboard in Tableau.',
    publication: 'ready',
    cover: {
      eyebrow: 'AGRICULTURE + ANALYTICS',
      headline: ['Farming decisions.', 'A data perspective.'],
      tags: ['Tableau', 'Agriculture'],
      theme: 'agriculture',
      note: 'Analytics dashboard project',
    },
  },
];

export const projects: ProjectSummary[] = [
  catalog[0],
  catalog[2],
  catalog[4],
  catalog[1],
  catalog[3],
];

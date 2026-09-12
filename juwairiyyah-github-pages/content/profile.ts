import { characterArt } from './character.ts';
import type { Profile } from '@/lib/content-types';
export const profile: Profile = {
  name: 'Juwairiyyah Saiyed',
  positioning: 'Seeking Product Manager / Product Owner internships',
  introduction:
    'I’m a Computer Science Engineering graduate with experience in frontend development, data analytics, AI projects, and project coordination. I’m bringing that technical foundation to product management.',
  portrait: characterArt.portrait,
  about: [
    'My experience spans responsive web interfaces, data visualizations, and AI applications. I’m interested in combining technical work with coordination and communication.',
    'Beyond development, I’ve coordinated college annual events, supported operations and participant management at a state-level hackathon, and managed academic and personal projects from planning to completion.',
  ],
  education: [
    {
      institution:
        'Shri S’ad Vidhya Mandal Institute of Technology · Gujarat Technological University',
      qualification: 'BE, Computer Science and Engineering',
      dates: '2022–2026',
      detail: 'CGPA 9.22 / 10 · Bharuch, India',
    },
  ],
  experience: [
    {
      organization: 'IdeasPlus Technology Solutions Pvt. Ltd.',
      role: 'Frontend Web Development Intern',
      dates: 'January–April 2026',
      summary: [
        'Developed responsive web applications and contributed to the GenSolar platform.',
        'Collaborated on project planning, testing, and deployment.',
      ],
    },
    {
      organization: 'Linkverse Labs Pvt Ltd',
      role: 'Frontend Web Development Intern',
      dates: 'July 2025',
      summary: [
        'Built responsive frontend interfaces using modern web technologies.',
      ],
    },
    {
      organization: 'IBM CSRBOX',
      role: 'Data Analytics Intern',
      dates: 'July 2025',
      summary: [
        'Analyzed datasets and created insights through visualizations.',
      ],
    },
    {
      organization: 'Google for Developers (EduSkills)',
      role: 'AI/ML Virtual Intern',
      dates: 'April–June 2025',
      summary: [
        'Completed AI/ML training and explored practical machine learning applications.',
      ],
    },
  ],
  skills: [
    'HTML',
    'CSS',
    'JavaScript',
    'React.js',
    'PHP',
    'Python',
    'Tableau',
    'Power BI',
    'C/C++',
    'Project coordination',
    'Team leadership',
    'Event management',
    'Communication',
    'Problem solving',
    'Analytical thinking',
    'Adaptability',
  ],
  contact: {
    email: 'juwairiyyahsaiyed1803@gmail.com',
    linkedIn: 'https://www.linkedin.com/in/juwairiyyah-saiyed-2219a2252',
  },
};

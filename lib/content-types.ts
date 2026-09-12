/** Public portfolio content. Source evidence is kept outside the application. */
export type PublicAsset = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type Profile = {
  name: string;
  positioning: string;
  introduction: string;
  portrait: PublicAsset;
  about: string[];
  education: Array<{
    institution: string;
    qualification: string;
    dates: string;
    detail?: string;
  }>;
  experience: Array<{
    organization: string;
    role: string;
    dates: string;
    summary: string[];
  }>;
  skills: string[];
  contact: { email?: string; linkedIn?: string };
  resumePath?: string;
};

export type ProjectSummary = {
  id: string;
  slug: string;
  title: string;
  kind: 'professional' | 'academic' | 'personal' | 'concept' | 'project';
  summary: string;
  contribution: string;
  timeframe?: string;
  thumbnail?: PublicAsset;
  publication: 'draft' | 'ready';
  cover?: {
    eyebrow: string;
    headline: [string, string];
    tags: [string, string];
    theme: 'solar' | 'games' | 'jbot' | 'mood' | 'agriculture';
    note: string;
  };
};

export type GuideCue = {
  text: string;
  pose: 'neutral' | 'point';
  targetId?: string;
  dock?: 'start' | 'end';
};

export type SlideBlock =
  | {
      id: string;
      kind: 'exhibit';
      layout: 'flow' | 'comparison' | 'questions' | 'states';
      label: string;
      items: { label: string; title: string; text: string }[];
      takeaway?: string;
    }
  | { id: string; kind: 'text'; text: string }
  | { id: string; kind: 'list'; items: string[] }
  | { id: string; kind: 'facts'; items: { label: string; value: string }[] }
  | { id: string; kind: 'image'; asset: PublicAsset; caption?: string }
  | {
      id: string;
      kind: 'decision';
      choice: string;
      rationale: string;
      alternative?: string;
    }
  | {
      id: string;
      kind: 'outcome';
      text: string;
      evidence: 'measured' | 'qualitative' | 'deliverable' | 'proposed';
    };

type SlideBase = {
  id: string;
  title: string;
  guide: GuideCue;
  introduction?: string;
};

export type NativeSlide = SlideBase & {
  kind: 'native';
  section?: string;
  blocks: SlideBlock[];
};

export type ImageSlide = SlideBase & {
  kind: 'image';
  image: PublicAsset;
  transcript: string;
  hotspots?: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  }>;
};

export type ProjectDeck = {
  projectId: string;
  slides: [NativeSlide | ImageSlide, ...Array<NativeSlide | ImageSlide>];
};

/** Used by release validation, not rendered to visitors. */
export type PublicationReadiness = {
  contentStatus: 'fixture' | 'verified';
  portraitStatus: 'missing' | 'supplied' | 'illustrated';
  characterStatus: 'pending' | 'reviewed';
};

/** Private planning evidence. Never import this ledger into application components. */
export type EvidenceEntry = {
  claimId: string;
  publicFieldPaths: string[];
  basis: 'source' | 'user-answer' | 'proposal';
  source?: { file: string; location: string; supportingExcerpt: string };
  proposedPublicWording: string;
  attribution: 'individual' | 'team' | 'organization';
  state: 'supported' | 'needs-answer' | 'proposed';
  publicProposalLabel?: string;
};

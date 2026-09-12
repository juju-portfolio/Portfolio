import type {
  ProjectDeck,
  ProjectSummary,
  PublicAsset,
  PublicationReadiness,
} from './content-types';
const identifier = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const requireText = (v: unknown, label: string) => {
  if (typeof v !== 'string' || !v.trim())
    throw new Error(`${label} is required.`);
};
const unique = (values: string[], label: string) => {
  if (new Set(values).size !== values.length)
    throw new Error(`Duplicate ${label}.`);
};
export function validateAsset(asset: PublicAsset) {
  requireText(asset?.alt, 'Image description');
  if (
    !asset?.src?.startsWith('/media/') ||
    asset.src.includes('..') ||
    asset.src.includes('\\') ||
    asset.src.includes('%') ||
    asset.src.includes('?') ||
    !Number.isFinite(asset.width) ||
    !Number.isFinite(asset.height) ||
    asset.width <= 0 ||
    asset.height <= 0
  )
    throw new Error('Invalid image asset.');
}
export function validateDeck(deck: ProjectDeck) {
  if (
    !identifier.test(deck?.projectId) ||
    !Array.isArray(deck.slides) ||
    !deck.slides.length
  )
    throw new Error('A presentation must have a project and slides.');
  unique(
    deck.slides.map((s) => s.id),
    'slide ID',
  );
  for (const slide of deck.slides) {
    if (!identifier.test(slide.id)) throw new Error('Invalid slide ID.');
    requireText(slide.title, 'Slide title');
    requireText(slide.guide?.text, 'Guide cue');
    if (!['neutral', 'point'].includes(slide.guide.pose))
      throw new Error('Invalid guide pose.');
    let targets: string[] = [];
    if (slide.kind === 'native') {
      if (!Array.isArray(slide.blocks) || !slide.blocks.length)
        throw new Error('Empty native slide.');
      targets = slide.blocks.map((b) => b.id);
      unique(targets, 'block ID');
      for (const b of slide.blocks) {
        if (!identifier.test(b.id)) throw new Error('Invalid block ID.');
        if (b.kind === 'text' || b.kind === 'outcome')
          requireText(b.text, 'Block text');
        else if (b.kind === 'list') {
          if (!b.items.length) throw new Error('Empty list.');
          b.items.forEach((t) => requireText(t, 'List item'));
        } else if (b.kind === 'facts') {
          if (!b.items.length) throw new Error('Empty facts.');
          b.items.forEach((item) => {
            requireText(item.label, 'Fact label');
            requireText(item.value, 'Fact value');
          });
        } else if (b.kind === 'exhibit') {
          requireText(b.label, 'Exhibit label');
          if (
            !['flow', 'comparison', 'questions', 'states'].includes(b.layout) ||
            b.items.length < 2 ||
            b.items.length > 4
          )
            throw new Error('Invalid exhibit.');
          b.items.forEach((item) => {
            requireText(item.label, 'Exhibit item label');
            requireText(item.title, 'Exhibit item title');
            requireText(item.text, 'Exhibit item text');
          });
        } else if (b.kind === 'decision') {
          requireText(b.choice, 'Decision');
          requireText(b.rationale, 'Rationale');
        } else if (b.kind === 'image') validateAsset(b.asset);
        else throw new Error('Unknown block type.');
        if (
          b.kind === 'outcome' &&
          !['measured', 'qualitative', 'deliverable', 'proposed'].includes(
            b.evidence,
          )
        )
          throw new Error('Invalid outcome evidence.');
      }
    } else if (slide.kind === 'image') {
      validateAsset(slide.image);
      requireText(slide.transcript, 'Image transcript');
      targets = (slide.hotspots ?? []).map((h) => h.id);
      unique(targets, 'hotspot ID');
      for (const h of slide.hotspots ?? []) {
        if (
          !identifier.test(h.id) ||
          ![h.x, h.y, h.width, h.height].every(Number.isFinite) ||
          h.x < 0 ||
          h.y < 0 ||
          h.width <= 0 ||
          h.height <= 0 ||
          h.x + h.width > 1 ||
          h.y + h.height > 1
        )
          throw new Error('Invalid image hotspot.');
        requireText(h.label, 'Hotspot label');
      }
    } else throw new Error('Unknown slide type.');
    if (slide.guide.targetId && !targets.includes(slide.guide.targetId))
      throw new Error('Guide target is missing.');
  }
}
export function validateCatalog(
  projects: ProjectSummary[],
  decks: ProjectDeck[],
) {
  unique(
    projects.map((p) => p.id),
    'project ID',
  );
  unique(
    projects.map((p) => p.slug),
    'project slug',
  );
  unique(
    decks.map((d) => d.projectId),
    'deck',
  );
  for (const p of projects) {
    if (!identifier.test(p.id) || !identifier.test(p.slug))
      throw new Error('Invalid project identifier.');
    requireText(p.title, 'Project title');
    requireText(p.summary, 'Project summary');
    requireText(p.contribution, 'Project contribution');
    const matching = decks.filter((d) => d.projectId === p.id);
    if (matching.length !== 1)
      throw new Error('Every displayed project needs exactly one deck.');
    if (p.thumbnail) validateAsset(p.thumbnail);
  }
  for (const deck of decks) {
    if (!projects.some((p) => p.id === deck.projectId))
      throw new Error('Orphan deck.');
    validateDeck(deck);
  }
}
export function validateReadiness(
  readiness: PublicationReadiness,
  projects: ProjectSummary[],
) {
  if (
    readiness.contentStatus !== 'verified' ||
    !['supplied', 'illustrated'].includes(readiness.portraitStatus) ||
    readiness.characterStatus !== 'reviewed' ||
    !projects.length ||
    projects.some((p) => p.publication !== 'ready')
  )
    throw new Error(
      'Release blocked: verified content, a supplied or intentionally illustrated portrait, and reviewed character artwork are required.',
    );
}

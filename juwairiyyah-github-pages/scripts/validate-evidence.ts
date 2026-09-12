import { createHash } from 'node:crypto';
import type { EvidenceEntry } from '../lib/content-types';

// Build-time only: this module and the private ledger never enter client code.
export type EvidenceReview = {
  reviewer: string;
  contentHash: string;
  entries: EvidenceEntry[];
  nonFactualFields: Array<{ path: string; reason: string }>;
};
const structural = new Set([
  'id',
  'projectId',
  'slug',
  'kind',
  'src',
  'pose',
  'targetId',
  'evidence',
  'publication',
  'resumePath',
]);
export function reviewFields(content: unknown) {
  const fields: Record<string, string> = {};
  const walk = (value: unknown, path: string, key: string) => {
    if (typeof value === 'string') {
      if (!structural.has(key) && value.trim()) fields[path] = value;
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${path}.${index}`, key));
      return;
    }
    if (value && typeof value === 'object')
      for (const [child, item] of Object.entries(value))
        walk(item, path ? `${path}.${child}` : child, child);
  };
  walk(content, '', '');
  return fields;
}
export function contentHash(content: unknown) {
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}
export function validateEvidence(content: unknown, review: EvidenceReview) {
  if (!review.reviewer?.trim() || review.contentHash !== contentHash(content))
    throw new Error(
      'Evidence review is missing or stale for the current public content.',
    );
  const fields = reviewFields(content),
    covered = new Set<string>();
  for (const entry of review.entries) {
    if (entry.state === 'needs-answer' || !entry.publicFieldPaths.length)
      throw new Error('Unresolved evidence entry.');
    if (entry.basis === 'proposal') {
      if (entry.state !== 'proposed' || !entry.publicProposalLabel?.trim())
        throw new Error('A proposal requires a reviewed public label.');
    } else if (
      entry.state !== 'supported' ||
      !entry.source?.file ||
      !entry.source.location ||
      !entry.source.supportingExcerpt?.trim()
    )
      throw new Error('A factual claim requires reviewed source evidence.');
    for (const path of entry.publicFieldPaths) {
      if (fields[path] !== entry.proposedPublicWording)
        throw new Error(`Evidence wording does not match ${path}.`);
      covered.add(path);
    }
  }
  for (const field of review.nonFactualFields) {
    if (!fields[field.path] || !field.reason?.trim())
      throw new Error('Invalid structural/directional field exemption.');
    covered.add(field.path);
  }
  const missing = Object.keys(fields).filter((path) => !covered.has(path));
  if (missing.length)
    throw new Error(`Evidence coverage missing for: ${missing.join(', ')}`);
}

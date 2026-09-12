import { existsSync, readFileSync } from 'node:fs';
import { profile } from '../content/profile.ts';
import { characterArt } from '../content/character.ts';
import {
  contentHash,
  reviewFields,
  validateEvidence,
  type EvidenceReview,
} from './validate-evidence.ts';
import { projects, readiness } from '../content/projects.ts';
import gensolar from '../content/decks/gensolar.ts';
import games from '../content/decks/video-games.ts';
import jbot from '../content/decks/jbot.ts';
import mood from '../content/decks/mood-detection.ts';
import agriculture from '../content/decks/agriculture.ts';
import { validateCatalog, validateReadiness } from '../lib/validate-content.ts';
const decks = [gensolar, games, jbot, mood, agriculture];
validateCatalog(projects, decks);
for (const deck of decks)
  for (const slide of deck.slides) {
    const assets =
      slide.kind === 'image'
        ? [slide.image]
        : slide.blocks.flatMap((b) => (b.kind === 'image' ? [b.asset] : []));
    for (const asset of assets)
      if (!existsSync(`public${asset.src}`))
        throw new Error(`Missing asset: ${asset.src}`);
  }
console.log(
  'Content structure and referenced slide assets valid. Mode:',
  readiness.contentStatus,
);
const publicContent = { profile, projects, decks };
if (process.argv.includes('--inventory'))
  console.log(
    JSON.stringify(
      {
        contentHash: contentHash(publicContent),
        fields: reviewFields(publicContent),
      },
      null,
      2,
    ),
  );
if (process.argv.includes('--release')) validateReadiness(readiness, projects);
if (process.argv.includes('--evidence') || process.argv.includes('--release')) {
  const reviewPath = new URL(
    '../../inputs/private/release-review.json',
    import.meta.url,
  );
  if (!existsSync(reviewPath))
    throw new Error('Private résumé evidence review has not been supplied.');
  validateEvidence(
    publicContent,
    JSON.parse(readFileSync(reviewPath, 'utf8')) as EvidenceReview,
  );
  console.log('Private evidence review matches all public content fields.');
}
if (process.argv.includes('--release')) {
  for (const asset of [
    profile.portrait.src,
    ...new Set(Object.values(characterArt.poses)),
    '/media/guide/wings.png',
  ])
    if (!existsSync(`public${asset}`))
      throw new Error(`Missing required portrait/guide asset: ${asset}`);
}

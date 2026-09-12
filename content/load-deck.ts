import type { ProjectDeck } from '@/lib/content-types';
import { validateDeck } from '@/lib/validate-content';
const imports: Record<string, () => Promise<{ default: ProjectDeck }>> = {
  gensolar: () => import('./decks/gensolar'),
  'video-games': () => import('./decks/video-games'),
  jbot: () => import('./decks/jbot'),
  'mood-detection': () => import('./decks/mood-detection'),
  agriculture: () => import('./decks/agriculture'),
};
const cache = new Map<string, Promise<ProjectDeck>>();
export function loadDeck(id: string): Promise<ProjectDeck> {
  if (!imports[id])
    return Promise.reject(new Error('This project is unavailable.'));
  if (!cache.has(id))
    cache.set(
      id,
      imports[id]()
        .then((m) => {
          validateDeck(m.default);
          if (m.default.projectId !== id)
            throw new Error('Project and presentation do not match.');
          return m.default;
        })
        .catch((e) => {
          cache.delete(id);
          throw e;
        }),
    );
  return cache.get(id)!;
}

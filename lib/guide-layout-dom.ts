import {
  canChangePocket,
  pocketBox,
  selectGuideStop,
  type GuideRect,
} from './guide-layout';
import { fitCoverFlight } from './guide-showcase';
import { cardLanding } from './guide-travel';
import { findViewportRest } from './viewport-rest';
import type { CharacterBox } from './character-behavior';

export function createGuideLayout() {
  const fitLanding = (rect: GuideRect) => cardLanding(rect, innerWidth);
  const nodes = [
    ...document.querySelectorAll<HTMLElement>('[data-guide-stop]'),
  ];
  const find = (id: string) => nodes.find((n) => n.dataset.guideStop === id);
  const bounds = () =>
    nodes.map((n) => ({
      id: n.dataset.guideStop!,
      rect: n
        .querySelector<HTMLElement>('[data-guide-content]')!
        .getBoundingClientRect(),
    }));
  const choose = (current: string): string => {
    const selected = selectGuideStop(bounds(), innerHeight, current);
    const destination = measure(selected);
    if (
      destination &&
      destination.clip.bottom > 48 &&
      destination.clip.top < innerHeight - 48
    )
      return selected;
    // A prepared opening may arrive before its content reaches the reading line.
    const candidates = nodes
      .map((n) => measure(n.dataset.guideStop!))
      .filter((n) => n && n.clip.bottom > 48 && n.clip.top < innerHeight - 48);
    candidates.sort(
      (a, b) =>
        Math.abs((a!.clip.top + a!.clip.bottom) / 2 - innerHeight * 0.44) -
        Math.abs((b!.clip.top + b!.clip.bottom) / 2 - innerHeight * 0.44),
    );
    return candidates[0]?.id ?? selected;
  };
  const measure = (id: string) => {
    const node = find(id);
    const perch = node?.querySelector<HTMLElement>('[data-guide-perch]');
    if (!node || !perch) return null;
    const cover = node.querySelector<HTMLElement>('.project-cover');
    const heading = cover?.querySelector<HTMLElement>('h3');
    const topics = cover?.querySelector<HTMLElement>('.project-topics');
    const cr = cover?.getBoundingClientRect();
    let clear =
      cr && heading && topics
        ? {
            left: cr.left + 12,
            right: cr.right - 12,
            top: heading.getBoundingClientRect().bottom + 14,
            bottom: topics.getBoundingClientRect().top - 12,
          }
        : null;
    // Text boxes span unused width. Measure actual line ink before using the
    // empty right side of wide covers; the typography and card height stay put.
    const kicker = cover?.querySelector<HTMLElement>('.cover-kicker');
    if (cr && heading && topics && kicker) {
      const inkRight = (element: HTMLElement) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return Math.max(
          ...[...range.getClientRects()]
            .filter((r) => r.width > 0)
            .map((r) => r.right),
        );
      };
      const sideLeft = Math.max(inkRight(heading), inkRight(kicker)) + 20;
      const topicBounds = topics.getBoundingClientRect();
      const side = {
        left: sideLeft,
        right: cr.right - 12,
        top: cr.top + 20,
        bottom:
          sideLeft > topicBounds.right + 12
            ? cr.bottom - 20
            : topicBounds.top - 12,
      };
      const besideAllCopy = {
        ...side,
        left: Math.max(side.left, topicBounds.right + 20),
        bottom: cr.bottom - 20,
      };
      for (const candidate of [side, besideAllCopy]) {
        const sideLanding = fitLanding(candidate);
        if (
          sideLanding &&
          sideLanding.rest.width >
            (clear ? (fitLanding(clear)?.rest.width ?? 0) : 0)
        )
          clear = candidate;
      }
    }
    const landing = clear && fitLanding(clear);
    const pr = perch.getBoundingClientRect();
    const pocket = node.querySelector<HTMLElement>('[data-guide-pocket]')!;
    const r = pocket.getBoundingClientRect();
    const viewport = {
      left: 12,
      right: innerWidth - 12,
      top: 12,
      bottom: innerHeight - 12,
    };
    const visiblePocket: GuideRect = {
      left: Math.max(r.left, viewport.left),
      right: Math.min(r.right, viewport.right),
      top: Math.max(r.top, viewport.top),
      bottom: Math.min(r.bottom, viewport.bottom),
    };
    const flying = r.height > 0 ? pocketBox(visiblePocket) : null;
    return {
      id,
      launch: landing?.launch,
      box: landing?.rest ?? {
        x: pr.left + 10,
        y: pr.bottom - (pr.width - 20) * 1.5,
        width: pr.width - 20,
      },
      clip: landing && clear ? clear : pr,
      clear: landing ? clear : null,
      approach: flying,
      surface: node
        .querySelector<HTMLElement>('[data-guide-content]')!
        .getBoundingClientRect(),
      pocket: false,
    };
  };
  // Only offscreen slot mutations; compensate a reading anchor once per batch.
  const maintain = (interacting: boolean) => {
    if (interacting) return;
    const writes: [HTMLElement, number][] = [];
    const open = nodes.filter(
      (n) =>
        n.querySelector<HTMLElement>('[data-guide-pocket]')!.offsetHeight > 0,
    );
    for (const node of open) {
      const pocket = node.querySelector<HTMLElement>('[data-guide-pocket]')!;
      if (canChangePocket(pocket.getBoundingClientRect(), innerHeight, false))
        writes.push([pocket, 0]);
    }
    // The cover itself now supplies mobile airspace. Never create page gaps.
    if (!writes.length) return;
    const anchor = [
      ...document.querySelectorAll<HTMLElement>(
        '[data-guide-content] h3, [data-guide-content] h2, [data-guide-content] p',
      ),
    ].find((el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < innerHeight;
    });
    const before = anchor?.getBoundingClientRect().top;
    for (const [pocket, height] of writes) {
      pocket.style.height = `${height}px`;
      pocket.dataset.reservation = height ? 'expanded' : 'closed';
    }
    if (anchor && before !== undefined) {
      const delta = anchor.getBoundingClientRect().top - before;
      if (Math.abs(delta) > 0.5)
        window.scrollBy({ top: delta, behavior: 'instant' });
    }
  };
  const idleNext = (current: string) => {
    const cards = nodes
      .filter((n) => n.classList.contains('project-card'))
      .map((n) => measure(n.dataset.guideStop!))
      .filter((n) => n && n.clip.top > 24 && n.clip.bottom < innerHeight - 24);
    return cards.length > 1
      ? cards.find((n) => n!.id !== current)?.id
      : undefined;
  };
  const showcase = (id: string) => {
    const clear = measure(id)?.clear;
    if (!clear) return null;
    // A partly visible cover keeps its safe rest until the flight can be seen.
    if (clear.top < 12 || clear.bottom > innerHeight - 12) return null;
    return fitCoverFlight(clear);
  };
  const obstacles = () =>
    [
      ...document.querySelectorAll<HTMLElement>(
        '.site-header, .work-intro, .project-cover h3, .cover-kicker, .project-topics, .project-title-row, .project-open > p, .project-link, .guide-tour, .about-section h2, .about-section h3, .about-section p, .contact-section h2',
      ),
    ]
      .map((el) => el.getBoundingClientRect())
      .filter(
        (r) => r.width && r.height && r.bottom > 0 && r.top < innerHeight,
      );
  const resize = () => {
    for (const node of nodes) {
      const pocket = node.querySelector<HTMLElement>('[data-guide-pocket]')!;
      pocket.style.height = '0px';
      pocket.dataset.reservation = 'closed';
    }
  };
  const viewportRest = (current: CharacterBox) => {
    const protectedRects: GuideRect[] = [];
    const copy = document.querySelectorAll<HTMLElement>(
      '.portfolio h1, .portfolio h2, .portfolio h3, .portfolio h4, .portfolio p, .portfolio li, .footer-bottom span, .portfolio a[href], .portfolio button:not(.guide-hit), .site-header, .guide-tour, .guide-invitation',
    );
    for (const node of copy) {
      const r = node.getBoundingClientRect();
      if (
        !r.width ||
        !r.height ||
        r.bottom < 0 ||
        r.top > innerHeight ||
        getComputedStyle(node).visibility === 'hidden'
      )
        continue;
      if (
        node.matches(
          'a, button, li, .site-header, .guide-tour, .guide-invitation',
        )
      )
        protectedRects.push(r);
      else {
        const range = document.createRange();
        range.selectNodeContents(node);
        protectedRects.push(
          ...[...range.getClientRects()].filter((r) => r.width && r.height),
        );
      }
    }
    return findViewportRest(
      { width: innerWidth, height: innerHeight },
      protectedRects,
      current,
    );
  };
  return {
    viewportRest,
    showcase,
    obstacles,
    resize,
    choose,
    measure,
    maintain,
    ids: nodes.map((n) => n.dataset.guideStop!),
    bounds,
    idleNext,
  };
}

'use client';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { projects } from '@/content/projects';
import {
  deckUrl,
  readDeckLocation,
  type DeckLocation,
} from '@/lib/deck-navigation';

type Snapshot = { scrollY: number; openerId: string };
type Entry = { session: string; snapshot: Snapshot };
type JourneyEvents = {
  onEnter: (slug: string) => void;
  onExit: () => void;
  onRestored: () => void;
};
export function useDeckNavigation(events?: JourneyEvents) {
  const eventsRef = useRef(events);
  useLayoutEffect(() => {
    eventsRef.current = events;
  }, [events]);
  const [location, setLocation] = useState<DeckLocation | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [notice, setNotice] = useState('');
  const current = useRef<DeckLocation | null>(null);
  const snapshot = useRef<Snapshot>({ scrollY: 0, openerId: 'work-heading' });
  const session = useRef('');
  const owned = useRef(false);
  const closing = useRef(false);
  const pendingRestore = useRef(false);
  const raf = useRef(0);
  const mounted = useRef(true);
  const update = useCallback((next: DeckLocation | null) => {
    if (next && current.current?.slug !== next.slug)
      eventsRef.current?.onEnter(next.slug);
    if (!next && current.current) eventsRef.current?.onExit();
    current.current = next;
    setLocation(next);
  }, []);
  const restore = useCallback(() => {
    if (!mounted.current || current.current || !pendingRestore.current) return;
    pendingRestore.current = false;
    cancelAnimationFrame(raf.current);
    // Base UI owns scroll locking. Resume sampling only after its close/unlock commit.
    setRestoring(true);
    raf.current = requestAnimationFrame(() => {
      raf.current = requestAnimationFrame(() => {
        if (!mounted.current || current.current) return;
        const y = Math.min(
          snapshot.current.scrollY,
          Math.max(
            0,
            document.documentElement.scrollHeight - window.innerHeight,
          ),
        );
        window.scrollTo({ top: y, behavior: 'instant' });
        const target =
          document.getElementById(snapshot.current.openerId) ??
          document.getElementById('work-heading');
        target?.focus({ preventScroll: true });
        closing.current = false;
        setRestoring(false);
        eventsRef.current?.onRestored();
      });
    });
  }, []);
  useEffect(() => {
    mounted.current = true;
    session.current = crypto.randomUUID();
    const pagePath = window.location.pathname;
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const sync = () => {
      let next = readDeckLocation(window.location.href);
      if (next && !projects.some((p) => p.slug === next?.slug)) {
        setNotice(
          'That project is unavailable. Please choose a project below.',
        );
        window.history.replaceState(
          window.history.state,
          '',
          deckUrl(window.location.href, null),
        );
        next = null;
      }
      const entry = window.history.state?.portfolioDeck as Entry | undefined;
      if (next) {
        owned.current = entry?.session === session.current;
        if (owned.current && entry) snapshot.current = entry.snapshot;
        else if (!current.current)
          snapshot.current = {
            scrollY: window.scrollY,
            openerId: 'work-heading',
          };
        closing.current = false;
        pendingRestore.current = false;
        setRestoring(false);
        cancelAnimationFrame(raf.current);
        update(next);
      } else if (current.current) {
        closing.current = true;
        pendingRestore.current = true;
        setRestoring(true);
        update(null);
      }
    };
    // These are presentation states on the same page. Consume only their traversal
    // before the framework treats a query change as a server route navigation.
    const onPop = (event: PopStateEvent) => {
      if (
        window.location.pathname === pagePath &&
        (current.current || readDeckLocation(window.location.href))
      ) {
        event.stopImmediatePropagation();
        sync();
      }
    };
    sync();
    window.addEventListener('popstate', onPop, true);
    return () => {
      mounted.current = false;
      window.history.scrollRestoration = previousRestoration;
      window.removeEventListener('popstate', onPop, true);
      cancelAnimationFrame(raf.current);
      pendingRestore.current = false;
    };
  }, [update]);
  const open = useCallback(
    (slug: string, openerId: string) => {
      if (current.current || closing.current) return;
      cancelAnimationFrame(raf.current);
      setRestoring(false);
      snapshot.current = { scrollY: window.scrollY, openerId };
      owned.current = true;
      const next = { slug, slideId: null };
      window.history.pushState(
        {
          ...window.history.state,
          portfolioDeck: {
            session: session.current,
            snapshot: snapshot.current,
          },
        },
        '',
        deckUrl(window.location.href, next),
      );
      setNotice('');
      update(next);
    },
    [update],
  );
  const selectSlide = useCallback(
    (slideId: string) => {
      if (!current.current || closing.current) return;
      const next = { ...current.current, slideId };
      window.history.replaceState(
        window.history.state,
        '',
        deckUrl(window.location.href, next),
      );
      update(next);
    },
    [update],
  );
  const close = useCallback(() => {
    if (!current.current || closing.current) return;
    closing.current = true;
    if (owned.current) {
      window.history.back();
    } else {
      window.history.replaceState(
        { ...window.history.state, portfolioDeck: undefined },
        '',
        deckUrl(window.location.href, null),
      );
      setRestoring(true);
      pendingRestore.current = true;
      update(null);
    }
  }, [update]);
  return { location, open, selectSlide, close, restoring, notice, restore };
}

'use client';
/* oxlint-disable react/react-compiler -- This imperative animation controller intentionally writes to its owned DOM refs and mutable GSAP timeline state, never React render data. */
import { useLayoutEffect, useMemo, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { characterArt } from '@/content/character';
import {
  actorVisual,
  presenterRoute,
  presenterLoop,
} from '@/lib/presenter-motion';
import { sampleCoverFlight } from '@/lib/guide-showcase';
import { createGuideLayout } from '@/lib/guide-layout-dom';
import { pageLaunchWidth } from '@/lib/viewport-rest';
import {
  planGuideTravel,
  sampleGuideTravel,
  stepHop,
  resizeAtFeet,
  carriedFlight,
} from '@/lib/guide-travel';
import {
  guideEnvelope,
  rectContains,
  type GuideRect,
} from '@/lib/guide-layout';
import {
  clamp,
  smooth,
  samplePortraitProgress,
  PHASES,
} from '@/lib/motion-progress';
import {
  fitCharacter,
  flightPoint,
  hasSeenEverySlide,
  type CharacterBox,
  type CharacterPose,
} from '@/lib/character-behavior';

type Refs = {
  area: RefObject<HTMLDivElement | null>;
  frame: RefObject<HTMLDivElement | null>;
  photo: RefObject<HTMLImageElement | null>;
  character: RefObject<HTMLDivElement | null>;
  layer: RefObject<HTMLDivElement | null>;
  hero: RefObject<HTMLElement | null>;
  deckDock: RefObject<HTMLDivElement | null>;
  guideButton: RefObject<HTMLButtonElement | null>;
  deckGuideButton: RefObject<HTMLButtonElement | null>;
};
type Commands = {
  onTarget: (id: string) => void;
  onEnter: (slug: string) => void;
  onExit: () => void;
  onPresenterReady: () => void;
  onRestored: () => void;
  onSlide: (slug: string, id: string, ids: string[]) => void;
};
type Journey = {
  context: 'page' | 'deck' | 'restoring' | 'return';
  slug: string;
  visited: Set<string>;
  ids: string[];
  reaction: 'pout' | 'excited' | 'smile';
  box: CharacterBox;
  pageBox: CharacterBox | null;
  stopId: string;
  pageStopId: string;
  pageClip: GuideRect | null;
  inPocket: boolean;
};

// One actor and one position writer for portrait, roaming, deck and return flight.
// URL/focus restoration is independent: gestures never postpone closing a deck.
export function usePortraitMotion(
  refs: Refs,
  options: {
    motion: boolean;
    animate: boolean;
    visible: boolean;
    reduced: boolean;
  },
) {
  const preference = useRef(options);
  const syncPreference = useRef<((next: typeof options) => void) | null>(null);
  useLayoutEffect(() => {
    preference.current = options;
    syncPreference.current?.(options);
  }, [options]);
  const commands = useRef<Commands | null>(null);
  const journey = useRef<Journey>({
    context: 'page',
    slug: '',
    visited: new Set(),
    ids: [],
    reaction: 'smile',
    box: { x: 0, y: 0, width: 160 },
    pageBox: null,
    stopId: 'gensolar',
    pageStopId: 'gensolar',
    pageClip: null,
    inPocket: false,
  });
  const events = useMemo(
    () => ({
      onTarget: (id: string) => commands.current?.onTarget(id),
      onEnter: (slug: string) => commands.current?.onEnter(slug),
      onExit: () => commands.current?.onExit(),
      onPresenterReady: () => commands.current?.onPresenterReady(),
      onRestored: () => commands.current?.onRestored(),
      onSlide: (slug: string, id: string, ids: string[]) =>
        commands.current?.onSlide(slug, id, ids),
    }),
    [],
  );
  useLayoutEffect(() => {
    let { motion, animate, visible } = preference.current;
    const {
      area,
      frame,
      photo,
      character,
      layer,
      deckDock,
      guideButton,
      deckGuideButton,
    } = refs;
    if (
      !area.current ||
      !frame.current ||
      !photo.current ||
      !character.current ||
      !layer.current
    )
      return;
    const actor = character.current,
      stage = layer.current;
    if (!visible) actor.style.opacity = '0';
    const state = journey.current;
    const layout = createGuideLayout();
    let sequence: gsap.core.Timeline | null = null;
    let frameRequest = 0;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let slotRequest = 0;
    let generation = 0;
    let active = true;
    let busy = false;
    let phase = 'photo';
    let requestedStop = '';
    let targetTimer: ReturnType<typeof setTimeout> | undefined;
    let idleRound = 0;
    let lastShowcase = '';
    let lastScrollAt = 0;
    let presenterBounds = '';
    let observedPresenter: Element | null = null;
    let presenterNodes: Element[] = [];
    const presenterSignature = () => {
      const host = deckDock.current
        ?.closest('.presenter-stage')
        ?.getBoundingClientRect();
      const slot = deckDock.current?.getBoundingClientRect();
      return host && slot
        ? [
            host.left,
            host.top,
            host.width,
            host.height,
            slot.left,
            slot.top,
            slot.width,
          ].join(',')
        : '';
    };
    let lastScrollY = window.scrollY;
    let interacting = false;
    const viewport = () => ({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    const fit = (box: CharacterBox) => fitCharacter(box, viewport());
    const setPose = (pose: CharacterPose, facing = 'right') => {
      actor.dataset.pose = animate ? pose : 'neutral';
      actor.dataset.facing = facing;
    };
    const wings = (open: boolean) => {
      actor.dataset.wings = String(open && visible);
    };
    const visual = (
      moving: boolean,
      pose: CharacterPose = 'smile',
      facing = 'right',
    ) => {
      const appearance = actorVisual(moving, pose);
      actor.dataset.pose = appearance.pose;
      actor.dataset.facing = facing;
      wings(appearance.wings);
    };
    const presenterStage = () =>
      deckDock.current?.closest<HTMLElement>('.presenter-stage');
    const presenting = (flying: boolean) => {
      const host = presenterStage();
      if (host) host.dataset.flight = String(flying);
    };
    const put = (box: CharacterBox, opacity = 1) => {
      state.box = box;
      Object.assign(actor.style, {
        left: '0',
        top: '0',
        width: '1024px',
        transformOrigin: '0 0',
        transform: `translate3d(${box.x}px,${box.y}px,0) scale(${box.width / 1024})`,
        opacity: String(visible ? opacity : 0),
      });
      stage.style.visibility = 'visible';
      const inDeck = state.context === 'deck';
      const button = inDeck ? deckGuideButton.current : guideButton.current;
      const other = inDeck ? guideButton.current : deckGuideButton.current;
      if (other) other.style.visibility = 'hidden';
      if (button) {
        const host = inDeck ? presenterStage()?.getBoundingClientRect() : null;
        const portraitHit =
          !inDeck &&
          state.context === 'page' &&
          (phase === 'photo' || phase === 'morph')
            ? frame.current?.getBoundingClientRect()
            : null;
        const hitWidth = Math.max(44, box.width * 0.62);
        Object.assign(button.style, {
          left: `${portraitHit?.left ?? box.x + (box.width - hitWidth) / 2 - (host?.left ?? 0)}px`,
          top: `${portraitHit?.top ?? box.y - (host?.top ?? 0)}px`,
          width: `${portraitHit?.width ?? hitWidth}px`,
          height: `${portraitHit?.height ?? box.width * 1.5}px`,
          visibility:
            visible && (portraitHit || opacity > 0.5) ? 'visible' : 'hidden',
        });
      }
    };
    const unclip = () => {
      stage.style.clipPath = 'none';
      stage.style.maskImage = 'none';
    };
    const pagePlane = (rect?: GuideRect) => {
      state.pageClip = rect
        ? {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
          }
        : null;
      stage.dataset.plane = rect ? 'perch' : 'transit';
      stage.style.zIndex = '40';
      if (!rect) {
        unclip();
        return;
      }
      stage.style.clipPath = `inset(${Math.max(0, rect.top)}px ${Math.max(0, innerWidth - rect.right)}px ${Math.max(0, innerHeight - rect.bottom)}px ${Math.max(0, rect.left)}px)`;
    };
    const cancel = () => {
      generation++;
      sequence?.kill();
      sequence = null;
      clearTimeout(idleTimer);
      cancelAnimationFrame(slotRequest);
      busy = false;
      presenting(false);
      actor.style.setProperty('--bank', '0deg');
      actor.style.filter = 'none';
    };
    const progress = () => {
      // Begin while the unpinned portrait is still comfortably in view.
      const origin = Math.max(
        0,
        area.current!.getBoundingClientRect().top +
          window.scrollY -
          Math.min(window.innerHeight * 0.52, 380),
      );
      const travel = 440;
      return samplePortraitProgress(
        clamp((window.scrollY - origin) / travel) * PHASES.dockEnd,
      );
    };
    const pageHome = () => {
      return (
        layout.measure(state.stopId)?.box ?? {
          x: innerWidth - 100,
          y: innerHeight - 150,
          width: 56,
        }
      );
    };
    const portrait = (position = true) => {
      if (!area.current || !frame.current || !photo.current) return;
      const r = area.current.getBoundingClientRect();
      const h = frame.current.offsetHeight,
        w = r.width;
      const sampled = progress(),
        p = visible ? sampled : samplePortraitProgress(0);
      phase = sampled.phase;
      actor.dataset.phase = phase;
      const mix = (a: number, b: number, t: number) => a + (b - a) * t;
      // The aligned style reveal finishes before any shrink or release begins.
      const morph = smooth((p.morph - 0.3) / 0.4);
      const shrink = smooth(p.exit / 0.55);
      const release = smooth((p.exit - 0.55) / 0.45);
      frame.current.style.transform = 'none';
      frame.current.style.opacity = String(motion ? 1 - release : 1);
      // Matched faces dissolve inside the frame. A horizontal wipe would slice
      // through the slightly different portrait/standing collars and shoulders.
      const revealing = motion && morph > 0 && morph < 1;
      photo.current.style.opacity = String(motion ? 1 - morph : 1);
      photo.current.style.maskImage = 'none';
      stage.style.maskImage = 'none';
      photo.current.style.filter = revealing
        ? `blur(${Math.sin(Math.PI * morph) * 1.2}px)`
        : 'none';
      actor.style.filter = revealing
        ? `blur(${Math.sin(Math.PI * morph) * 2}px)`
        : 'none';
      actor.dataset.morph = String(morph);
      if (!position && sampled.phase === 'guide') return state.box;
      const home = layout.measure(layout.ids[0]);
      const destination = home?.box ?? pageHome();
      const art = characterArt;
      const portraitScale = Math.max(
        w / art.portrait.width,
        h / art.portrait.height,
      );
      const startWidth =
        portraitScale * art.portrait.width * art.alignment.avatarScale;
      const start = {
        width: startWidth,
        x:
          r.left +
          (w - art.portrait.width * portraitScale) / 2 +
          art.alignment.portraitEyes[0] * art.portrait.width * portraitScale -
          art.alignment.avatarEyes[0] * startWidth,
        y:
          r.top +
          (h - art.portrait.height * portraitScale) *
            art.alignment.portraitObjectY +
          art.alignment.portraitEyes[1] * art.portrait.height * portraitScale -
          art.alignment.avatarEyes[1] * startWidth * 1.5,
      };
      // The complete wings fit the portrait and viewport before their release.
      const flightWidth = Math.min(
        112,
        (w - 24) / 2.52,
        (innerWidth - 32) / 2.52,
        (h - 24) / 2.2,
      );
      const hover = {
        width: flightWidth,
        x: Math.max(
          16 + flightWidth * 0.76,
          Math.min(
            innerWidth - 16 - flightWidth * 1.76,
            r.left + (w - flightWidth) / 2,
          ),
        ),
        y: r.top + (h - flightWidth * 2.2) / 2 + flightWidth * 0.65,
      };
      let box = {
        x: mix(start.x, hover.x, shrink),
        y: mix(start.y, hover.y, shrink),
        width: mix(start.width, hover.width, shrink),
      };
      const airborne = p.exit > 0.58 && p.dock < 0.72;
      visual(airborne && animate, 'neutral');
      const radius =
        parseFloat(getComputedStyle(frame.current).borderTopLeftRadius) || 0;
      stage.style.clipPath = `inset(${mix(Math.max(0, r.top), 0, release)}px ${mix(Math.max(0, innerWidth - r.right), 0, release)}px ${mix(Math.max(0, innerHeight - r.top - h), 0, release)}px ${mix(Math.max(0, r.left), 0, release)}px round ${mix(radius, 0, release)}px ${mix(radius, 0, release)}px ${mix(30, 0, release)}px ${mix(30, 0, release)}px)`;
      if (p.dock > 0 && home) {
        box = flightPoint(hover, destination, p.dock, 20);
        stage.style.zIndex = '40';
        unclip();
        visual(p.dock < 1 && animate, 'smile');
        if (p.dock === 1) pagePlane(home.clip);
      }

      if (position)
        put(box, motion ? morph : sampled.phase === 'guide' ? 1 : 0);
      return box;
    };
    const gesture = (
      timeline: gsap.core.Timeline,
      pose: CharacterPose,
      duration: number,
      facing = 'right',
    ) => {
      timeline.call(() => setPose(pose, facing)).to({}, { duration });
    };
    const scaleAtFeet = (
      timeline: gsap.core.Timeline,
      from: CharacterBox,
      width: number,
    ) => {
      if (Math.abs(from.width - width) < 0.5) return;
      const clock = { t: 0 };
      timeline.to(clock, {
        t: 1,
        duration: 0.42,
        ease: 'sine.inOut',
        onUpdate: () =>
          put(resizeAtFeet(from, from.width + (width - from.width) * clock.t)),
      });
    };
    const pageRest = (id: string) => {
      const destination = layout.measure(id);
      if (!destination) return null;
      const showcase = layout.showcase(id);
      const tour = document
        .querySelector('.guide-tour')
        ?.getBoundingClientRect();
      const box = destination.box;
      if (
        tour &&
        box.x + box.width > tour.left &&
        box.x < tour.right &&
        box.y + box.width * 1.5 > tour.top &&
        box.y < tour.bottom
      ) {
        const width = Math.min(72, box.width);
        const rest = {
          width,
          x: tour.right - width - 18,
          y: tour.top - width * 1.5 - 8,
        };
        return {
          ...destination,
          rest,
          launch: rest,
          showcase: null,
          clip: {
            left: rest.x - 12,
            right: rest.x + width + 12,
            top: rest.y - 12,
            bottom: tour.top - 2,
          },
        };
      }
      return {
        ...destination,
        showcase,
        rest: destination.box,
      };
    };
    const isLandingVisible = (
      candidate: NonNullable<ReturnType<typeof pageRest>>,
    ) => {
      const viewportRect = {
        left: 0,
        right: innerWidth,
        top: 0,
        bottom: innerHeight,
      };
      const launch =
        candidate.launch ??
        resizeAtFeet(candidate.rest, Math.min(72, candidate.rest.width));
      return (
        rectContains(viewportRect, guideEnvelope(candidate.rest, false), 12) &&
        rectContains(viewportRect, guideEnvelope(launch, true), 12)
      );
    };
    const pageRoutine = (preferred?: string) => {
      if (!animate && sequence?.paused()) return;
      if (
        !active ||
        state.context !== 'page' ||
        progress().phase !== 'guide' ||
        interacting ||
        !visible
      )
        return;
      layout.maintain(interacting);
      lastScrollY = window.scrollY;
      const wanted = preferred ?? requestedStop;
      const candidate = wanted ? pageRest(wanted) : null;
      const usable =
        candidate &&
        candidate.rest.y >= 12 &&
        candidate.rest.y + candidate.rest.width * 1.5 < innerHeight - 12;
      let nextId = usable ? wanted : layout.choose(state.stopId);
      let destination = pageRest(nextId);
      let viewportParking = false;
      if (!destination) return;
      if (!isLandingVisible(destination)) {
        const alternatives = layout.ids
          .map(pageRest)
          .filter(
            (candidate): candidate is NonNullable<typeof destination> =>
              !!candidate && isLandingVisible(candidate),
          )
          .sort(
            (a, b) =>
              Math.abs(a.rest.y + a.rest.width * 0.75 - innerHeight * 0.5) -
              Math.abs(b.rest.y + b.rest.width * 0.75 - innerHeight * 0.5),
          );
        const fallback = !alternatives[0]
          ? layout.viewportRest(state.box)
          : null;
        if (fallback) {
          destination = {
            ...destination,
            ...fallback,
            box: fallback.rest,
            showcase: null,
            id: state.stopId,
          };
          nextId = state.stopId;
          viewportParking = true;
        } else if (!alternatives[0]) {
          cancel();
          pagePlane();
          put(
            animate
              ? carriedFlight(state.box, state.box.width, viewport())
              : fit(state.box),
          );
          visual(animate);
          actor.dataset.activity = 'awaiting-card';
          return;
        } else {
          destination = alternatives[0];
          nextId = destination.id;
        }
      }
      const { showcase, rest } = destination;
      if (rest.y + rest.width * 1.5 < 0 || rest.y > innerHeight) return;
      requestedStop = '';
      clearTimeout(targetTimer);
      const origin = { ...state.box };
      const sourceLaunchWidth = pageLaunchWidth(
        actor.dataset.activity,
        layout.measure(state.stopId)?.launch?.width ?? 84,
      );
      const airborneWidth =
        actor.dataset.wings === 'true' ? origin.width : Infinity;
      cancel();
      state.stopId = nextId;
      state.inPocket = false;
      actor.dataset.stop = nextId;
      actor.dataset.context = 'page';
      actor.dataset.phase = 'guide';
      const ticket = generation;
      const settled = () => {
        if (!active || ticket !== generation || state.context !== 'page')
          return;
        busy = false;
        pagePlane(destination.clip);
        put(rest);
        visual(false);
        actor.dataset.activity = viewportParking ? 'viewport-rest' : 'rest';
        if (!animate) return;
        if (viewportParking) {
          sequence = gsap.timeline();
          gesture(sequence, 'wave', 2.4);
          gesture(sequence, 'smile', 1);
          return;
        }
        sequence = gsap.timeline({
          onComplete: () => {
            if (!active || ticket !== generation || state.context !== 'page')
              return;
            const neighbour = !document.querySelector('.guide-tour')
              ? layout.idleNext(state.stopId)
              : undefined;
            idleTimer = setTimeout(() => pageRoutine(neighbour), 7000);
          },
        });
        const mood: CharacterPose[] = [
          'wave',
          'think',
          'approve',
          'idea',
          'thanks',
          'laptop',
        ];
        gesture(sequence, mood[idleRound++ % mood.length], 2.6);
        gesture(sequence, 'smile', 2.8);
        // Mobile covers retain an actual flight, inside their existing artwork.
        if (
          showcase &&
          (lastShowcase !== state.stopId || idleRound % 2 === 1)
        ) {
          const start = sampleCoverFlight(showcase, 0).box;
          const launch = resizeAtFeet(rest, start.width);
          const approach = { t: 0 },
            orbit = { t: 0 },
            landing = { t: 0 };
          sequence.call(() => {
            lastShowcase = state.stopId;
            pagePlane(showcase.clip);
            actor.dataset.activity = 'takeoff';
            visual(false, 'step');
          });
          scaleAtFeet(sequence, rest, start.width);
          sequence.call(() => {
            visual(true);
            actor.dataset.activity = 'cover-flight';
          });
          sequence.to(approach, {
            t: 1,
            duration: 1.4,
            ease: 'none',
            onUpdate: () => put(flightPoint(launch, start, approach.t, 0)),
          });
          sequence.to(orbit, {
            t: 1,
            duration: 6.4,
            ease: 'none',
            onUpdate: () => {
              const sample = sampleCoverFlight(showcase, orbit.t);
              put(sample.box);
              actor.style.setProperty('--bank', `${sample.bank * 0.25}deg`);
            },
          });
          sequence.to(landing, {
            t: 1,
            duration: 1.4,
            ease: 'none',
            onUpdate: () => put(flightPoint(start, launch, landing.t, 0)),
          });
          sequence.call(() => {
            visual(false, 'step');
            pagePlane(destination.clip);
            actor.dataset.activity = 'landing';
          });
          scaleAtFeet(sequence, launch, rest.width);
          sequence.call(() => {
            visual(false, 'smile');
            actor.dataset.activity = 'rest';
          });
        } else if (showcase) {
          sequence.call(() => {
            visual(false, 'step');
            actor.dataset.activity = 'hop';
          });
          sequence.to({}, { duration: 0.22 });
          sequence.call(() => visual(false, 'hop'));
          const hopClock = { t: 0 };
          sequence.to(hopClock, {
            t: 1,
            duration: 0.85,
            ease: 'none',
            onUpdate: () => {
              const box = stepHop(rest, rest, hopClock.t);
              put({
                ...box,
                x: box.x - 10 * Math.sin(Math.PI * hopClock.t) ** 2,
              });
            },
          });
          sequence.call(() => visual(false, 'neutral'));
          sequence.to({}, { duration: 0.3 });
          sequence.call(() => visual(false, 'approve'));
          sequence.to({}, { duration: 1.5 });
        }
      };
      const distance = Math.hypot(origin.x - rest.x, origin.y - rest.y);
      if (!animate || distance < 2) {
        settled();
        return;
      }
      let from = origin;
      // A scrolled-off actor re-enters through the viewport edge, never from a card centre.
      if (origin.y + origin.width * 1.55 < 0)
        from = { ...rest, y: -rest.width * 1.55 };
      else if (origin.y > innerHeight)
        from = { ...rest, y: innerHeight + rest.width * 0.65 };
      const flightWidth = Math.min(
        destination.launch?.width ?? 72,
        sourceLaunchWidth,
        airborneWidth,
        84,
      );
      const launch = resizeAtFeet(from, flightWidth);
      const landing = resizeAtFeet(rest, flightWidth);
      const path = planGuideTravel(
        launch,
        landing,
        layout.obstacles(),
        viewport(),
      );
      const fallbackLift = Math.max(
        0,
        Math.min(16, Math.min(launch.y, landing.y) - flightWidth * 0.65 - 12),
      );
      pagePlane();
      put(from);
      busy = true;
      const clock = { t: 0 };
      sequence = gsap.timeline({ onComplete: settled });
      actor.dataset.activity = 'takeoff';
      // An interrupted flight keeps its wings during the size correction.
      if (actor.dataset.wings !== 'true') visual(false, 'step');
      scaleAtFeet(sequence, from, flightWidth);
      sequence.call(() => {
        actor.dataset.activity = path ? 'card-flight' : 'foreground-flight';
        actor.dataset.phase = 'flight';
        visual(true);
      });
      sequence.to(clock, {
        t: 1,
        duration: Math.min(
          2.8,
          Math.max(1.25, Math.hypot(from.x - rest.x, from.y - rest.y) / 210),
        ),
        ease: 'none',
        onUpdate: () => {
          visual(true);
          put(
            path
              ? sampleGuideTravel(path, launch, landing, clock.t)
              : flightPoint(launch, landing, clock.t, fallbackLift),
          );
          actor.style.setProperty(
            '--bank',
            `${Math.sin(clock.t * Math.PI) * Math.sign(rest.x - from.x) * 1.6}deg`,
          );
        },
      });
      sequence.call(() => {
        actor.dataset.activity = 'landing';
        actor.dataset.phase = 'guide';
        visual(false, 'step');
      });
      scaleAtFeet(sequence, landing, rest.width);
    };
    const deckHome = () => {
      const slot = deckDock.current;
      if (!slot || !slot.getClientRects().length) return null;
      const r = slot.getBoundingClientRect();
      if (!r.width || r.top < 0 || r.bottom > innerHeight + 1) return null;
      return { x: r.left, y: r.top, width: r.width };
    };
    const deckPlane = () => {
      const host = presenterStage();
      if (host && host !== observedPresenter) {
        presenterNodes.forEach((node) => observer.unobserve(node));
        observedPresenter = host;
        presenterNodes = [
          host,
          host.parentElement,
          host.closest('.project-dialog')?.querySelector('.deck-reading'),
        ].filter((node): node is Element => !!node);
        presenterNodes.forEach((node) => observer.observe(node));
      }
      presenterBounds = presenterSignature();
      const r = host?.getBoundingClientRect();
      if (r) {
        unclip();
        stage.style.zIndex = '70';
        stage.style.clipPath = `inset(${Math.max(0, r.top)}px ${Math.max(0, innerWidth - r.right)}px ${Math.max(0, innerHeight - r.bottom)}px ${Math.max(0, r.left)}px)`;
      }
    };
    const deckRoutine = () => {
      if (state.context !== 'deck' || !visible) return;
      busy = false;
      actor.dataset.context = 'deck';
      actor.dataset.phase = 'deck';
      const destination = deckHome();
      if (!destination) return;
      put(destination);
      deckPlane();
      visual(false, 'smile', 'right');
      presenting(false);
      if (!animate) return;
      sequence = gsap.timeline({ repeat: -1 });
      gesture(sequence, 'point', 3.5);
      gesture(sequence, 'smile', 4);
      gesture(sequence, 'wave', 2.4);
      gesture(sequence, 'smile', 4);
      gesture(sequence, 'think', 2.8);
      gesture(sequence, 'approve', 2.4);
      gesture(sequence, 'thanks', 2.5);
      gesture(sequence, 'idea', 2.5);
      gesture(sequence, 'laptop', 3.2);
    };
    const fly = (
      destination: CharacterBox,
      finished: () => void,
      duration = 1,
      maxFlightWidth = 84,
    ) => {
      if (!animate || !visible) {
        put(destination);
        visual(false);
        finished();
        return;
      }
      busy = true;
      unclip();
      stage.style.zIndex = state.context === 'deck' ? '70' : '40';
      const origin = fit(state.box),
        clock = { t: 0 };
      const flightWidth = Math.min(
        maxFlightWidth,
        84,
        origin.width,
        destination.width,
      );
      const launch = resizeAtFeet(origin, flightWidth);
      const landing = resizeAtFeet(destination, flightWidth);
      const lift = Math.max(
        0,
        Math.min(24, Math.min(launch.y, landing.y) - flightWidth * 0.65 - 12),
      );
      const ticket = generation;
      put(origin);
      if (actor.dataset.wings !== 'true') visual(false, 'step');
      actor.dataset.phase = 'flight';
      sequence = gsap.timeline({
        onComplete: () => {
          if (!active || ticket !== generation) return;
          put(destination);
          visual(false);
          busy = false;
          finished();
        },
      });
      scaleAtFeet(sequence, origin, flightWidth);
      sequence.call(() => visual(true));
      sequence.to(clock, {
        t: 1,
        duration,
        ease: 'none',
        onUpdate: () => {
          visual(true);
          put(flightPoint(launch, landing, clock.t, lift));
          actor.style.setProperty(
            '--bank',
            `${Math.sin(clock.t * Math.PI) * Math.sign(destination.x - origin.x) * 1.6}deg`,
          );
        },
      });
      sequence.call(() => visual(false, 'step'));
      scaleAtFeet(sequence, landing, destination.width);
    };
    const flourish = (entering = false) => {
      const origin = state.box;
      const destination = deckHome(),
        host = presenterStage();
      if (!destination || !host || !visible) return;
      cancel();
      put(destination);
      deckPlane();
      actor.dataset.context = 'deck';
      actor.dataset.phase = 'deck';
      visual(false);
      if (!animate) {
        deckRoutine();
        return;
      }
      const route = presenterRoute(host.getBoundingClientRect(), destination);
      if (!route) {
        deckRoutine();
        return;
      }
      const ticket = generation;
      const clock = { t: 0 };
      // First visible pose is already inside the dock. The flourish never waits
      // for slide data and never traverses the reading surface or navigation.
      busy = true;
      presenting(true);
      visual(true);
      const from = entering
        ? route.start
        : rectContains(
              host.getBoundingClientRect(),
              guideEnvelope(origin, true),
            )
          ? origin
          : route.end;
      put(from);
      actor.dataset.phase = 'flight';
      sequence = gsap.timeline({
        onComplete: () => {
          if (!active || ticket !== generation || state.context !== 'deck')
            return;
          deckRoutine();
        },
      });
      sequence.to(clock, {
        t: 1,
        duration: entering ? 1.6 : 2.8,
        ease: 'none',
        onUpdate: () => {
          visual(true);
          put(
            entering
              ? flightPoint(from, route.end, clock.t, 0)
              : presenterLoop(route, from, clock.t),
          );
          deckPlane();
          actor.style.setProperty(
            '--bank',
            `${Math.sin(clock.t * Math.PI) * -1.2}deg`,
          );
        },
      });
    };
    const arrive = () => {
      if (state.context !== 'deck') return;
      const destination = deckHome();
      if (destination) {
        flourish(true);
        return;
      }
      // onPresenterReady normally runs in the dialog's first layout effect.
      // One frame also covers direct URLs whose navigation effect runs later.
      cancelAnimationFrame(slotRequest);
      slotRequest = requestAnimationFrame(() => {
        if (active && state.context === 'deck' && deckHome()) flourish(true);
      });
    };
    const returnToPage = () => {
      cancel();
      state.context = 'return';
      actor.dataset.context = 'return';
      lastScrollY = window.scrollY;
      state.stopId = state.pageStopId;
      const inGuide = progress().phase === 'guide';
      let home = inGuide ? pageRest(state.stopId) : null;
      let returningToViewport = false;
      if (home && !isLandingVisible(home)) {
        home =
          layout.ids
            .map(pageRest)
            .find((candidate) => candidate && isLandingVisible(candidate)) ??
          null;
      }
      if (inGuide && !home) {
        const anchor = pageRest(state.stopId);
        const fallback = layout.viewportRest(state.box);
        if (anchor && fallback) {
          home = { ...anchor, ...fallback, box: fallback.rest, showcase: null };
          returningToViewport = true;
        }
      }
      if (home) state.stopId = home.id;
      const destination =
        home?.rest ??
        (inGuide
          ? carriedFlight(fit(state.pageBox ?? pageHome()), 72, viewport())
          : fit(state.pageBox ?? pageHome()));
      const endReturn = () => {
        state.context = 'page';
        actor.dataset.context = 'page';
        actor.dataset.stop = state.stopId;
        if (home && progress().phase === 'guide') {
          pagePlane(home.showcase?.clip ?? home.clip);
          put(home.rest);
          actor.dataset.phase = 'guide';
          visual(false);
          actor.dataset.activity = returningToViewport
            ? 'viewport-rest'
            : 'rest';
        } else if (progress().phase === 'guide') {
          pagePlane();
          put(destination);
          visual(animate);
          actor.dataset.activity = 'awaiting-card';
        } else {
          portrait();
        }
        idleTimer = setTimeout(pageRoutine, 1000);
      };
      const react = () => {
        if (!animate || !visible) {
          endReturn();
          return;
        }
        busy = true;
        visual(false, state.reaction);
        sequence = gsap.timeline({ onComplete: endReturn });
        gesture(
          sequence,
          state.reaction,
          state.reaction === 'pout' ? 1.1 : 0.7,
        );
        gesture(sequence, 'smile', 0.65);
      };
      fly(destination, react, 1.5, home?.launch?.width ?? 84);
    };
    commands.current = {
      onTarget: (id) => {
        if (!layout.ids.includes(id)) return;
        if (id === state.stopId && busy) return;
        requestedStop = id;
        clearTimeout(idleTimer);
        clearTimeout(targetTimer);
        if (state.context === 'page') {
          const afterScroll = () => {
            const quietFor = performance.now() - lastScrollAt;
            if (quietFor < 180) {
              targetTimer = setTimeout(afterScroll, 190 - quietFor);
              return;
            }
            if (requestedStop) pageRoutine(requestedStop);
          };
          targetTimer = setTimeout(afterScroll, 190);
        }
      },
      onEnter: (slug) => {
        state.pageStopId = layout.ids.includes(slug)
          ? slug
          : layout.choose(state.stopId);
        actor.dataset.slide = '';
        state.pageBox =
          state.context === 'page' ? fit(state.box) : state.pageBox;
        state.context = 'deck';
        state.slug = slug;
        state.visited = new Set();
        state.ids = [];
        arrive();
      },
      onPresenterReady: () => {
        if (state.context === 'deck' && !busy) arrive();
      },
      onExit: () => {
        cancel();
        state.reaction =
          state.ids.length === 0
            ? 'smile'
            : hasSeenEverySlide(state.ids, state.visited)
              ? 'excited'
              : 'pout';
        state.context = 'restoring';
        actor.dataset.context = 'return';
        unclip();
        visual(animate);
      },
      onRestored: returnToPage,
      onSlide: (slug, id, ids) => {
        if (state.context !== 'deck' || state.slug !== slug) return;
        const previous = actor.dataset.slide;
        const changed = previous !== id;
        actor.dataset.slide = id;
        state.visited.add(id);
        state.ids = ids;
        if (changed && previous) flourish();
      },
    };
    const onPageScroll = (event?: Event) => {
      if (state.context === 'deck' || state.context === 'restoring') return;
      if (event && Math.abs(window.scrollY - lastScrollY) < 0.5) return;
      lastScrollAt = performance.now();
      const scrollDelta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      // Once free of the portrait, scrolling must not teleport the actor home.
      if (
        event &&
        phase === 'guide' &&
        progress().phase === 'guide' &&
        (state.context === 'page' || state.context === 'return')
      ) {
        state.context = 'page';
        actor.dataset.context = 'page';
        generation++;
        sequence?.kill();
        sequence = null;
        busy = false;
        clearTimeout(idleTimer);
        actor.style.setProperty('--bank', '0deg');
        portrait(false);
        if (animate && visible) {
          // Carry the same actor along the viewport edge while a page scrolls.
          // It stays winged and in front, then travels to the measured landing.
          pagePlane();
          const carried = carriedFlight(
            { ...state.box, y: state.box.y - scrollDelta },
            state.box.width,
            viewport(),
          );
          put(carried);
          visual(true);
          actor.dataset.activity = 'scroll-flight';
          const clock = { width: carried.width };
          // Rest widths are viewport-safe too, allowing a continuous shrink
          // during direct scrolling rather than an abrupt small-body swap.
          sequence = gsap.timeline();
          sequence.to(clock, {
            width: Math.min(
              carried.width,
              layout.measure(state.stopId)?.launch?.width ?? 72,
              innerWidth <= 640 ? 72 : 84,
            ),
            duration: 0.42,
            ease: 'power1.out',
            onUpdate: () =>
              put(carriedFlight(state.box, clock.width, viewport())),
          });
        } else {
          visual(false);
          put({ ...state.box, y: state.box.y - scrollDelta });
        }
        if (!animate && state.pageClip)
          pagePlane({
            ...state.pageClip,
            top: state.pageClip.top - scrollDelta,
            bottom: state.pageClip.bottom - scrollDelta,
          });
        idleTimer = setTimeout(pageRoutine, 280);
        return;
      }
      cancel();
      state.context = 'page';
      actor.dataset.context = 'page';
      stage.style.zIndex = '20';
      setPose('neutral');
      state.pageClip = null;
      stage.dataset.plane = 'portrait';
      portrait();
      if (progress().phase === 'guide') {
        state.stopId = layout.choose(state.stopId);
        const home = layout.measure(state.stopId);
        if (home) {
          pagePlane(home.clip);
          put(home.box);
          state.inPocket = home.pocket;
          actor.dataset.stop = state.stopId;
        }
      }
      idleTimer = setTimeout(pageRoutine, 280);
    };
    const onResize = () => {
      layout.resize();
      const wasFlying = busy && state.context === 'deck';
      cancel();
      if (state.context === 'deck') {
        unclip();
        visual(false);
        if (wasFlying && animate) flourish();
        else deckRoutine();
      } else if (state.context !== 'restoring') onPageScroll();
    };
    const schedule = () => {
      cancelAnimationFrame(frameRequest);
      frameRequest = requestAnimationFrame(onResize);
    };
    const onPointerDown = () => {
      interacting = true;
      clearTimeout(idleTimer);
    };
    const onPointerUp = () => {
      interacting = false;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(
        () => pageRoutine(requestedStop || undefined),
        300,
      );
    };
    syncPreference.current = (next) => {
      const wasVisible = visible;
      const wasAnimating = animate;
      motion = next.motion;
      animate = next.animate;
      visible = next.visible;
      if (!visible) {
        if (guideButton.current)
          guideButton.current.style.visibility = 'hidden';
        if (deckGuideButton.current)
          deckGuideButton.current.style.visibility = 'hidden';
        cancel();
        visual(false);
        actor.style.opacity = '0';
        if (state.context === 'page') layout.maintain(interacting);
        lastScrollY = window.scrollY;
        return;
      }
      if (!wasVisible) {
        onResize();
        return;
      }
      if (next.reduced) {
        cancel();
        if (state.context === 'deck') deckRoutine();
        else if (state.context === 'return') returnToPage();
        else if (state.context === 'restoring') visual(false);
        else if (state.context === 'page') {
          visual(false);
          if (progress().phase === 'guide') pageRoutine();
          else portrait();
        }
        return;
      }
      if (!animate) {
        sequence?.pause();
        clearTimeout(idleTimer);
        cancelAnimationFrame(slotRequest);
      } else if (!wasAnimating) {
        if (sequence) sequence.resume();
        else if (state.context === 'deck') {
          if (busy) arrive();
          else deckRoutine();
        } else if (state.context === 'page')
          idleTimer = setTimeout(pageRoutine, 300);
      }
    };
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });
    window.addEventListener('scroll', onPageScroll, { passive: true });
    window.addEventListener('resize', schedule);
    photo.current.addEventListener('load', schedule);
    void document.fonts.ready.then(() => {
      if (active) schedule();
    });
    const observer = new ResizeObserver(() => {
      if (state.context === 'deck' && presenterSignature() === presenterBounds)
        return;
      schedule();
    });
    observer.observe(area.current);
    if (state.context === 'deck') {
      unclip();
      stage.style.zIndex = '70';
      deckRoutine();
    } else if (state.context === 'restoring') {
      unclip();
      wings(false);
    } else onPageScroll();
    return () => {
      active = false;
      cancel();
      clearTimeout(targetTimer);
      cancelAnimationFrame(frameRequest);
      observer.disconnect();
      window.removeEventListener('scroll', onPageScroll);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      photo.current?.removeEventListener('load', schedule);
      commands.current = null;
      syncPreference.current = null;
    };
  }, [refs]);
  return events;
}

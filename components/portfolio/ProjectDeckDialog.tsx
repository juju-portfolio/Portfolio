'use client';
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The labelled overflow reading pane and expanded guide note are keyboard-scrollable. */
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import {
  ArrowLeft,
  ArrowRight,
  X,
  Pause,
  Play,
  EyeOff,
  Eye,
  RotateCw,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { loadDeck } from '@/content/load-deck';
import { projects } from '@/content/projects';
import { profile } from '@/content/profile';
import type { ProjectDeck } from '@/lib/content-types';
import { validSlideIndex, type DeckLocation } from '@/lib/deck-navigation';
import { publicAsset } from '@/lib/public-asset';
import SlideRenderer from './SlideRenderer';
import GuideInvitation from './GuideInvitation';

type Props = {
  location: DeckLocation | null;
  onClose: () => void;
  onSlide: (id: string) => void;
  onClosed: () => void;
  characterSlot: RefObject<HTMLDivElement | null>;
  guideButton: RefObject<HTMLButtonElement | null>;
  guidePanel: boolean;
  onGuidePanel: (open: boolean) => void;
  onStartTour: () => void;
  onPresenterReady: () => void;
  onSlideVisited: (slug: string, id: string, ids: string[]) => void;
  motion: boolean;
  systemReduced: boolean;
  onMotion: () => void;
  guideVisible: boolean;
  onGuide: () => void;
};
export default function ProjectDeckDialog({
  location,
  onClose,
  onSlide,
  onClosed,
  characterSlot,
  guideButton,
  guidePanel,
  onGuidePanel,
  onStartTour,
  onPresenterReady,
  onSlideVisited,
  motion,
  systemReduced,
  onMotion,
  guideVisible,
  onGuide,
}: Props) {
  const [lastLocation, setLastLocation] = useState(location);
  if (location && location !== lastLocation) setLastLocation(location);
  const displayLocation = location ?? lastLocation;
  const openSlug = location?.slug;
  useLayoutEffect(() => {
    if (openSlug && guideVisible) onPresenterReady();
  }, [openSlug, guideVisible, onPresenterReady]);
  const project = projects.find((p) => p.slug === displayLocation?.slug);
  const [loaded, setLoaded] = useState<{
    id: string;
    deck: ProjectDeck;
  } | null>(null);
  const [failure, setFailure] = useState<{
    id: string;
    message: string;
  } | null>(null);
  const error = failure?.id === project?.id ? failure?.message : '';
  const [retry, setRetry] = useState(0);
  const [noteOpen, setNoteOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement | null>(null);
  const body = useRef<HTMLElement | null>(null);
  useEffect(() => {
    let active = true;
    if (!project) return;
    loadDeck(project.id)
      .then((deck) => {
        if (active) setLoaded({ id: project.id, deck });
      })
      .catch(() => {
        if (active)
          setFailure({
            id: project.id,
            message:
              'The presentation could not be loaded. You can retry or return to the portfolio.',
          });
      });
    return () => {
      active = false;
    };
  }, [project, retry]);
  const deck = loaded?.id === project?.id ? loaded?.deck : null;
  const index = deck
    ? validSlideIndex(
        deck.slides.map((s) => s.id),
        displayLocation?.slideId ?? null,
      )
    : 0;
  const slide = deck?.slides[index];
  useEffect(() => {
    if (location && slide && location.slideId !== slide.id) onSlide(slide.id);
  }, [location, slide, onSlide]);
  useEffect(() => {
    if (location && slide && deck && !error)
      onSlideVisited(
        location.slug,
        slide.id,
        deck.slides.map((s) => s.id),
      );
  }, [location, slide, deck, error, onSlideVisited]);
  useEffect(() => {
    body.current?.scrollTo({ top: 0, behavior: 'instant' });
    if (!deck) return;
    const next = deck.slides[index + 1];
    if (next?.kind === 'image') {
      const img = new Image();
      img.src = publicAsset(next.image.src);
    }
  }, [deck, index]);
  return (
    <Dialog
      open={!!location}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onOpenChangeComplete={(open) => {
        if (!open) onClosed();
      }}
      disablePointerDismissal
    >
      <DialogContent
        className="project-dialog"
        data-theme={project?.cover?.theme}
        showCloseButton={false}
        initialFocus={closeButton}
        finalFocus={false}
        onKeyDown={(event) => {
          if (!deck || event.altKey || event.metaKey || event.ctrlKey) return;
          if (
            event.target instanceof HTMLElement &&
            event.target.closest(
              'input,textarea,select,[contenteditable=true],summary,[data-image-pan="true"]',
            )
          )
            return;
          if (window.getSelection()?.toString()) return;
          if (event.key === 'ArrowRight' && index < deck.slides.length - 1) {
            event.preventDefault();
            onSlide(deck.slides[index + 1].id);
          }
          if (event.key === 'ArrowLeft' && index > 0) {
            event.preventDefault();
            onSlide(deck.slides[index - 1].id);
          }
        }}
      >
        <div className="deck-topbar">
          <div className="deck-heading">
            <span className="deck-monogram">
              {profile.name
                .split(' ')
                .map((part) => part[0])
                .join('')
                .toLowerCase()}
              <span>.</span>
            </span>
            <div>
              <DialogTitle className="deck-project-title">
                {project?.title ?? 'Project presentation'}
              </DialogTitle>
              <DialogDescription className="deck-description">
                {project?.cover?.eyebrow ?? 'Project'} · Guided presentation
              </DialogDescription>
            </div>
          </div>
          <div className="deck-header-actions">
            <Button
              variant="ghost"
              onClick={onMotion}
              disabled={systemReduced}
              aria-label={
                systemReduced
                  ? 'Reduced motion enabled'
                  : motion
                    ? 'Pause motion'
                    : 'Enable motion'
              }
              title={
                systemReduced
                  ? 'Reduced motion enabled'
                  : motion
                    ? 'Pause motion'
                    : 'Enable motion'
              }
            >
              {motion ? <Pause size={17} /> : <Play size={17} />}
              <span className="desktop-control-label">
                {motion ? 'Pause' : 'Motion'}
              </span>
            </Button>
            <Button
              variant="ghost"
              onClick={onGuide}
              aria-label={guideVisible ? 'Hide guide' : 'Show guide'}
              title={guideVisible ? 'Hide guide' : 'Show guide'}
            >
              {guideVisible ? <EyeOff size={17} /> : <Eye size={17} />}
              <span className="desktop-control-label">Guide</span>
            </Button>
            <DialogClose
              render={
                <Button
                  ref={closeButton}
                  variant="ghost"
                  className="close-deck"
                  aria-label="Close"
                />
              }
            >
              <X size={18} />
              <span>Close</span>
            </DialogClose>
          </div>
        </div>
        <div className={`deck-main ${!guideVisible ? 'guide-hidden' : ''}`}>
          <section
            className="deck-reading"
            ref={body}
            tabIndex={0}
            aria-label="Project slide"
          >
            {error ? (
              <div className="deck-load-state" role="alert">
                <h2>Let’s try that again.</h2>
                <p>{error}</p>
                <Button
                  onClick={() => {
                    setFailure(null);
                    setRetry((v) => v + 1);
                  }}
                >
                  <RotateCw size={16} />
                  Retry presentation
                </Button>
              </div>
            ) : slide ? (
              <article
                key={slide.id}
                data-format={slide.kind}
                className={`slide-article ${motion ? 'slide-enter' : ''}`}
              >
                <p className="eyebrow slide-kicker">
                  {String(index + 1).padStart(2, '0')} /{' '}
                  {slide.kind === 'image'
                    ? 'VISUAL WALKTHROUGH'
                    : (slide.section ?? 'THE PROJECT STORY')}
                </p>
                <h2 className="slide-title">{slide.title}</h2>
                {slide.introduction && (
                  <p className="slide-introduction">{slide.introduction}</p>
                )}
                <div className="slide-content">
                  <SlideRenderer slide={slide} showHighlight={guideVisible} />
                </div>
              </article>
            ) : (
              <output className="deck-load-state">
                <span className="loading-dot" />
                <p>Opening the project story…</p>
              </output>
            )}
          </section>
        </div>
        <div
          className={`deck-bottom presenter-footer ${!guideVisible ? 'presenter-hidden' : ''}`}
        >
          <aside
            className="presenter-stage"
            aria-label="Project guide"
            aria-hidden={!guideVisible}
          >
            <div
              ref={characterSlot}
              className="presenter-slot"
              aria-hidden="true"
            />
            <GuideInvitation
              buttonRef={guideButton}
              open={guidePanel && !!location}
              onOpenChange={onGuidePanel}
              onStart={onStartTour}
              deck
            />
            <div className="presenter-copy">
              <span className="eyebrow">MY TAKE</span>
              <p>
                {error
                  ? 'You can retry the presentation, or close it to return to the page.'
                  : (slide?.guide.text ??
                    'I’m here. Let’s open the project story.')}
              </p>
              <Button
                variant="ghost"
                className="presenter-note-toggle"
                aria-expanded={noteOpen}
                aria-controls="presenter-full-note"
                onClick={() => setNoteOpen((v) => !v)}
              >
                {noteOpen ? 'Close note' : 'Read full note'}
                <ArrowRight size={13} />
              </Button>
            </div>
          </aside>
          <section
            id="presenter-full-note"
            className="presenter-full-note"
            tabIndex={0}
            aria-label="Full guide note"
            hidden={!noteOpen || !guideVisible}
          >
            <p>
              {error
                ? 'You can retry the presentation, or close it to return to the page.'
                : (slide?.guide.text ??
                  'I’m here. Let’s open the project story.')}
            </p>
          </section>
          <div className="deck-navigation">
            <div
              className="deck-progress-label"
              aria-live="polite"
              aria-atomic="true"
            >
              {slide
                ? `${index + 1} of ${deck!.slides.length} — ${slide.title}`
                : 'Loading presentation'}
            </div>
            <div className="deck-controls">
              <Button
                variant="outline"
                className="deck-prev"
                aria-label="Previous slide"
                disabled={!deck || index === 0}
                onClick={() => deck && onSlide(deck.slides[index - 1].id)}
              >
                <ArrowLeft size={17} />
                <span>Previous</span>
              </Button>
              <Button
                className="deck-next"
                aria-label="Next slide"
                disabled={!deck || index === deck.slides.length - 1}
                onClick={() => deck && onSlide(deck.slides[index + 1].id)}
              >
                <span>Next</span>
                <ArrowRight size={17} />
              </Button>
            </div>
          </div>
        </div>
        <div className="deck-progress-track" aria-hidden="true">
          <span
            style={{
              width: deck
                ? `${((index + 1) / deck.slides.length) * 100}%`
                : '0%',
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

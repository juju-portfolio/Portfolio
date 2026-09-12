'use client';
import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, X, Pause, Play, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { projects } from '@/content/projects';

export const tourStops = [
  ...projects.map((p) => ({ id: p.slug, title: p.title, text: p.summary })),
  {
    id: 'about',
    title: 'A little about me',
    text: 'Explore my experience, education, and the skills I bring to a product team.',
  },
  {
    id: 'contact',
    title: 'Let’s talk',
    text: 'My email and LinkedIn are here when you’re ready to get in touch.',
  },
];

export default function GuideTour({
  index,
  onChange,
  onExit,
  onTarget,
  reduced,
  suspended,
  motion,
  onMotion,
  onHide,
}: {
  index: number | null;
  onChange: (index: number) => void;
  onExit: () => void;
  onTarget: (id: string) => void;
  reduced: boolean;
  suspended: boolean;
  motion: boolean;
  onMotion: () => void;
  onHide: () => void;
}) {
  const last = useRef(-1);
  const nextButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (index === null) {
      last.current = -1;
      return;
    }
    if (suspended) {
      last.current = -1;
      return;
    }
    if (!motion) window.scrollTo({ top: window.scrollY, behavior: 'instant' });
    if (last.current === index) return;
    last.current = index;
    const stop = tourStops[index];
    const target = document.querySelector<HTMLElement>(
      `[data-guide-stop="${stop.id}"]`,
    );
    if (!target) return;
    const cover = target.querySelector<HTMLElement>('.project-cover') ?? target;
    window.scrollTo({
      top:
        window.scrollY +
        cover.getBoundingClientRect().top -
        (innerWidth <= 640 ? 12 : 64),
      behavior: reduced || !motion ? 'instant' : 'smooth',
    });
    onTarget(stop.id);
    nextButton.current?.focus({ preventScroll: true });
  }, [index, suspended, onTarget, reduced, motion]);
  useEffect(() => {
    if (index === null || suspended) return;
    const escape = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        !event.defaultPrevented &&
        !(
          event.target instanceof Element &&
          event.target.closest('[data-slot="popover-content"]')
        )
      ) {
        event.stopPropagation();
        onExit();
      }
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [index, suspended, onExit]);
  if (index === null || suspended) return null;
  const stop = tourStops[index];
  return (
    <section className="guide-tour" aria-label="Portfolio tour">
      <div className="tour-heading">
        <span>
          THE QUICK TOUR{' '}
          <span>
            {index + 1} / {tourStops.length}
          </span>
        </span>
        <div className="tour-actions">
          <Button
            variant="ghost"
            onClick={onMotion}
            disabled={reduced}
            aria-label={
              reduced
                ? 'Reduced motion enabled'
                : motion
                  ? 'Pause motion'
                  : 'Enable motion'
            }
          >
            {motion ? <Pause size={14} /> : <Play size={14} />}
          </Button>
          <Button variant="ghost" onClick={onHide} aria-label="Hide guide">
            <EyeOff size={14} />
          </Button>
          <Button variant="ghost" onClick={onExit} aria-label="Exit tour">
            <X size={16} />
          </Button>
        </div>
      </div>
      <div className="tour-description" aria-live="polite" aria-atomic="true">
        <h2>{stop.title}</h2>
        <p>{stop.text}</p>
      </div>
      <div className="tour-controls">
        <Button
          variant="ghost"
          disabled={index === 0}
          onClick={() => onChange(index - 1)}
          aria-label="Previous tour stop"
        >
          <ArrowLeft size={15} />
        </Button>
        <Button
          ref={nextButton}
          onClick={() =>
            index === tourStops.length - 1 ? onExit() : onChange(index + 1)
          }
        >
          {index === tourStops.length - 1 ? 'Finish tour' : 'Next stop'}
          <ArrowRight size={15} />
        </Button>
      </div>
    </section>
  );
}

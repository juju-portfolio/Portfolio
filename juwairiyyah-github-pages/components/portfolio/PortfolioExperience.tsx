'use client';
/* oxlint-disable next/no-img-element -- The portrait is measured and masked with its matching cartoon layer. */
import { useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  ArrowRight,
  Pause,
  Play,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { profile } from '@/content/profile';
import { characterArt } from '@/content/character';
import { publicAsset } from '@/lib/public-asset';
import { projects } from '@/content/projects';
import { useDeckNavigation } from '@/hooks/use-deck-navigation';
import { useMotionPreference } from '@/hooks/use-motion-preference';
import { usePortraitMotion } from '@/hooks/use-portrait-motion';
import GuideCharacter from './GuideCharacter';
import GuideRegion from './GuideRegion';
import ProjectDeckDialog from './ProjectDeckDialog';
import GuideInvitation from './GuideInvitation';
import GuideTour, { tourStops } from './GuideTour';

export default function PortfolioExperience() {
  const preference = useMotionPreference();
  const [guideVisible, setGuideVisible] = useState(true);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [guidePanel, setGuidePanel] = useState(false);
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const guideButton = useRef<HTMLButtonElement>(null);
  const deckGuideButton = useRef<HTMLButtonElement>(null);
  const area = useRef<HTMLDivElement>(null),
    frame = useRef<HTMLDivElement>(null),
    photo = useRef<HTMLImageElement>(null),
    character = useRef<HTMLDivElement>(null),
    layer = useRef<HTMLDivElement>(null),
    hero = useRef<HTMLElement>(null),
    deckDock = useRef<HTMLDivElement>(null);
  const refs = useMemo(
    () => ({
      area,
      frame,
      photo,
      character,
      layer,
      hero,
      deckDock,
      guideButton,
      deckGuideButton,
    }),
    [],
  );
  const journey = usePortraitMotion(refs, {
    motion: preference.motion,
    animate: preference.animate && !guidePanel,
    visible: guideVisible,
    reduced: preference.systemReduced,
  });
  const navigation = useDeckNavigation(journey);
  const toggleGuide = () => {
    setGuideVisible((v) => !v);
    setGuidePanel(false);
    setTourIndex(null);
  };
  const startTour = () => {
    setGuidePanel(false);
    setTourIndex(0);
    if (navigation.location) navigation.close();
  };
  const exitTour = () => {
    if (tourIndex !== null) journey.onTarget(tourStops[tourIndex].id);
    setTourIndex(null);
    guideButton.current?.focus({ preventScroll: true });
  };
  return (
    <div
      className="portfolio"
      data-restoring={navigation.restoring}
      data-guide-visible={guideVisible}
    >
      <a className="skip-link" href="#work">
        Skip to projects
      </a>
      <header className="site-header">
        <a className="wordmark" href="#top">
          {profile.name}
          <span>.</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">
            Get in touch <ArrowUpRight size={16} />
          </a>
        </nav>
      </header>
      <main id="top">
        <section
          ref={hero}
          className="hero section-wrap"
          aria-labelledby="hero-heading"
        >
          <div className="hero-copy">
            <p className="eyebrow availability">
              <span /> {profile.positioning}
            </p>
            <h1 id="hero-heading">
              Curious about people.
              <br />
              Serious about
              <br />
              <span>better products.</span>
            </h1>
            <p className="hero-description">{profile.introduction}</p>
            <a className={`${buttonVariants()} primary-cta`} href="#work">
              Explore my work <ArrowDown size={18} />
            </a>
            <p className="hero-footnote">
              Frontend · AI · Analytics · Project coordination
            </p>
          </div>
          <div ref={area} className="portrait-area">
            <div ref={frame} className="portrait-frame">
              {photoFailed && (
                <p className="portrait-fallback">Portrait unavailable.</p>
              )}
              <img
                ref={photo}
                src={`${publicAsset(profile.portrait.src)}?v=${characterArt.assetVersion}`}
                width={profile.portrait.width}
                height={profile.portrait.height}
                alt={profile.portrait.alt}
                style={{
                  objectPosition: `50% ${characterArt.alignment.portraitObjectY * 100}%`,
                }}
                onError={() => setPhotoFailed(true)}
                className={photoFailed ? 'photo-failed' : ''}
              />
            </div>
            <p className="portrait-caption">
              {characterArt.portraitKind === 'illustrated'
                ? 'Illustrated portrait.'
                : 'A face behind the thinking.'}
              <span>
                Scroll to meet the guide <ArrowDown size={13} />
              </span>
            </p>
          </div>
        </section>
        <section
          id="work"
          className="work-section section-wrap"
          aria-labelledby="work-heading"
        >
          <div className="work-intro">
            <div className="section-heading">
              <h2 id="work-heading" tabIndex={-1} className="eyebrow">
                01 / SELECTED PROJECTS
              </h2>
              <span className="heading-rule" />
              <p>Five projects. One curious perspective.</p>
            </div>
            {navigation.notice && (
              <output className="navigation-notice">{navigation.notice}</output>
            )}
            <div className="page-guide-row">
              <div className="page-guide-caption">
                <span className="eyebrow">YOUR PROJECT COMPANION</span>
                <p>Pick a project. I’ll guide you through it.</p>
              </div>
              <div className="page-guide-controls">
                <Button
                  variant="ghost"
                  onClick={preference.toggle}
                  disabled={preference.systemReduced}
                  aria-label={
                    preference.motion ? 'Pause motion' : 'Enable motion'
                  }
                >
                  {preference.motion ? <Pause size={14} /> : <Play size={14} />}
                  <span>
                    {preference.systemReduced
                      ? 'Reduced motion'
                      : preference.motion
                        ? 'Pause motion'
                        : 'Motion off'}
                  </span>
                </Button>
                <Button variant="ghost" onClick={toggleGuide}>
                  {guideVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{guideVisible ? 'Hide guide' : 'Show guide'}</span>
                </Button>
              </div>
            </div>
          </div>
          <div className="project-grid">
            {projects.map((project, index) => (
              <GuideRegion
                id={project.slug}
                className="project-card"
                key={project.id}
              >
                <button
                  id={`project-${project.slug}`}
                  className="project-open"
                  onPointerEnter={() => journey.onTarget(project.slug)}
                  onFocus={() => journey.onTarget(project.slug)}
                  onClick={() =>
                    navigation.open(project.slug, `project-${project.slug}`)
                  }
                  aria-label={`Open ${project.title} presentation`}
                >
                  <div
                    className={`project-cover cover-${project.cover?.theme}`}
                  >
                    <div className="cover-kicker">
                      {String(index + 1).padStart(2, '0')} /{' '}
                      {project.cover?.eyebrow}
                    </div>
                    <h3>
                      {project.cover?.headline[0]}
                      <br />
                      {project.cover?.headline[1]}
                    </h3>
                    <div className="concept-route project-topics">
                      <span>{project.cover?.tags[0]}</span>
                      <i />
                      <span>
                        {project.cover?.tags[1]} <ArrowUpRight size={16} />
                      </span>
                    </div>
                    <span className="cover-tag">{project.cover?.note}</span>
                  </div>
                  <div className="project-title-row">
                    <h3>{project.title}</h3>
                    <ArrowUpRight />
                  </div>
                  <p>{project.summary}</p>
                  <span className="project-link">
                    Explore the project <ArrowRight size={16} />
                  </span>
                </button>
              </GuideRegion>
            ))}
          </div>
          <p className="sample-note">
            Explore what I built, how I read the problem, and what I would
            improve next.
          </p>
        </section>
        <GuideRegion id="about" className="about-guide">
          <section id="about" className="about-section section-wrap">
            <div className="section-heading">
              <h2 className="eyebrow">02 / ABOUT & EXPERIENCE</h2>
              <span className="heading-rule" />
              <p>Technical foundations. A product direction.</p>
            </div>
            <div className="about-introduction">
              <h3>
                Engineering curiosity.
                <br />
                <span>Bringing people and projects together.</span>
              </h3>
              <div>
                {profile.about.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
            <div className="resume-grid">
              <div className="experience-list">
                <h3 className="eyebrow resume-label">EXPERIENCE</h3>
                {profile.experience.map((experience) => (
                  <article
                    className="experience-item"
                    key={experience.organization}
                  >
                    <p className="experience-date">{experience.dates}</p>
                    <h4>{experience.organization}</h4>
                    <p className="experience-role">{experience.role}</p>
                    <ul>
                      {experience.summary.map((summary) => (
                        <li key={summary}>{summary}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
              <div className="resume-sidebar">
                <section aria-label="Education">
                  <h3 className="eyebrow resume-label">EDUCATION</h3>
                  {profile.education.map((education) => (
                    <div className="education-item" key={education.institution}>
                      <p className="experience-date">{education.dates}</p>
                      <h4>{education.qualification}</h4>
                      <p>{education.institution}</p>
                      <strong>{education.detail}</strong>
                    </div>
                  ))}
                </section>
                <section aria-label="Skills">
                  <h3 className="eyebrow resume-label">SKILLS & TOOLS</h3>
                  <ul className="skill-list">
                    {profile.skills.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </section>
        </GuideRegion>
        <GuideRegion id="contact" className="contact-guide">
          <footer id="contact" className="site-footer section-wrap">
            <div>
              <p className="eyebrow">LET’S BUILD SOMETHING USEFUL</p>
              <h2>
                It starts with a conversation<span>.</span>
              </h2>
              <p>
                I’m looking for a Product Manager or Product Owner internship
                where I can contribute my technical foundation and coordination
                experience.
              </p>
              <div className="contact-links">
                <a href={`mailto:${profile.contact.email}`}>
                  {profile.contact.email} <ArrowUpRight size={17} />
                </a>
                <a
                  href={profile.contact.linkedIn}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn <ArrowUpRight size={17} />
                </a>
              </div>
            </div>
            <a href="#top" className="back-top" aria-label="Back to top">
              <ArrowUpRight />
            </a>
            <div className="footer-bottom">
              <span>{profile.name} · Product portfolio</span>
              <span>Thoughtfully curious. Always learning.</span>
            </div>
          </footer>
        </GuideRegion>
      </main>
      <div ref={layer} className="page-character-layer" aria-hidden="true">
        <GuideCharacter
          ref={character}
          animate={preference.animate && !guidePanel}
        />
      </div>
      <GuideInvitation
        buttonRef={guideButton}
        open={guidePanel && !navigation.location}
        onOpenChange={setGuidePanel}
        onStart={startTour}
      />
      <GuideTour
        index={tourIndex}
        onChange={setTourIndex}
        onExit={exitTour}
        onTarget={journey.onTarget}
        reduced={preference.systemReduced}
        suspended={!!navigation.location || navigation.restoring}
        motion={preference.motion}
        onMotion={preference.toggle}
        onHide={toggleGuide}
      />
      <ProjectDeckDialog
        location={navigation.location}
        onClose={() => {
          setGuidePanel(false);
          navigation.close();
        }}
        onSlide={navigation.selectSlide}
        onClosed={navigation.restore}
        guideButton={deckGuideButton}
        guidePanel={guidePanel}
        onGuidePanel={setGuidePanel}
        onStartTour={startTour}
        characterSlot={deckDock}
        onPresenterReady={journey.onPresenterReady}
        onSlideVisited={journey.onSlide}
        motion={preference.motion}
        systemReduced={preference.systemReduced}
        onMotion={preference.toggle}
        guideVisible={guideVisible}
        onGuide={toggleGuide}
      />
    </div>
  );
}

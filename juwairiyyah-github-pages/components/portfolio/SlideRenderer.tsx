'use client';
/* oxlint-disable next/no-img-element -- Local slide images have authored dimensions, transcripts, and load-error handling. */
import { useState } from 'react';
import { Expand, Minimize, ArrowRight, RotateCw, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProjectDeck, PublicAsset } from '@/lib/content-types';
import { publicAsset } from '@/lib/public-asset';

function SlideImage({ asset }: { asset: PublicAsset }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <p className="slide-image-fallback">
      This image could not be loaded. {asset.alt}
    </p>
  ) : (
    <img
      className="slide-media"
      src={publicAsset(asset.src)}
      width={asset.width}
      height={asset.height}
      alt={asset.alt}
      onError={() => setFailed(true)}
    />
  );
}
export default function SlideRenderer({
  slide,
  showHighlight,
}: {
  slide: ProjectDeck['slides'][number];
  showHighlight: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const target = showHighlight ? slide.guide.targetId : undefined;
  if (slide.kind === 'image')
    return (
      <div className="image-slide">
        <div className="image-controls">
          <Button
            variant="outline"
            aria-pressed={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? <Minimize size={16} /> : <Expand size={16} />}
            {expanded ? 'Fit image' : 'Enlarge image'}
          </Button>
          {expanded && <span>Scroll within the image to explore.</span>}
        </div>
        <div
          className="image-pan"
          data-image-pan={expanded}
          tabIndex={expanded ? 0 : undefined}
          role={expanded ? 'region' : undefined}
          aria-label={expanded ? 'Enlarged project image' : undefined}
        >
          <div
            className="image-stage"
            style={{
              aspectRatio: `${slide.image.width}/${slide.image.height}`,
              width: expanded ? `${slide.image.width}px` : undefined,
            }}
          >
            <SlideImage key={slide.image.src} asset={slide.image} />
            {slide.hotspots
              ?.filter((h) => h.id === target)
              .map((h) => (
                <div
                  key={h.id}
                  className="image-hotspot"
                  aria-hidden="true"
                  style={{
                    left: `${h.x * 100}%`,
                    top: `${h.y * 100}%`,
                    width: `${h.width * 100}%`,
                    height: `${h.height * 100}%`,
                  }}
                />
              ))}
          </div>
        </div>
        <details className="image-transcript">
          <summary>Read the text version</summary>
          <p>{slide.transcript}</p>
        </details>
      </div>
    );
  return (
    <div className="slide-blocks">
      {slide.blocks.map((block) => (
        <div
          key={block.id}
          id={`slide-block-${block.id}`}
          className={`slide-block ${block.kind}-block ${target === block.id ? 'is-highlighted' : ''}`}
        >
          {block.kind === 'text' && <p>{block.text}</p>}
          {block.kind === 'exhibit' && (
            <figure className={`product-exhibit exhibit-${block.layout}`}>
              <figcaption className="exhibit-label">{block.label}</figcaption>
              {slide.id === 'priority' && (
                <div
                  className="responsive-concept"
                  aria-label="Illustrative desktop and mobile views of the same installation record"
                >
                  {['wide', 'phone'].map((size) => (
                    <div key={size} className={`concept-device device-${size}`}>
                      <div className="device-toolbar">
                        <Sun size={16} />
                        <span>Installation record</span>
                        <i />
                        <i />
                      </div>
                      <div className="device-record">
                        <span className="record-label">SOLAR INSTALLATION</span>
                        <h3>Review status</h3>
                        <p>
                          <span className="status-dot" /> Status unavailable
                        </p>
                        <div className="concept-action">
                          <RotateCw size={14} />
                          Retry status
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <ol
                className={`exhibit-items ${slide.id === 'priority' ? 'supporting-explanation' : ''}`}
              >
                {block.items.map((item, index) => (
                  <li key={item.label}>
                    {block.layout === 'states' ? (
                      <>
                        <div className="state-trigger">
                          <span className="state-indicator" />
                          {item.label}
                        </div>
                        <ArrowRight
                          className="state-arrow"
                          size={18}
                          aria-hidden="true"
                        />
                        <div className="state-response">
                          <h3>{item.title}</h3>
                          <p>{item.text}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="exhibit-step" aria-hidden="true">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="exhibit-item-label">{item.label}</span>
                        <h3>{item.title}</h3>
                        <p>{item.text}</p>
                      </>
                    )}
                  </li>
                ))}
              </ol>
              {block.takeaway && (
                <p className="exhibit-takeaway">{block.takeaway}</p>
              )}
            </figure>
          )}
          {block.kind === 'list' && (
            <ol className="slide-list">
              {block.items.map((item, i) => (
                <li key={`${i}-${item}`}>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          )}
          {block.kind === 'facts' && (
            <dl className="slide-facts">
              {block.items.map((item, index) => (
                <div key={`${index}-${item.label}`}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {block.kind === 'decision' && (
            <>
              <span className="eyebrow">THE CHOICE</span>
              <h3>{block.choice}</h3>
              <p>{block.rationale}</p>
              {block.alternative && (
                <p className="decision-alternative">
                  <strong>The trade-off: </strong>
                  {block.alternative}
                </p>
              )}
            </>
          )}
          {block.kind === 'image' && (
            <figure>
              <SlideImage key={block.asset.src} asset={block.asset} />
              {block.caption && <figcaption>{block.caption}</figcaption>}
            </figure>
          )}
          {block.kind === 'outcome' && (
            <>
              <span className="evidence-label">
                {block.evidence === 'proposed'
                  ? 'PROPOSED NEXT STEP'
                  : block.evidence === 'deliverable'
                    ? 'DELIVERABLE'
                    : 'RESULT / LEARNING'}
              </span>
              <p>{block.text}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

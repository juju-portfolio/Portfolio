'use client';
/* oxlint-disable next/no-img-element -- The character uses aligned transparent layers and a continuous arm rig. */
import { forwardRef, useState, type CSSProperties } from 'react';
import { characterArt } from '@/content/character';
import { featherKeyframes } from '@/lib/wing-keyframes';
import { publicAsset } from '@/lib/public-asset';
import GuideWave from './GuideWave';
const GuideCharacter = forwardRef<HTMLDivElement, { animate?: boolean }>(
  function GuideCharacter({ animate = false }, ref) {
    const [failed, setFailed] = useState(false);
    return (
      <div
        ref={ref}
        className="guide-character female-guide"
        style={
          {
            '--guide-wing-image': `url("${publicAsset('/media/guide/wings.png')}")`,
          } as CSSProperties
        }
        data-animate={animate}
        data-testid="guide-character"
        aria-hidden="true"
      >
        <style>{featherKeyframes}</style>
        <div className="character-rig">
          <div className="flight-float">
            <div className="character-wings">
              <i className="wing-left" />
              <i className="wing-right" />
            </div>
            {!failed ? (
              <div className="character-inner">
                {Object.entries(characterArt.poses).map(([pose, src]) => (
                  <div key={pose} className={`character-pose art-${pose}`}>
                    {pose === 'wave' ? (
                      <GuideWave
                        src={`${publicAsset(src)}?v=${characterArt.assetVersion}`}
                      />
                    ) : (
                      <img
                        src={`${publicAsset(src)}?v=${characterArt.assetVersion}`}
                        alt=""
                        draggable={false}
                        onError={
                          pose === 'neutral' ? () => setFailed(true) : undefined
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <span className="character-fallback">Guide</span>
            )}
          </div>
        </div>
        <span className="character-ground" />
      </div>
    );
  },
);
export default GuideCharacter;

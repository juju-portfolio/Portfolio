'use client';
import { useEffect, useId, useRef } from 'react';
import gsap from 'gsap';

// A continuous, local deformation bends the intact hand AND forearm together.
// Neutral pixels leave the rest of the image untouched; no limb is cut out.
const waveMap = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536"><defs><radialGradient id="falloff"><stop stop-color="#ff8080"/><stop offset=".42" stop-color="#e88080"/><stop offset="1" stop-color="#808080"/></radialGradient></defs><rect width="1024" height="1536" fill="#808080"/><ellipse cx="280" cy="290" rx="86" ry="250" fill="url(#falloff)"/></svg>`)}`;

export default function GuideWave({ src }: { src: string }) {
  const id = `guide-wave-${useId().replace(/:/g, '')}`;
  const svg = useRef<SVGSVGElement>(null);
  const warp = useRef<SVGFEDisplacementMapElement>(null);
  useEffect(() => {
    const actor = svg.current?.closest('.guide-character');
    if (!actor || !warp.current) return;
    const motion = gsap.fromTo(
      warp.current,
      { attr: { scale: -64 } },
      {
        attr: { scale: 64 },
        duration: 0.72,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        paused: true,
      },
    );
    const sync = () => {
      if (
        actor.getAttribute('data-animate') === 'true' &&
        actor.getAttribute('data-pose') === 'wave'
      )
        motion.resume();
      else motion.pause();
    };
    const observer = new MutationObserver(sync);
    observer.observe(actor, {
      attributes: true,
      attributeFilter: ['data-pose', 'data-animate'],
    });
    sync();
    return () => {
      observer.disconnect();
      motion.kill();
    };
  }, []);
  return (
    <svg
      ref={svg}
      className="guide-wave"
      viewBox="0 0 1024 1536"
      aria-hidden="true"
    >
      <defs>
        <filter
          id={id}
          x="0"
          y="0"
          width="1024"
          height="1536"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            href={waveMap}
            x="0"
            y="0"
            width="1024"
            height="1536"
            result="bend"
          />
          <feDisplacementMap
            ref={warp}
            in="SourceGraphic"
            in2="bend"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <image href={src} width="1024" height="1536" filter={`url(#${id})`} />
    </svg>
  );
}

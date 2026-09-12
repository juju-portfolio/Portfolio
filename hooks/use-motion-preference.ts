'use client';
import { useEffect, useState } from 'react';
export function useMotionPreference() {
  const [systemReduced, setSystemReduced] = useState(true);
  const [paused, setPaused] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setSystemReduced(query.matches);
    const vis = () => setTabVisible(!document.hidden);
    sync();
    vis();
    query.addEventListener('change', sync);
    document.addEventListener('visibilitychange', vis);
    return () => {
      query.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', vis);
    };
  }, []);
  return {
    motion: !systemReduced && !paused,
    animate: !systemReduced && !paused && tabVisible,
    paused,
    systemReduced,
    toggle: () => setPaused((p) => !p),
  };
}

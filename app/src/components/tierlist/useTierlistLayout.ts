import { RefObject, useEffect, useRef, useState } from 'react';
import { ITEM_SIZE, TIER_LABEL_WIDTH } from './tierlistUtils';

interface TierlistLayout {
  containerRef: RefObject<HTMLDivElement | null>;
  perRow: number;
}

export default function useTierlistLayout(): TierlistLayout {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return {
    containerRef,
    perRow: Math.max(1, Math.floor((containerWidth - TIER_LABEL_WIDTH) / ITEM_SIZE)),
  };
}

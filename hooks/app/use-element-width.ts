'use client';

import { RefObject, useEffect, useRef, useState } from 'react';

type UseElementWidthReturn<T extends HTMLElement> = [RefObject<T | null>, number];

export function useElementWidth<T extends HTMLElement>(): UseElementWidthReturn<T> {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setWidth(width);
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return [ref, width];
}

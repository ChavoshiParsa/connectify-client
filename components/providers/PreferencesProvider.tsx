'use client';

import { usePreferencesStore } from '@/stores/preferences-store';
import { useEffect } from 'react';

export default function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const colorTheme = usePreferencesStore((state) => state.colorTheme);
  const fontSize = usePreferencesStore((state) => state.fontSize);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.colorTheme = colorTheme;
    root.dataset.fontSize = fontSize;
  }, [colorTheme, fontSize]);

  return children;
}

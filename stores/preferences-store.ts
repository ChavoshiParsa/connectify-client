import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ColorTheme = 'sky' | 'violet' | 'emerald' | 'rose' | 'amber';
export type FontSize = 'small' | 'medium' | 'large';

type PreferencesState = {
  colorTheme: ColorTheme;
  fontSize: FontSize;
  setColorTheme: (theme: ColorTheme) => void;
  setFontSize: (size: FontSize) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      colorTheme: 'sky',
      fontSize: 'medium',
      setColorTheme: (colorTheme) => set({ colorTheme }),
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    { name: 'connectify-preferences', storage: createJSONStorage(() => localStorage) },
  ),
);

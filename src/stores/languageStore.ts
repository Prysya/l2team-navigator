import { create } from 'zustand';

export type Lang = 'en' | 'ru';

interface LanguageStore {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLanguageStore = create<LanguageStore>(set => ({
  lang: 'en',
  setLang: lang => set({ lang }),
}));

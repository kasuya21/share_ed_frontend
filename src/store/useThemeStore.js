import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',

      setTheme: (theme) => {
        set({ theme });
        get().applyTheme(theme);
      },

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
      },

      applyTheme: (theme) => {
        const root = document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      },

      initialize: () => {
        get().applyTheme(get().theme);
      },
    }),
    { name: 'share-ed-theme', partialize: (s) => ({ theme: s.theme }) }
  )
);

export default useThemeStore;

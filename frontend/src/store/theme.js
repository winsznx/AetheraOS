import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Theme Store
 * Global state management for dark/light mode theme
 */
const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',

      /**
       * Toggle between light and dark themes
       */
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });

        // Update document class for Tailwind dark mode
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      /**
       * Set specific theme
       * @param {string} theme - 'light' or 'dark'
       */
      setTheme: (theme) => {
        set({ theme });
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      /**
       * Initialize theme on app load
       */
      initTheme: () => {
        const savedTheme = get().theme;
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      }
    }),
    {
      name: 'aethera-theme-storage',
    }
  )
);

export default useThemeStore;

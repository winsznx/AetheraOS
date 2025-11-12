import { Moon, Sun } from 'lucide-react';
import useThemeStore from '../store/theme';
import { cn } from '../utils/cn';

/**
 * Theme Toggle Component
 * Button to switch between light and dark modes
 *
 * @param {string} className - Additional CSS classes
 */
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'p-2 rounded-lg transition-all duration-200',
        'hover:bg-gray-200 dark:hover:bg-gray-700',
        'focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white',
        className
      )}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <Sun className="w-5 h-5 text-gray-300" />
      )}
    </button>
  );
}

import { cn } from '../utils/cn';

/**
 * Card Component
 * A reusable card component for displaying content with dark mode support
 *
 * @param {React.ReactNode} children - Content to display inside the card
 * @param {string} className - Additional CSS classes
 * @param {boolean} hover - Enable hover effect
 */
export default function Card({ children, className = '', hover = false }) {
  const hoverStyles = hover
    ? 'hover:shadow-xl hover:-translate-y-0.5 cursor-pointer'
    : '';

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-300',
        'border border-gray-200 dark:border-gray-700',
        hoverStyles,
        className
      )}
    >
      {children}
    </div>
  );
}

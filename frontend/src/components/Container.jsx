import { cn } from '../utils/cn';

/**
 * Container Component
 * A responsive container for centering and constraining content width
 *
 * @param {React.ReactNode} children - Content to display inside the container
 * @param {string} className - Additional CSS classes
 * @param {string} maxWidth - Maximum width variant ('sm', 'md', 'lg', 'xl', 'full')
 */
export default function Container({ children, className = '', maxWidth = 'xl' }) {
  const maxWidths = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', maxWidths[maxWidth], className)}>
      {children}
    </div>
  );
}

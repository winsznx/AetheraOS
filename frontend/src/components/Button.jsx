import { cn } from '../utils/cn';

/**
 * Button Component
 * A reusable button component with multiple variants and dark mode support
 *
 * @param {string} label - Text to display inside the button
 * @param {function} onClick - Callback function on click
 * @param {string} variant - Button style variant ('primary', 'secondary', 'outline', 'ghost')
 * @param {string} size - Button size ('sm', 'md', 'lg')
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} icon - Optional icon component
 * @param {boolean} disabled - Disable button
 */
export default function Button({
  label,
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  disabled = false,
  type = 'button'
}) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-brand-black text-white hover:bg-gray-700 dark:bg-white dark:text-brand-black dark:hover:bg-brand-light',
    secondary: 'bg-gray-100 text-brand-black hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
    outline: 'border-2 border-brand-black text-brand-black hover:bg-gray-100 dark:border-white dark:text-white dark:hover:bg-gray-800',
    ghost: 'text-brand-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
    >
      {icon && <span className="inline-flex">{icon}</span>}
      {label || children}
    </button>
  );
}

import { Circle, Activity, Pause, Power } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Agent Status Badge
 * Display agent status with icon and color
 *
 * @param {'online' | 'busy' | 'offline'} status - Agent status
 * @param {boolean} showIcon - Show status icon
 * @param {string} className - Additional CSS classes
 */
export default function AgentStatus({ status, showIcon = true, className = '' }) {
  const statusConfig = {
    online: {
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
      icon: Activity,
      label: 'Online'
    },
    busy: {
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      icon: Pause,
      label: 'Busy'
    },
    offline: {
      color: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-gray-100 dark:bg-gray-700',
      icon: Power,
      label: 'Offline'
    }
  };

  const config = statusConfig[status] || statusConfig.offline;
  const Icon = config.icon;

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
      config.bg,
      config.color,
      className
    )}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{config.label}</span>
    </div>
  );
}

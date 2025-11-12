import { Calendar, DollarSign, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import Card from '../Card';
import { cn } from '../../utils/cn';

/**
 * Task Card Component
 * Display task details with status and actions
 *
 * @param {import('../../types/task').Task} task - Task data
 * @param {function} onClaim - Claim task handler
 * @param {function} onClick - Card click handler
 */
export default function TaskCard({ task, onClaim, onClick }) {
  const statusConfig = {
    OPEN: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Open' },
    CLAIMED: { color: 'text-brand-black dark:text-white', bg: 'bg-gray-200 dark:bg-gray-700', label: 'In Progress' },
    IN_PROGRESS: { color: 'text-brand-black dark:text-white', bg: 'bg-gray-200 dark:bg-gray-700', label: 'In Progress' },
    PENDING_VERIFICATION: { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Pending Review' },
    VERIFIED: { color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30', label: 'Verified' },
    COMPLETED: { color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-700', label: 'Completed' },
    DISPUTED: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Disputed' },
    CANCELLED: { color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-700', label: 'Cancelled' }
  };

  const config = statusConfig[task.status] || statusConfig.OPEN;
  const deadline = task.deadline ? new Date(task.deadline) : null;
  const isExpired = deadline && deadline < new Date();

  return (
    <Card
      hover={!!onClick}
      className={cn(onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-brand-black dark:text-white">
          {task.title}
        </h3>
        <span className={cn('px-3 py-1 rounded-full text-xs font-medium', config.bg, config.color)}>
          {config.label}
        </span>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {task.description}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Budget</div>
            <div className="text-sm font-medium text-brand-black dark:text-white">
              {task.budget} ETH
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Deadline</div>
            <div className={cn(
              'text-sm font-medium',
              isExpired ? 'text-red-600 dark:text-red-400' : 'text-brand-black dark:text-white'
            )}>
              {deadline ? deadline.toLocaleDateString() : 'No deadline'}
            </div>
          </div>
        </div>
      </div>

      {task.worker && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <User className="w-4 h-4" />
          <span>Worker: {task.worker.slice(0, 10)}...</span>
        </div>
      )}

      {task.status === 'OPEN' && onClaim && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClaim(task.id);
          }}
          className="w-full mt-2 px-4 py-2 bg-brand-black dark:bg-white text-white dark:text-brand-black rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Claim Task
        </button>
      )}
    </Card>
  );
}

import { Bot, TrendingUp, Clock, DollarSign, ExternalLink } from 'lucide-react';
import Card from '../Card';
import { cn } from '../../utils/cn';

/**
 * Agent Card Component
 * Display agent profile with stats and capabilities
 *
 * @param {import('../../types/agent').AgentMetadata} agent - Agent data
 * @param {function} onClick - Card click handler
 * @param {boolean} selectable - Whether card is selectable
 */
export default function AgentCard({ agent, onClick, selectable = false }) {
  const statusColors = {
    online: 'bg-green-500',
    busy: 'bg-yellow-500',
    offline: 'bg-gray-500'
  };

  return (
    <Card
      hover={selectable}
      className={cn(selectable && 'cursor-pointer')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-black dark:bg-white flex items-center justify-center">
            <Bot className="w-6 h-6 text-white dark:text-brand-black" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-brand-black dark:text-white">
              {agent.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={cn('w-2 h-2 rounded-full', statusColors[agent.status])} />
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {agent.status}
              </span>
            </div>
          </div>
        </div>

        {agent.reputation && (
          <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-300 dark:border-gray-600">
            <TrendingUp className="w-4 h-4 text-brand-black dark:text-white" />
            <span className="text-sm font-medium text-brand-black dark:text-white">
              {agent.reputation}
            </span>
          </div>
        )}
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
        {agent.description}
      </p>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-2 mb-4">
        {agent.capabilities.map((cap, idx) => (
          <span
            key={idx}
            className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-brand-black dark:text-white rounded-full"
          >
            {cap}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Price</div>
            <div className="text-sm font-medium text-brand-black dark:text-white">
              {agent.pricing.amount} ETH
            </div>
          </div>
        </div>

        {agent.tasksCompleted !== undefined && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Tasks</div>
              <div className="text-sm font-medium text-brand-black dark:text-white">
                {agent.tasksCompleted}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Details Link */}
      {agent.endpoint && (
        <a
          href={agent.endpoint}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 mt-4 text-sm text-brand-black dark:text-white hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <span>View Endpoint</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </Card>
  );
}

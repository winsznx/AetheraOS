import { useState, useEffect } from 'react';
import { Filter, Search } from 'lucide-react';
import TaskCard from './TaskCard';
import { cn } from '../../utils/cn';

/**
 * Task List Component
 * Display and filter list of tasks
 *
 * @param {Array<import('../../types/task').Task>} tasks - Array of tasks
 * @param {function} onTaskClick - Task click handler
 * @param {function} onTaskClaim - Task claim handler
 * @param {string} filterStatus - Filter by status
 */
export default function TaskList({
  tasks = [],
  onTaskClick,
  onTaskClaim,
  filterStatus = 'all'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(filterStatus);
  const [filteredTasks, setFilteredTasks] = useState(tasks);

  const statusOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'OPEN', label: 'Open' },
    { value: 'CLAIMED', label: 'In Progress' },
    { value: 'PENDING_VERIFICATION', label: 'Pending Review' },
    { value: 'COMPLETED', label: 'Completed' }
  ];

  // Filter tasks based on search and status
  useEffect(() => {
    let filtered = tasks;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, selectedStatus, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white appearance-none cursor-pointer"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredTasks.length} of {tasks.length} tasks
      </div>

      {/* Task Grid */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No tasks found matching your criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick && onTaskClick(task)}
              onClaim={onTaskClaim}
            />
          ))}
        </div>
      )}
    </div>
  );
}

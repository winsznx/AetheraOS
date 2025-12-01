import { useState, useEffect } from 'react';
import { FileText, Plus, Filter, Search } from 'lucide-react';
import { useAccount } from 'wagmi';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import TaskList from '../components/task/TaskList';
import TaskCreationForm from '../components/task/TaskCreationForm';
import useThemeStore from '../store/theme';
import { getTasks, createTask, updateTask } from '../lib/api';

/**
 * Tasks Page
 * View and manage all tasks with per-user persistence
 */
export default function Tasks() {
  const { initTheme } = useThemeStore();
  const { address } = useAccount();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Load tasks from backend when wallet connects
  useEffect(() => {
    if (address) {
      loadTasks();
    } else {
      // No wallet connected - show empty state
      setTasks([]);
    }
  }, [address]);

  const loadTasks = async () => {
    if (!address) return;

    setLoading(true);
    try {
      // Load tasks from backend database
      const response = await getTasks({ requester: address });

      if (response.success && response.tasks) {
        setTasks(response.tasks);
      } else {
        console.warn('Failed to load tasks from backend');
        setTasks([]);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = async (taskData) => {
    try {
      if (!address) {
        alert('Please connect your wallet first');
        return;
      }

      // Create task in backend database
      const response = await createTask({
        title: taskData.title || `Task ${taskData.taskId}`,
        description: taskData.description || taskData.operation,
        budget: taskData.budget || '0',
        requester: address,
        taskId: taskData.taskId,
        agentId: taskData.agentId,
        operation: taskData.operation,
        params: taskData.params,
        status: 'OPEN'
      });

      if (response.success) {
        await loadTasks();
        setShowTaskForm(false);

        // Poll for status updates from Edenlayer
        pollTaskStatus(taskData.taskId);
      } else {
        throw new Error(response.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Failed to handle task creation:', error);
      alert(`Failed to create task: ${error.message}`);
    }
  };

  const pollTaskStatus = async (taskId) => {
    if (!address) return;

    try {
      const { getTaskStatus } = await import('../lib/edenlayer');

      // Poll for status updates from Edenlayer
      const checkStatus = async () => {
        try {
          const status = await getTaskStatus(taskId);

          // Find task in backend database
          const task = tasks.find(t => t.taskId === taskId);

          if (task && task.id) {
            // Update backend database
            await updateTask(task.id, {
              status: status.state?.toUpperCase() || 'IN_PROGRESS',
              result: status.result
            });

            // Reload tasks to reflect changes
            await loadTasks();
          }

          // Continue polling if not completed or failed
          if (status.state === 'pending' || status.state === 'executing') {
            setTimeout(checkStatus, 3000); // Poll every 3 seconds
          }
        } catch (error) {
          console.error('Failed to poll task status:', error);
        }
      };

      checkStatus();
    } catch (error) {
      console.error('Failed to setup polling:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      (task.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (task.operation?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-brand-black dark:text-white">
                Tasks
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Create and manage your agent tasks
              </p>
            </div>
            <Button
              label="Create Task"
              icon={<Plus className="w-5 h-5" />}
              onClick={() => setShowTaskForm(!showTaskForm)}
              variant={showTaskForm ? 'outline' : 'primary'}
            />
          </div>
        </div>

        {/* Task Creation Form */}
        {showTaskForm && (
          <Card className="mb-8">
            <TaskCreationForm onTaskCreated={handleTaskCreated} />
          </Card>
        )}

        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white"
              >
                <option value="all">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Tasks Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-black dark:text-white">
                {tasks.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-black dark:text-white">
                {tasks.filter(t => t.status === 'OPEN').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Open</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-black dark:text-white">
                {tasks.filter(t => t.status === 'IN_PROGRESS').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-black dark:text-white">
                {tasks.filter(t => t.status === 'COMPLETED').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
          </Card>
        </div>

        {/* Task List */}
        <Card>
          <TaskList tasks={filteredTasks} />
        </Card>
      </div>
    </DashboardLayout>
  );
}

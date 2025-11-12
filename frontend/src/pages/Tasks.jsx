import { useState, useEffect } from 'react';
import { FileText, Plus, Filter, Search } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import TaskList from '../components/task/TaskList';
import TaskCreationForm from '../components/task/TaskCreationForm';
import useThemeStore from '../store/theme';

/**
 * Tasks Page
 * View and manage all tasks
 */
export default function Tasks() {
  const { initTheme } = useThemeStore();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    initTheme();
    loadTasks();
  }, [initTheme]);

  const loadTasks = async () => {
    try {
      // TODO: Edenlayer Protocol doesn't currently expose a /tasks list endpoint
      // Tasks are executed and tracked individually by taskId
      // For now, we'll use local storage to track user's task history
      const storedTasks = localStorage.getItem('aetheraos-task-history');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setTasks([]);
    }
  };

  const handleTaskCreated = async (taskData) => {
    try {
      // Add task to history with timestamp
      const taskRecord = {
        id: taskData.taskId,
        taskId: taskData.taskId,
        agentId: taskData.agentId,
        operation: taskData.operation,
        params: taskData.params,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const updatedTasks = [taskRecord, ...tasks];
      setTasks(updatedTasks);

      // Save to localStorage
      localStorage.setItem('aetheraos-task-history', JSON.stringify(updatedTasks));

      setShowTaskForm(false);

      // Optionally poll for status updates
      pollTaskStatus(taskData.taskId);
    } catch (error) {
      console.error('Failed to handle task creation:', error);
    }
  };

  const pollTaskStatus = async (taskId) => {
    try {
      const { getTaskStatus } = await import('../lib/edenlayer');

      // Poll for status updates (simple implementation)
      const checkStatus = async () => {
        try {
          const status = await getTaskStatus(taskId);

          setTasks(prev => prev.map(task =>
            task.taskId === taskId
              ? { ...task, status: status.state, result: status.result }
              : task
          ));

          // Update localStorage
          const updatedTasks = tasks.map(task =>
            task.taskId === taskId
              ? { ...task, status: status.state, result: status.result }
              : task
          );
          localStorage.setItem('aetheraos-task-history', JSON.stringify(updatedTasks));

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
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
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

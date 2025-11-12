import { useState, useEffect } from 'react';
import { LayoutDashboard, Plus, TrendingUp, Clock, DollarSign } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import TaskList from '../components/task/TaskList';
import TaskCreationForm from '../components/task/TaskCreationForm';
import AgentCard from '../components/agent/AgentCard';
import useThemeStore from '../store/theme';

/**
 * Dashboard Page
 * User dashboard showing tasks, agents, and earnings
 */
export default function Dashboard() {
  const { initTheme } = useThemeStore();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    initTheme();
    loadDashboardData();
  }, [initTheme]);

  const loadDashboardData = async () => {
    try {
      // Load user's agents from Edenlayer
      const { discoverAgents } = await import('../lib/edenlayer');
      const userAgents = await discoverAgents([]);

      // TODO: Filter to only user's own agents once we have ownership info
      // For now showing all discovered agents
      setAgents(userAgents.slice(0, 5)); // Limit to 5 for dashboard display

      // TODO: Load user's tasks from Edenlayer task API
      // For now using placeholder until task API is ready
      const userTasks = [];

      setTasks(userTasks);
      setStats({
        totalTasks: userTasks.length,
        activeTasks: userTasks.filter(t => t.state === 'pending' || t.state === 'running').length,
        completedTasks: userTasks.filter(t => t.state === 'completed').length,
        totalEarnings: 0.00 // TODO: Calculate from completed tasks
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Show empty state on error
      setAgents([]);
      setTasks([]);
      setStats({
        totalTasks: 0,
        activeTasks: 0,
        completedTasks: 0,
        totalEarnings: 0
      });
    }
  };

  const handleTaskCreated = async (taskData) => {
    try {
      const { executeTask } = await import('../lib/edenlayer');
      const result = await executeTask(taskData.agentId, taskData.operation, taskData.params);
      console.log('Task created:', result.taskId);
      setShowTaskForm(false);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleTaskClaim = async (taskId) => {
    try {
      // TODO: Implement task claiming API endpoint when available
      console.log('Claiming task:', taskId);
      alert('Task claiming will be implemented once the API endpoint is available');
    } catch (error) {
      console.error('Failed to claim task:', error);
      alert('Failed to claim task. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-black dark:bg-white flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-white dark:text-brand-black" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-brand-black dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your tasks and agents
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowTaskForm(!showTaskForm)}
          variant="primary"
          icon={<Plus className="w-5 h-5" />}
        >
          Create Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Clock className="w-6 h-6 text-brand-black dark:text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
              <div className="text-2xl font-display font-bold text-brand-black dark:text-white">
                {stats.totalTasks}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-brand-black dark:text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
              <div className="text-2xl font-display font-bold text-brand-black dark:text-white">
                {stats.activeTasks}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-brand-black dark:text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              <div className="text-2xl font-display font-bold text-brand-black dark:text-white">
                {stats.completedTasks}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-brand-black dark:text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Earnings</div>
              <div className="text-2xl font-display font-bold text-brand-black dark:text-white">
                {stats.totalEarnings} ETH
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Task Creation Form */}
      {showTaskForm && (
        <div className="mb-8">
          <TaskCreationForm
            onSuccess={handleTaskCreated}
            onCancel={() => setShowTaskForm(false)}
          />
        </div>
      )}

      {/* My Tasks Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold text-brand-black dark:text-white mb-6">
          My Tasks
        </h2>
        <TaskList
          tasks={tasks}
          onTaskClaim={handleTaskClaim}
        />
      </div>

      {/* My Agents Section */}
      {agents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-brand-black dark:text-white">
              My Agents
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/deploy'}
            >
              Deploy New Agent
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

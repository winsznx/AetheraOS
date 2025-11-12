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
    // TODO: Load real data from blockchain
    // Mock data for development
    const mockTasks = [
      {
        id: 'task-1',
        title: 'Write blog post about NullShot MCP',
        description: '500 words, SEO-optimized content about NullShot framework',
        budget: '0.05',
        deadline: Date.now() + 86400000,
        status: 'OPEN',
        requester: '0x1234...',
        worker: null,
        createdAt: Date.now() - 3600000
      },
      {
        id: 'task-2',
        title: 'Code review for smart contract',
        description: 'Review escrow contract for security vulnerabilities',
        budget: '0.08',
        deadline: Date.now() + 172800000,
        status: 'CLAIMED',
        requester: '0x1234...',
        worker: '0x5678...',
        createdAt: Date.now() - 7200000
      },
      {
        id: 'task-3',
        title: 'Data analysis report',
        description: 'Analyze market trends and create visualizations',
        budget: '0.10',
        deadline: Date.now() + 259200000,
        status: 'COMPLETED',
        requester: '0x1234...',
        worker: '0x9abc...',
        createdAt: Date.now() - 86400000
      }
    ];

    const mockAgents = [
      {
        id: 'agent-1',
        name: 'My WorkerAgent',
        description: 'Personal agent for task execution',
        capabilities: ['coding', 'writing'],
        endpoint: 'https://aetheraos.vercel.app/api/agents/worker',
        pricing: { model: 'x402', amount: 0.01 },
        owner: '0x1234...',
        reputation: 95,
        status: 'online',
        tasksCompleted: 47
      }
    ];

    setTasks(mockTasks);
    setAgents(mockAgents);
    setStats({
      totalTasks: mockTasks.length,
      activeTasks: mockTasks.filter(t => t.status === 'CLAIMED' || t.status === 'OPEN').length,
      completedTasks: mockTasks.filter(t => t.status === 'COMPLETED').length,
      totalEarnings: 0.23
    });
  };

  const handleTaskCreated = (taskId) => {
    console.log('Task created:', taskId);
    setShowTaskForm(false);
    loadDashboardData();
  };

  const handleTaskClaim = (taskId) => {
    console.log('Claiming task:', taskId);
    // TODO: Implement task claiming
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

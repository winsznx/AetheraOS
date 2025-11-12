import { useState, useEffect } from 'react';
import { Store, Search, Filter } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import AgentCard from '../components/agent/AgentCard';
import { discoverAgents, searchAgents } from '../lib/edenlayer';
import useThemeStore from '../store/theme';

/**
 * Marketplace Page
 * Discover and browse available agents (Edenlayer integration)
 */
export default function Marketplace() {
  const { initTheme } = useThemeStore();
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCapability, setSelectedCapability] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    initTheme();
    loadAgents();
  }, [initTheme]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const agentList = await discoverAgents([]);
      setAgents(agentList);
      setFilteredAgents(agentList);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter agents
  useEffect(() => {
    let filtered = agents;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by capability
    if (selectedCapability !== 'all') {
      filtered = filtered.filter(agent =>
        agent.capabilities.includes(selectedCapability)
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(agent => agent.status === selectedStatus);
    }

    setFilteredAgents(filtered);
  }, [agents, searchQuery, selectedCapability, selectedStatus]);

  const capabilities = ['all', 'coding', 'writing', 'data-analysis', 'research', 'verification'];
  const statuses = ['all', 'online', 'busy'];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand-black dark:bg-white flex items-center justify-center">
          <Store className="w-6 h-6 text-white dark:text-brand-black" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-black dark:text-white">
            Agent Marketplace
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover AI agents powered by Edenlayer
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search agents by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white"
          />
        </div>

        {/* Capability and Status Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">
              Capability
            </label>
            <div className="flex flex-wrap gap-2">
              {capabilities.map(cap => (
                <button
                  key={cap}
                  onClick={() => setSelectedCapability(cap)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCapability === cap
                      ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {cap}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Showing {filteredAgents.length} of {agents.length} agents
      </div>

      {/* Agent Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-black dark:border-white mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading agents...</p>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No agents found matching your criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              selectable
              onClick={() => console.log('Agent clicked:', agent.id)}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

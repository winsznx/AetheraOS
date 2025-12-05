import { useState, useEffect } from 'react';
import { Store, Search, Star, TrendingUp } from 'lucide-react';
import { useActiveAccount } from 'thirdweb/react';
import DashboardLayout from '../components/layout/DashboardLayout';
import AgentCard from '../components/agent/AgentCard';
import Button from '../components/Button';
import Card from '../components/Card';
import { discoverAgents } from '../lib/edenlayer';
import useThemeStore from '../store/theme';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Marketplace Page
 * Hybrid: Edenlayer for agent discovery + Our backend for reviews/ratings
 */
export default function Marketplace() {
  const { initTheme } = useThemeStore();
  const account = useActiveAccount();
  const [edenlayerAgents, setEdenlayerAgents] = useState([]);
  const [marketplaceData, setMarketplaceData] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  useEffect(() => {
    initTheme();
    loadMarketplace();
  }, [initTheme]);

  const loadMarketplace = async () => {
    try {
      setLoading(true);

      // Load agents from Edenlayer (real agent discovery)
      const edenlayerData = await discoverAgents([]);
      setEdenlayerAgents(edenlayerData || []);

      // Load marketplace data from our backend (reviews, ratings, etc.)
      const [marketplaceRes, categoriesRes, featuredRes] = await Promise.allSettled([
        fetch(`${API_URL}/marketplace/agents`),
        fetch(`${API_URL}/marketplace/categories`),
        fetch(`${API_URL}/marketplace/featured`)
      ]);

      // Process marketplace data
      if (marketplaceRes.status === 'fulfilled' && marketplaceRes.value.ok) {
        const data = await marketplaceRes.value.json();
        const dataMap = {};
        (data.agents || []).forEach(agent => {
          dataMap[agent.endpoint] = agent;
        });
        setMarketplaceData(dataMap);
      }

      // Process categories
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value.ok) {
        const data = await categoriesRes.value.json();
        setCategories(data.categories || []);
      }

    } catch (error) {
      console.error('Failed to load marketplace:', error);
    } finally {
      setLoading(false);
    }
  };

  // Merge Edenlayer agents with our marketplace data
  const mergedAgents = edenlayerAgents.map(agent => {
    const marketplaceInfo = marketplaceData[agent.mcpUrl] || {};
    return {
      ...agent,
      rating: marketplaceInfo.rating || 0,
      reviewCount: marketplaceInfo._count?.reviews || 0,
      usageCount: marketplaceInfo.usageCount || 0,
      verified: marketplaceInfo.verified || false,
      category: marketplaceInfo.category || 'General',
      price: marketplaceInfo.price || '0.0001'
    };
  });

  // Filter agents
  const filteredAgents = mergedAgents.filter(agent => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!agent.name.toLowerCase().includes(query) &&
        !agent.description.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== 'all' && agent.category !== selectedCategory) {
      return false;
    }

    // Verified filter
    if (showVerifiedOnly && !agent.verified) {
      return false;
    }

    return true;
  });

  const handleAgentClick = async (agent) => {
    // Track usage in our backend
    if (marketplaceData[agent.mcpUrl]?.id) {
      try {
        await fetch(`${API_URL}/marketplace/agents/${marketplaceData[agent.mcpUrl].id}/use`, {
          method: 'POST'
        });
      } catch (error) {
        console.error('Failed to track usage:', error);
      }
    }

    // Navigate to agent details or open chat
    console.log('Agent clicked:', agent);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
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

        <Button
          variant="outline"
          onClick={() => window.location.href = '/deploy'}
        >
          Deploy Your Agent
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Store className="w-6 h-6 text-brand-black dark:text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Agents</div>
              <div className="text-2xl font-display font-bold text-brand-black dark:text-white">
                {edenlayerAgents.length}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Star className="w-6 h-6 text-brand-black dark:text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Verified</div>
              <div className="text-2xl font-display font-bold text-brand-black dark:text-white">
                {mergedAgents.filter(a => a.verified).length}
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
              <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
              <div className="text-2xl font-display font-bold text-brand-black dark:text-white">
                {categories.length}
              </div>
            </div>
          </div>
        </Card>
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

        {/* Category and Verified Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'all'
                  ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat.name
                    ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showVerifiedOnly}
              onChange={(e) => setShowVerifiedOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Verified only
            </span>
          </label>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Showing {filteredAgents.length} of {mergedAgents.length} agents
      </div>

      {/* Agent Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-black dark:border-white mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading agents from Edenlayer...</p>
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
              onClick={() => handleAgentClick(agent)}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

import { useState, useEffect } from 'react';
import { Rocket, Upload, Settings, CheckCircle, ArrowRight } from 'lucide-react';
import { useAccount } from 'wagmi';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import { registerAgent } from '../lib/edenlayer';
import { createAgent } from '../lib/api';
import useThemeStore from '../store/theme';
import { cn } from '../utils/cn';

/**
 * Deploy Page
 * Agent deployment wizard
 */
export default function Deploy() {
  const { initTheme } = useThemeStore();
  const { address } = useAccount();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deployedAgentId, setDeployedAgentId] = useState(null);
  const [agentConfig, setAgentConfig] = useState({
    name: '',
    description: '',
    capabilities: [],
    pricingModel: 'x402',
    priceAmount: '',
    endpoint: ''
  });

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const handleConfigChange = (field, value) => {
    setAgentConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleCapabilityToggle = (capability) => {
    setAgentConfig(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter(c => c !== capability)
        : [...prev.capabilities, capability]
    }));
  };

  const handleDeploy = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      // 1. Register agent in Edenlayer with proper MCP schema
      const agentId = await registerAgent({
        name: agentConfig.name,
        description: agentConfig.description,
        defaultPrompt: `How can ${agentConfig.name} help you today?`,
        mcpUrl: agentConfig.endpoint,
        capabilities: {
          tools: agentConfig.capabilities.map(cap => ({
            name: cap,
            description: `Capability: ${cap}`,
            inputSchema: {
              type: "object",
              properties: {},
              required: []
            }
          }))
        },
        // Optional fields
        imageUrl: '',
        backgroundImageUrl: '',
        websiteUrl: '',
        chatUrl: ''
      });

      console.log('Agent registered in Edenlayer:', agentId);

      // 2. Save agent to backend database
      const backendAgent = await createAgent({
        name: agentConfig.name,
        description: agentConfig.description,
        endpoint: agentConfig.endpoint,
        owner: address,
        agentId: agentId,
        capabilities: agentConfig.capabilities,
        pricingModel: agentConfig.pricingModel,
        priceAmount: agentConfig.priceAmount
      });

      console.log('Agent saved to backend:', backendAgent);

      setDeployedAgentId(agentId);
      setStep(4);
    } catch (error) {
      console.error('Deployment failed:', error);
      alert(`Failed to deploy agent: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Agent Details', icon: Upload },
    { number: 2, title: 'Capabilities', icon: Settings },
    { number: 3, title: 'Pricing', icon: Settings },
    { number: 4, title: 'Complete', icon: CheckCircle }
  ];

  const capabilityOptions = [
    'coding', 'writing', 'data-analysis', 'research',
    'verification', 'quality-check', 'translation', 'design'
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand-black dark:bg-white flex items-center justify-center">
          <Rocket className="w-6 h-6 text-white dark:text-brand-black" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-black dark:text-white">
            Deploy Agent
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Deploy your autonomous AI agent to the network
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((s, idx) => (
            <div key={s.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                  step >= s.number
                    ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-500'
                )}>
                  <s.icon className="w-6 h-6" />
                </div>
                <span className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                  {s.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={cn(
                  'w-24 h-1 mx-4 transition-colors',
                  step > s.number
                    ? 'bg-brand-black dark:bg-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-2xl mx-auto">
        {step === 1 && (
          <Card>
            <h2 className="text-2xl font-display font-bold text-brand-black dark:text-white mb-6">
              Agent Details
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">
                  Agent Name *
                </label>
                <input
                  type="text"
                  value={agentConfig.name}
                  onChange={(e) => handleConfigChange('name', e.target.value)}
                  placeholder="e.g., MyWorkerAgent"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">
                  Description *
                </label>
                <textarea
                  value={agentConfig.description}
                  onChange={(e) => handleConfigChange('description', e.target.value)}
                  placeholder="Describe what your agent does..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">
                  Endpoint URL *
                </label>
                <input
                  type="url"
                  value={agentConfig.endpoint}
                  onChange={(e) => handleConfigChange('endpoint', e.target.value)}
                  placeholder="https://your-agent.vercel.app/api"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white"
                />
              </div>

              <Button
                onClick={() => setStep(2)}
                variant="primary"
                icon={<ArrowRight className="w-5 h-5" />}
                disabled={!agentConfig.name || !agentConfig.description || !agentConfig.endpoint}
                className="w-full"
              >
                Next: Capabilities
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <h2 className="text-2xl font-display font-bold text-brand-black dark:text-white mb-6">
              Select Capabilities
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Choose the capabilities your agent supports
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {capabilityOptions.map(cap => (
                <button
                  key={cap}
                  onClick={() => handleCapabilityToggle(cap)}
                  className={cn(
                    'px-4 py-3 rounded-lg border-2 transition-all font-medium',
                    agentConfig.capabilities.includes(cap)
                      ? 'border-brand-black bg-gray-100 dark:border-white dark:bg-gray-800 text-brand-black dark:text-white'
                      : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-500 dark:hover:border-gray-600'
                  )}
                >
                  {cap}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                variant="primary"
                icon={<ArrowRight className="w-5 h-5" />}
                disabled={agentConfig.capabilities.length === 0}
                className="flex-1"
              >
                Next: Pricing
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <h2 className="text-2xl font-display font-bold text-brand-black dark:text-white mb-6">
              Pricing Configuration
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-brand-black dark:text-white mb-4">
                  Pricing Model
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleConfigChange('pricingModel', 'x402')}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all text-left',
                      agentConfig.pricingModel === 'x402'
                        ? 'border-brand-black bg-gray-100 dark:border-white dark:bg-gray-800'
                        : 'border-gray-300 dark:border-gray-700'
                    )}
                  >
                    <div className="font-medium text-brand-black dark:text-white">x402</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Pay-per-call micropayments
                    </div>
                  </button>
                  <button
                    onClick={() => handleConfigChange('pricingModel', 'flat')}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all text-left',
                      agentConfig.pricingModel === 'flat'
                        ? 'border-brand-black bg-gray-100 dark:border-white dark:bg-gray-800'
                        : 'border-gray-300 dark:border-gray-700'
                    )}
                  >
                    <div className="font-medium text-brand-black dark:text-white">Flat Fee</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Fixed price per task
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-black dark:text-white mb-2">
                  Price (ETH) *
                </label>
                <input
                  type="number"
                  value={agentConfig.priceAmount}
                  onChange={(e) => handleConfigChange('priceAmount', e.target.value)}
                  placeholder="0.01"
                  step="0.001"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleDeploy}
                  variant="primary"
                  disabled={!agentConfig.priceAmount || loading}
                  className="flex-1"
                >
                  {loading ? 'Deploying...' : 'Deploy Agent'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-display font-bold text-brand-black dark:text-white mb-4">
                Agent Deployed Successfully!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Your agent is now live on the Edenlayer network
              </p>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  variant="primary"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => window.location.href = '/marketplace'}
                  variant="outline"
                >
                  View Marketplace
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

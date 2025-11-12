import {
  Rocket,
  Shield,
  Zap,
  Search,
  DollarSign,
  Network,
  Code2,
  CheckCircle,
  Users
} from 'lucide-react';
import Card from '../components/Card';
import Container from '../components/Container';

/**
 * Features Section
 * Displays key features of AetheraOS with icons and detailed descriptions
 *
 * @param {Array} features - Array of feature objects
 */
export default function Features({ features = defaultFeatures }) {
  return (
    <section id="features" className="py-24 bg-gray-50 dark:bg-gray-800">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-brand-black dark:text-white rounded-full text-sm font-medium mb-4 border border-gray-200 dark:border-gray-600">
            <Zap className="w-4 h-4" />
            <span>Powerful Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-black dark:text-white mb-4">
            Everything You Need for Agent Economy
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Build, deploy, and monetize AI agents with enterprise-grade infrastructure
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} hover={true} className="group">
              <div className="text-left">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-brand-black dark:bg-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-display font-bold text-brand-black dark:text-white mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Features List */}
                {feature.details && (
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Ready to build autonomous agents?
          </p>
          <a
            href="#get-started"
            className="inline-flex items-center gap-2 text-brand-black dark:text-white font-semibold hover:gap-3 transition-all"
          >
            <span>View Documentation</span>
            <Code2 className="w-5 h-5" />
          </a>
        </div>
      </Container>
    </section>
  );
}

// Default features data based on AetheraOS architecture
const defaultFeatures = [
  {
    icon: <Rocket className="w-7 h-7 text-white dark:text-brand-black" />,
    title: 'Instant Deployment',
    description: 'Deploy AI agents to production in seconds using NullShot MCP framework and Vercel Edge Functions.',
    details: [
      'One-command deployment via CLI',
      'Auto-scaling serverless infrastructure',
      'Built-in monitoring and logs'
    ]
  },
  {
    icon: <Search className="w-7 h-7 text-white dark:text-brand-black" />,
    title: 'Agent Discovery',
    description: 'Find and collaborate with AI agents using Edenlayer\'s decentralized registry.',
    details: [
      'Search by capability tags',
      'Reputation-based ranking',
      'Real-time availability status'
    ]
  },
  {
    icon: <DollarSign className="w-7 h-7 text-white dark:text-brand-black" />,
    title: 'Onchain Payments',
    description: 'Trustless escrow and micropayments powered by Thirdweb smart contracts and x402 protocol.',
    details: [
      'Automatic payment release',
      'Pay-per-API-call micropayments',
      'Low gas fees on Base L2'
    ]
  },
  {
    icon: <Shield className="w-7 h-7 text-white dark:text-brand-black" />,
    title: 'Secure by Design',
    description: 'Enterprise-grade security with blockchain verification and automated quality checks.',
    details: [
      'Immutable task records on IPFS',
      'Automated work verification',
      'Dispute resolution system'
    ]
  },
  {
    icon: <Network className="w-7 h-7 text-white dark:text-brand-black" />,
    title: 'MCP Compliant',
    description: 'Built on NullShot\'s Model Context Protocol for seamless agent interoperability.',
    details: [
      'Standardized tool interfaces',
      'Cross-agent communication',
      'Composable workflows'
    ]
  },
  {
    icon: <Users className="w-7 h-7 text-white dark:text-brand-black" />,
    title: 'Multi-Agent System',
    description: 'Orchestrate complex workflows with Requester, Worker, and Verifier agents.',
    details: [
      'Automated task distribution',
      'Quality verification pipeline',
      'Collaborative agent networks'
    ]
  }
];

import { Code2, Database, Cpu, Link as LinkIcon, Coins } from 'lucide-react';
import Container from '../components/Container';
import Card from '../components/Card';

/**
 * Tech Stack Section
 * Showcases the technologies powering AetheraOS
 */
export default function TechStack() {
  const techCategories = [
    {
      icon: <Code2 className="w-6 h-6" />,
      title: 'AI Framework',
      description: 'NullShot MCP',
      tech: [
        { name: 'NullShot TypeScript Agent Framework', color: 'text-brand-black dark:text-white' },
        { name: 'Model Context Protocol (MCP)', color: 'text-brand-black dark:text-white' },
        { name: 'Claude API Integration', color: 'text-brand-black dark:text-white' }
      ]
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Blockchain',
      description: 'Thirdweb + Base',
      tech: [
        { name: 'Thirdweb SDK', color: 'text-brand-black dark:text-white' },
        { name: 'Base L2 (Optimistic Rollup)', color: 'text-brand-black dark:text-white' },
        { name: 'Smart Contract Escrow', color: 'text-brand-black dark:text-white' },
        { name: 'IPFS via Thirdweb Storage', color: 'text-brand-black dark:text-white' }
      ]
    },
    {
      icon: <LinkIcon className="w-6 h-6" />,
      title: 'Discovery',
      description: 'Edenlayer Protocol',
      tech: [
        { name: 'Edenlayer Agent Registry', color: 'text-brand-black dark:text-white' },
        { name: 'Capability-based Search', color: 'text-brand-black dark:text-white' },
        { name: 'Reputation System', color: 'text-brand-black dark:text-white' }
      ]
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: 'Frontend',
      description: 'React + Vercel',
      tech: [
        { name: 'React 18 + Vite', color: 'text-brand-black dark:text-white' },
        { name: 'TailwindCSS + Lucide Icons', color: 'text-brand-black dark:text-white' },
        { name: 'Zustand State Management', color: 'text-brand-black dark:text-white' },
        { name: 'Vercel Edge Functions', color: 'text-gray-600 dark:text-gray-400' }
      ]
    }
  ];

  return (
    <section id="tech-stack" className="py-24 bg-gray-50 dark:bg-gray-800">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-brand-black dark:text-white rounded-full text-sm font-medium mb-4 border border-gray-200 dark:border-gray-600">
            <Code2 className="w-4 h-4" />
            <span>Technology</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-black dark:text-white mb-4">
            Built with Best-in-Class Tech
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Leveraging cutting-edge frameworks and protocols for maximum performance
          </p>
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {techCategories.map((category, index) => (
            <Card key={index} hover={true}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-brand-black dark:bg-white flex items-center justify-center text-white dark:text-brand-black flex-shrink-0">
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-display font-bold text-brand-black dark:text-white mb-1">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {category.description}
                  </p>
                  <ul className="space-y-2">
                    {category.tech.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                        <span className={`text-sm font-medium ${item.color}`}>
                          {item.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Payment Protocol Highlight */}
        <Card className="bg-gray-900 dark:bg-gray-950 border-gray-700 dark:border-gray-800">
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-300 dark:border-gray-700">
                <Coins className="w-8 h-8 text-brand-black dark:text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-display font-bold mb-3 text-white dark:text-white">
              x402 Payment Protocol
            </h3>
            <p className="text-gray-400 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Micropayments for per-API-call pricing. Pay $0.01 per agent invocation with automatic wallet deduction. 98% goes to agents, 2% platform fee.
            </p>
          </div>
        </Card>

        {/* Architecture Diagram Link */}
        <div className="mt-12 text-center">
          <a
            href="https://github.com/yourrepo/architecture.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-brand-black dark:text-white font-semibold hover:gap-3 transition-all"
          >
            <span>View Full Architecture</span>
            <Code2 className="w-5 h-5" />
          </a>
        </div>
      </Container>
    </section>
  );
}

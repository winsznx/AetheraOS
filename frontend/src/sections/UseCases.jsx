import {
  Briefcase,
  Code,
  FileText,
  BarChart,
  Lightbulb,
  Bot
} from 'lucide-react';
import Container from '../components/Container';
import Card from '../components/Card';

/**
 * Use Cases Section
 * Showcases real-world applications of AetheraOS
 */
export default function UseCases() {
  const useCases = [
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Development Tasks',
      description: 'Hire AI agents to write code, fix bugs, and review pull requests.',
      example: 'Task: "Refactor authentication module" → Worker generates clean code → Verifier checks quality → Payment released'
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Content Creation',
      description: 'Generate blog posts, articles, and marketing copy at scale.',
      example: 'Task: "Write SEO article about Web3" → AI writes 1000 words → Quality check → Instant payment'
    },
    {
      icon: <BarChart className="w-8 h-8" />,
      title: 'Data Analysis',
      description: 'Process datasets, generate insights, and create visualizations.',
      example: 'Task: "Analyze sales data" → Agent processes CSV → Creates dashboard → Results delivered onchain'
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: 'Research & Summaries',
      description: 'Compile market research, competitive analysis, and trend reports.',
      example: 'Task: "Research AI agent market" → Agent gathers data → Summarizes findings → Report on IPFS'
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: 'Custom Workflows',
      description: 'Chain multiple agents for complex multi-step processes.',
      example: 'Researcher → Writer → Editor → Publisher: Fully autonomous content pipeline'
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: 'Enterprise Solutions',
      description: 'Deploy private agent clusters for internal company workflows.',
      example: 'Private network of agents handling HR, legal, and operations tasks with SLA guarantees'
    }
  ];

  return (
    <section id="use-cases" className="py-24 bg-white dark:bg-gray-900">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-brand-black dark:text-white rounded-full text-sm font-medium mb-4 border border-gray-200 dark:border-gray-600">
            <Lightbulb className="w-4 h-4" />
            <span>Use Cases</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-black dark:text-white mb-4">
            Built for Real-World Tasks
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            From simple tasks to complex workflows, AetheraOS powers the agentic economy
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {useCases.map((useCase, index) => (
            <Card key={index} hover={true} className="group">
              <div className="text-left">
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-brand-black dark:bg-white flex items-center justify-center mb-5 text-white dark:text-brand-black group-hover:scale-110 transition-transform duration-300">
                  {useCase.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-display font-bold text-brand-black dark:text-white mb-3">
                  {useCase.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {useCase.description}
                </p>

                {/* Example */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    "{useCase.example}"
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Demo CTA */}
        <div className="bg-gray-900 dark:bg-gray-950 rounded-2xl p-12 text-center border border-gray-700 dark:border-gray-800">
          <h3 className="text-3xl font-display font-bold mb-4 text-white">
            See It in Action
          </h3>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Watch our 3-minute demo showing a complete task lifecycle from deployment to payment
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-black rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <span>Watch Demo</span>
              <span>▶</span>
            </a>
            <a
              href="#get-started"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              <span>Start Building</span>
              <Code className="w-5 h-5" />
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}

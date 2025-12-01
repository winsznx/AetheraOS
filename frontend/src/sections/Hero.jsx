import { ArrowRight, Play, Sparkles, Zap, Link2 } from 'lucide-react';
import Button from '../components/Button';
import Container from '../components/Container';
import AgentFlowAnimation from '../components/AgentFlowAnimation';
import { cn } from '../utils/cn';

/**
 * Hero Section
 * Enhanced landing page hero section with product details and animations
 *
 * @param {string} title - Main headline text
 * @param {string} subtitle - Supporting description text
 * @param {string} primaryCTA - Primary button text
 * @param {string} secondaryCTA - Secondary button text
 * @param {function} onPrimaryCTA - Primary button click handler
 * @param {function} onSecondaryCTA - Secondary button click handler
 */
export default function Hero({
  title = 'The Operating System for the Agentic Economy',
  subtitle = 'Deploy, discover, and monetize autonomous AI agents using blockchain technology. Built on NullShot MCP, Edenlayer, and Thirdweb.',
  primaryCTA = 'Get Started',
  secondaryCTA = 'Watch Demo',
  onPrimaryCTA,
  onSecondaryCTA
}) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white dark:bg-gray-900">
      <Container className="relative z-10">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-16 items-center pt-8 pb-12">
          {/* Left Column - Main Content */}
          <div className="text-center lg:text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-brand-black dark:text-white rounded-full text-sm font-medium mb-6 animate-fade-in border border-gray-200 dark:border-gray-700">
            <Sparkles className="w-4 h-4" />
            <span>Built for NullShot Hacks Season 0</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-brand-black dark:text-white mb-6 leading-tight animate-fade-in-up">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            {subtitle}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12 text-sm text-gray-600 dark:text-gray-400 animate-fade-in-up animation-delay-400">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-black dark:text-white" />
              <span>Instant Deployment</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-black dark:text-white" />
              <span>MCP Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-brand-black dark:text-white" />
              <span>Onchain Payments</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8 animate-fade-in-up animation-delay-600">
            <Button
              label={primaryCTA}
              onClick={onPrimaryCTA}
              variant="primary"
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
              className="shadow-2xl"
            />
            <Button
              label={secondaryCTA}
              onClick={onSecondaryCTA}
              variant="outline"
              size="lg"
              icon={<Play className="w-5 h-5" />}
            />
          </div>

          </div>

          {/* Right Column - Agent Flow Animation */}
          <div className="hidden lg:flex items-center justify-end h-[00px] animate-fade-in-up animation-delay-800">
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                <AgentFlowAnimation />
              </div>
              <div className="absolute bottom-0 left-0 right-0 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  Live Agent Discovery Network
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Terminal Demo - Below on Mobile */}
        <div className="relative max-w-4xl mx-auto mt-12 lg:mt-20 animate-fade-in-up animation-delay-1000">
          {/* Terminal Window */}
          <div className="relative bg-gray-900 dark:bg-gray-950 rounded-xl shadow-2xl overflow-hidden border border-gray-700 dark:border-gray-800">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm text-gray-400 ml-4">aethera-cli</span>
            </div>

            {/* Terminal Content */}
            <div className="p-6 font-mono text-left text-sm sm:text-base">
              <div className="text-green-400 mb-2">$ aethera deploy --agent WorkerAgent</div>
              <div className="text-gray-400 mb-1">→ Compiling agent with NullShot MCP...</div>
              <div className="text-gray-400 mb-1">→ Registering on Edenlayer registry...</div>
              <div className="text-gray-400 mb-1">→ Deploying to Vercel Edge Functions...</div>
              <div className="text-green-400 mb-4">✓ Agent deployed successfully!</div>

              <div className="text-green-400 mb-2">$ aethera task create --budget 0.05ETH</div>
              <div className="text-gray-400 mb-1">→ Creating task escrow contract...</div>
              <div className="text-gray-400 mb-1">→ Broadcasting to agent network...</div>
              <div className="text-green-400 mb-4">✓ Task #123 created and funded</div>

              <div className="text-gray-500 mb-1"># WorkerAgent discovers & claims task</div>
              <div className="text-gray-500 mb-1"># Task completed & verified</div>
              <div className="text-yellow-400">✓ Payment released: 0.049 ETH → Worker</div>

              <div className="mt-4 text-gray-500 animate-pulse">_</div>
            </div>
          </div>
        </div>
      </Container>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          animation-fill-mode: both;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
          animation-fill-mode: both;
        }

        .animation-delay-800 {
          animation-delay: 0.8s;
          animation-fill-mode: both;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
          animation-fill-mode: both;
        }
      `}</style>
    </section>
  );
}

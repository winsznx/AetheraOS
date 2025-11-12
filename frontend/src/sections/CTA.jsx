import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import Button from '../components/Button';
import Container from '../components/Container';

/**
 * Call To Action Section
 * A section encouraging user action with dark mode support
 *
 * @param {string} title - Main CTA headline
 * @param {string} description - Supporting text
 * @param {string} buttonText - CTA button label
 * @param {function} onButtonClick - Button click handler
 */
export default function CTA({
  title = 'Ready to Build the Future?',
  description = 'Join the agentic economy. Deploy your first autonomous AI agent in under 5 minutes.',
  buttonText = 'Start Building Now',
  onButtonClick
}) {
  return (
    <section className="py-24 bg-gray-900 dark:bg-gray-900 relative overflow-hidden border-t border-gray-700 dark:border-gray-800">
      <Container className="relative z-10">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-full text-sm font-medium mb-6 text-white">
            <Sparkles className="w-4 h-4" />
            <span>Limited Beta Access</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight text-white">
            {title}
          </h2>

          {/* Description */}
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed text-gray-400">
            {description}
          </p>

          {/* CTA Button */}
          <Button
            onClick={onButtonClick}
            variant="secondary"
            size="lg"
            icon={<ArrowRight className="w-5 h-5" />}
            className="shadow-2xl hover:shadow-3xl mb-12"
          >
            {buttonText}
          </Button>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Free testnet deployment</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Open source</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

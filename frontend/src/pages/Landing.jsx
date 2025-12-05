import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../sections/Hero';
import Features from '../sections/Features';
import HowItWorks from '../sections/HowItWorks';
import TechStack from '../sections/TechStack';
import UseCases from '../sections/UseCases';
import CTA from '../sections/CTA';
import Footer from '../components/Footer';
import useThemeStore from '../store/theme';

/**
 * Landing Page
 * Main landing page combining all sections with theme initialization
 */
export default function Landing() {
  const { initTheme } = useThemeStore();
  const navigate = useNavigate();

  // Initialize theme on mount
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Event handlers for CTAs
  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const handleLearnMore = () => {
    // Scroll to features section
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWatchDemo = () => {
    // Open demo video in new tab
    window.open('https://youtu.be/WY4TBoXP0Xo', '_blank');
  };

  const handleStartBuilding = () => {
    navigate('/deploy');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero
        title="The Operating System for the Agentic Economy"
        subtitle="Deploy, discover, and monetize autonomous AI agents using blockchain technology. Built on NullShot MCP, Edenlayer, and Thirdweb."
        primaryCTA="Get Started"
        secondaryCTA="Watch Demo"
        onPrimaryCTA={handleGetStarted}
        onSecondaryCTA={handleWatchDemo}
      />

      {/* Features Section */}
      <Features />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Tech Stack Section */}
      <TechStack />

      {/* Use Cases Section */}
      <UseCases />

      {/* Call to Action Section */}
      <CTA
        title="Ready to Build the Future?"
        description="Join the agentic economy. Deploy your first autonomous AI agent in under 5 minutes."
        buttonText="Start Building Now"
        onButtonClick={handleStartBuilding}
      />

      {/* Footer */}
      <Footer
        companyName="AetheraOS"
        tagline="The Operating System for the Agentic Economy"
      />
    </div>
  );
}

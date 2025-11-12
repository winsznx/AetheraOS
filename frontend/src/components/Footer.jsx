import { Github, Twitter, Linkedin, Mail, Cpu, Trophy } from 'lucide-react';
import Container from './Container';

/**
 * Footer Component
 * Site-wide footer with links, social media, and dark mode support
 *
 * @param {Array} links - Array of link sections with title and items
 * @param {string} companyName - Company/product name
 * @param {string} tagline - Footer tagline or description
 */
export default function Footer({
  links = defaultLinks,
  companyName = 'AetheraOS',
  tagline = 'The Operating System for the Agentic Economy'
}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-black dark:bg-brand-black text-brand-light py-16 border-t border-gray-700">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-brand-light rounded-lg">
                <Cpu className="w-6 h-6 text-brand-black" />
              </div>
              <span className="text-2xl font-display font-bold text-brand-light">{companyName}</span>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6 max-w-sm">
              {tagline}. Deploy, discover, and monetize autonomous AI agents using blockchain technology.
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://github.com/aethera-os"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/aethera_os"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/company/aethera-os"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@aethera.os"
                className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Link Sections */}
          {links.map((section, index) => (
            <div key={index}>
              <h4 className="text-brand-light font-display font-semibold text-lg mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <a
                      href={item.href}
                      className="text-gray-600 hover:text-brand-light transition-colors text-sm"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Hackathon Badge */}
        <div className="bg-gray-800 rounded-lg p-4 mb-8 border border-gray-600">
          <div className="flex items-center justify-center gap-2 text-brand-light">
            <Trophy className="w-5 h-5" />
            <p className="text-sm font-medium">
              Built for NullShot Hacks Season 0 - Track 1
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © {currentYear} {companyName}. All rights reserved. Open source under MIT License.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#privacy" className="text-gray-600 hover:text-brand-light transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="text-gray-600 hover:text-brand-light transition-colors">
              Terms of Service
            </a>
            <a href="#cookies" className="text-gray-600 hover:text-brand-light transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

// Default footer links structure
const defaultLinks = [
  {
    title: 'Product',
    items: [
      { label: 'Features', href: '#features' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Marketplace', href: '#marketplace' },
      { label: 'Pricing', href: '#pricing' }
    ]
  },
  {
    title: 'Developers',
    items: [
      { label: 'Documentation', href: '#docs' },
      { label: 'API Reference', href: '#api' },
      { label: 'GitHub', href: 'https://github.com' },
      { label: 'Examples', href: '#examples' }
    ]
  },
  {
    title: 'Resources',
    items: [
      { label: 'Blog', href: '#blog' },
      { label: 'Community', href: '#community' },
      { label: 'Support', href: '#support' },
      { label: 'Status', href: '#status' }
    ]
  }
];

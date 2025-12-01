import { useState, useEffect } from 'react';
import { Menu, X, Cpu, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Button from './Button';
import ConnectWalletButton from './ConnectWalletButton';
import Container from './Container';
import { useUser } from '../contexts/UserContext';
import { cn } from '../utils/cn';

/**
 * Navbar Component
 * Main navigation bar with responsive menu, theme toggle, and glass effect on scroll
 *
 * @param {Array} links - Navigation links
 */
export default function Navbar({ links = defaultLinks }) {
  const { user, isConnected } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      'sticky top-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-800/50'
        : 'bg-transparent border-b border-transparent'
    )}>
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-black dark:bg-brand-light rounded-lg">
              <Cpu className="w-6 h-6 text-white dark:text-brand-black" />
            </div>
            <span className="text-xl font-display font-bold text-brand-black dark:text-brand-light">
              AetheraOS
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-brand-black dark:text-brand-light hover:text-gray-700 dark:hover:text-gray-600 transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isConnected && user && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-brand-black dark:text-white">
                  {user.displayName}
                </span>
              </div>
            )}
            <ThemeToggle />
            <ConnectWalletButton />
            <Button
              variant="outline"
              size="sm"
              label="Dashboard"
              onClick={() => window.location.href = '/dashboard'}
            />
            <Button
              variant="primary"
              size="sm"
              label="Deploy Agent"
              onClick={() => window.location.href = '/deploy'}
            />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-brand-black dark:text-brand-light hover:bg-brand-light dark:hover:bg-gray-700 rounded-lg"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-brand-light dark:border-gray-700">
            <div className="flex flex-col gap-4">
              {/* User Profile in Mobile Menu */}
              {isConnected && user && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg mb-2">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-brand-black dark:text-white">
                    {user.displayName}
                  </span>
                </div>
              )}

              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-brand-black dark:text-brand-light hover:text-gray-700 dark:hover:text-gray-600 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  label="Dashboard"
                  className="w-full"
                  onClick={() => {
                    window.location.href = '/dashboard';
                    setMobileMenuOpen(false);
                  }}
                />
                <Button
                  variant="primary"
                  size="sm"
                  label="Deploy Agent"
                  className="w-full"
                  onClick={() => {
                    window.location.href = '/deploy';
                    setMobileMenuOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </Container>
    </nav>
  );
}

// Default navigation links
const defaultLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Deploy', href: '/deploy' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Docs', href: '#docs' },
];

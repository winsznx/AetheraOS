import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import ThemeToggle from '../ThemeToggle';
import ConnectWalletButton from '../ConnectWalletButton';
import { cn } from '../../utils/cn';

/**
 * DashboardLayout Component
 * Wrapper layout for dashboard pages with sidebar navigation
 *
 * @param {React.ReactNode} children - Page content to render in main area
 * @param {string} className - Additional classes for main content area
 */
export default function DashboardLayout({ children, className = '' }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileMenuOpen}
        onMobileClose={closeMobileMenu}
      />

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Main Content */}
      <main
        className={cn(
          'transition-all duration-300 min-h-screen',
          'lg:ml-20',
          !sidebarCollapsed && 'lg:ml-64',
          className
        )}
      >
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-brand-black dark:text-white"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-display font-bold text-brand-black dark:text-white">
                  {/* Title will be set by individual pages */}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ConnectWalletButton />
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

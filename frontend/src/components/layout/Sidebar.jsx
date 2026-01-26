import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDisconnect } from 'wagmi';
import {
  LayoutDashboard,
  Upload,
  Store,
  FileText,
  MessageCircle,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Cpu,
  LogOut,
  Brain
} from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Sidebar Component
 * Professional sidebar navigation for dashboard pages with toggle functionality
 *
 * @param {boolean} collapsed - Whether sidebar is collapsed (desktop only)
 * @param {function} onToggle - Toggle sidebar collapsed state (desktop only)
 * @param {boolean} mobileOpen - Whether sidebar is open on mobile
 * @param {function} onMobileClose - Close mobile sidebar
 */
export default function Sidebar({ collapsed = false, onToggle, mobileOpen = false, onMobileClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { disconnect } = useDisconnect();

  const navItems = [
    {
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Dashboard',
      description: 'Overview & Analytics'
    },
    {
      path: '/deploy',
      icon: <Upload className="w-5 h-5" />,
      label: 'Deploy Agent',
      description: 'Deploy new agents'
    },
    {
      path: '/marketplace',
      icon: <Store className="w-5 h-5" />,
      label: 'Marketplace',
      description: 'Discover agents'
    },
    {
      path: '/tasks',
      icon: <FileText className="w-5 h-5" />,
      label: 'Tasks',
      description: 'Manage tasks'
    },
    {
      path: '/chat',
      icon: <MessageCircle className="w-5 h-5" />,
      label: 'Chat',
      description: 'Chat with agents'
    },
    {
      path: '/agent',
      icon: <Brain className="w-5 h-5" />,
      label: 'AI Agent',
      description: 'Blockchain Intelligence'
    },
    {
      path: '/settings',
      icon: <Settings className="w-5 h-5" />,
      label: 'Settings',
      description: 'Account settings'
    }
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavClick = () => {
    // Close mobile menu when nav item is clicked (mobile only)
    if (onMobileClose && window.innerWidth < 1024) {
      onMobileClose();
    }
    // Don't toggle sidebar on desktop when clicking nav items
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40',
        // Desktop: Always visible, toggle between collapsed and expanded
        'lg:translate-x-0',
        collapsed ? 'lg:w-20' : 'lg:w-64',
        // Mobile: Hidden by default, slide in when open
        'w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <Link to="/" className="flex items-center gap-2" onClick={handleNavClick}>
          <div className="w-8 h-8 bg-brand-black dark:bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <Cpu className="w-5 h-5 text-white dark:text-brand-black" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-lg text-brand-black dark:text-white">
              AetheraOS
            </span>
          )}
        </Link>
        {/* Desktop toggle button - hidden on mobile */}
        <button
          onClick={onToggle}
          className="hidden lg:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-brand-black dark:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-brand-black dark:text-white"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={handleNavClick}
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              isActive(item.path)
                ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black'
                : 'text-gray-600 dark:text-gray-400',
              collapsed && 'justify-center'
            )}
            title={collapsed ? item.label : ''}
          >
            <span className={cn(
              'flex-shrink-0',
              isActive(item.path) && 'text-white dark:text-brand-black'
            )}>
              {item.icon}
            </span>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className={cn(
                  'font-medium text-sm truncate',
                  isActive(item.path)
                    ? 'text-white dark:text-brand-black'
                    : 'text-brand-black dark:text-white'
                )}>
                  {item.label}
                </div>
                <div className={cn(
                  'text-xs truncate',
                  isActive(item.path)
                    ? 'text-gray-200 dark:text-gray-700'
                    : 'text-gray-600 dark:text-gray-500'
                )}>
                  {item.description}
                </div>
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
        {/* Logout Button */}
        <button
          onClick={() => {
            disconnect();
            navigate('/');
          }}
          className={cn(
            'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 w-full',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
          )}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && (
            <span className="font-medium text-sm">
              Logout
            </span>
          )}
        </button>

        {/* Version Info */}
        {!collapsed && (
          <div className="text-xs text-gray-600 dark:text-gray-500 pt-2">
            <div className="font-medium text-brand-black dark:text-white mb-1">
              Beta v0.1.0
            </div>
            <div>© 2026 AetheraOS</div>
          </div>
        )}
      </div>
    </aside>
  );
}

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Wallet, Save } from 'lucide-react';
import { useAccount } from 'wagmi';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import useThemeStore from '../store/theme';

/**
 * Settings Page
 * User account and application settings
 */
export default function Settings() {
  const { initTheme, theme, toggleTheme } = useThemeStore();
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    displayName: '',
    email: '',
    notificationsEnabled: true,
    emailNotifications: false,
    taskAlerts: true,
    agentAlerts: true
  });

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const handleSaveSettings = () => {
    // TODO: Save settings to backend
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'wallet', label: 'Wallet', icon: <Wallet className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-brand-black dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs Sidebar */}
          <Card className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </Card>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <Card>
                <h2 className="text-xl font-bold text-brand-black dark:text-white mb-6">
                  Profile Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={settings.displayName}
                      onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                      placeholder="Enter your display name"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Theme
                    </label>
                    <button
                      onClick={toggleTheme}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Current: {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                  </div>

                  <Button
                    label="Save Changes"
                    icon={<Save className="w-5 h-5" />}
                    onClick={handleSaveSettings}
                    variant="primary"
                    className="mt-6"
                  />
                </div>
              </Card>
            )}

            {activeTab === 'wallet' && (
              <Card>
                <h2 className="text-xl font-bold text-brand-black dark:text-white mb-6">
                  Wallet Connection
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Connected Wallet
                    </div>
                    <div className="font-mono text-brand-black dark:text-white break-all">
                      {isConnected ? address : 'Not connected'}
                    </div>
                  </div>

                  {isConnected && (
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h3 className="font-semibold text-brand-black dark:text-white mb-2">
                        Supported Networks
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Base (Mainnet)
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          Base Sepolia (Testnet)
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <h2 className="text-xl font-bold text-brand-black dark:text-white mb-6">
                  Notification Preferences
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div>
                      <div className="font-medium text-brand-black dark:text-white">
                        Enable Notifications
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Receive notifications for important events
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notificationsEnabled}
                      onChange={(e) =>
                        setSettings({ ...settings, notificationsEnabled: e.target.checked })
                      }
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div>
                      <div className="font-medium text-brand-black dark:text-white">
                        Email Notifications
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Receive updates via email
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) =>
                        setSettings({ ...settings, emailNotifications: e.target.checked })
                      }
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div>
                      <div className="font-medium text-brand-black dark:text-white">
                        Task Alerts
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified when tasks are updated
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.taskAlerts}
                      onChange={(e) => setSettings({ ...settings, taskAlerts: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div>
                      <div className="font-medium text-brand-black dark:text-white">
                        Agent Alerts
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified about agent activity
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.agentAlerts}
                      onChange={(e) => setSettings({ ...settings, agentAlerts: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </label>

                  <Button
                    label="Save Preferences"
                    icon={<Save className="w-5 h-5" />}
                    onClick={handleSaveSettings}
                    variant="primary"
                    className="mt-6"
                  />
                </div>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card>
                <h2 className="text-xl font-bold text-brand-black dark:text-white mb-6">
                  Security Settings
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                      <Shield className="w-5 h-5" />
                      <span className="font-semibold">Wallet Authentication</span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      Your account is secured with wallet-based authentication. No password required.
                    </p>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-semibold text-brand-black dark:text-white mb-2">
                      Connected Sessions
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      You can disconnect your wallet at any time using the logout button.
                    </p>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div>Current Session: Active</div>
                      <div>Last Activity: Just now</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

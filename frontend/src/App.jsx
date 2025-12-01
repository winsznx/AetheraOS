import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Deploy from './pages/Deploy';
import Marketplace from './pages/Marketplace';
import Tasks from './pages/Tasks';
import Chat from './pages/Chat';
import AgentChat from './pages/AgentChat';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import useThemeStore from './store/theme';
import { WagmiProvider, QueryClientProvider, queryClient, wagmiAdapter } from './config/wallet';
import { initSyncManager, stopSyncManager } from './services/syncService';
import { UserProvider } from './contexts/UserContext';

/**
 * Sync Service Initializer
 * Initializes background sync when wallet is connected
 */
function SyncServiceManager() {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      // Initialize sync service with 30-second intervals
      console.log('🔄 Initializing sync service for user:', address);
      initSyncManager(address, true);

      return () => {
        // Cleanup on disconnect
        console.log('⏹️  Stopping sync service');
        stopSyncManager();
      };
    } else {
      // Stop sync if wallet disconnects
      stopSyncManager();
    }
  }, [address, isConnected]);

  return null;
}

/**
 * App Component
 * Root application component with routing and theme initialization
 */
export default function App() {
  const { initTheme } = useThemeStore();

  // Initialize theme on app mount
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <SyncServiceManager />
          <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deploy"
              element={
                <ProtectedRoute>
                  <Deploy />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent"
              element={
                <ProtectedRoute>
                  <AgentChat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
        </UserProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

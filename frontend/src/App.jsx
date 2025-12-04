import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useAccount } from 'wagmi';
import { ThirdwebProvider } from 'thirdweb/react';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import useThemeStore from './store/theme';
import { WagmiProvider, QueryClientProvider, queryClient, wagmiAdapter } from './config/wallet';
import { initSyncManager, stopSyncManager } from './services/syncService';
import { UserProvider } from './contexts/UserContext';

// Lazy load pages
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Deploy = lazy(() => import('./pages/Deploy'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Chat = lazy(() => import('./pages/Chat'));
const AgentChat = lazy(() => import('./pages/AgentChat'));
const Settings = lazy(() => import('./pages/Settings'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

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
    <ErrorBoundary>
      <ThirdwebProvider>
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <UserProvider>
              <SyncServiceManager />
              <Router>
                <Suspense fallback={<LoadingFallback />}>
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
                </Suspense>
              </Router>
            </UserProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ThirdwebProvider>
    </ErrorBoundary>
  );
}

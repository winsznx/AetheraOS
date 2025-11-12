import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Deploy from './pages/Deploy';
import Marketplace from './pages/Marketplace';
import Tasks from './pages/Tasks';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import useThemeStore from './store/theme';
import { WagmiProvider, QueryClientProvider, queryClient, wagmiAdapter } from './config/wallet';

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
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

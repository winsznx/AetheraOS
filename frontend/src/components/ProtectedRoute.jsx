import { Navigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';

/**
 * ProtectedRoute Component
 * Requires wallet connection to access protected pages
 * Redirects to landing page if wallet is not connected
 *
 * @param {React.ReactNode} children - Protected content
 */
export default function ProtectedRoute({ children }) {
  const { isConnected, isConnecting } = useAccount();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Small delay to prevent flash of redirect
    if (!isConnecting) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isConnecting]);

  // Show loading state while checking connection
  if (isConnecting || !showContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-black dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to landing if not connected
  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  // Render protected content
  return children;
}

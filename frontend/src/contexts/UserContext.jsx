import { createContext, useContext, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { getUser } from '../lib/api';

/**
 * User Profile Context
 * Provides global access to user profile data across the app
 */
const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load user profile when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      loadUserProfile();
    } else {
      setUser(null);
    }
  }, [address, isConnected]);

  const loadUserProfile = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const response = await getUser(address);

      if (response.success && response.user) {
        setUser(response.user);
      } else {
        // Create default user if doesn't exist
        setUser({
          address: address,
          displayName: `${address.slice(0, 6)}...${address.slice(-4)}`,
          email: '',
          theme: 'dark',
          notifications: true
        });
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // Fallback to basic user
      setUser({
        address: address,
        displayName: `${address.slice(0, 6)}...${address.slice(-4)}`,
        email: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = () => {
    if (address) {
      loadUserProfile();
    }
  };

  const value = {
    user,
    loading,
    refreshUser,
    isConnected,
    address
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook to use user context
 */
export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}

export default UserContext;

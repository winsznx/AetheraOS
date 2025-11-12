import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base, baseSepolia } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId from environment
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID';

if (!projectId) {
  console.warn('VITE_REOWN_PROJECT_ID not found in environment variables');
}

// 2. Create wagmiAdapter
export const wagmiAdapter = new WagmiAdapter({
  networks: [base, baseSepolia],
  projectId,
  ssr: false
});

// 3. Create modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [base, baseSepolia],
  projectId,
  metadata: {
    name: 'AetheraOS',
    description: 'The Operating System for the Agentic Economy',
    url: 'https://aethera.os',
    icons: ['/favicon.svg']
  },
  features: {
    analytics: true,
    email: false,
    socials: false,
    onramp: false
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#000000',
    '--w3m-accent': '#000000',
    '--w3m-border-radius-master': '8px'
  }
});

export { queryClient, WagmiProvider, QueryClientProvider };

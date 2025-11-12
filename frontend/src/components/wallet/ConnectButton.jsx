import { useState } from 'react';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react';
import Button from '../Button';
import { cn } from '../../utils/cn';

/**
 * Wallet Connection Button
 * Thirdweb wallet connection with dropdown menu
 *
 * @param {string} className - Additional CSS classes
 */
export default function ConnectButton({ className = '' }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Mock wallet connection
  const handleConnect = async () => {
    try {
      // TODO: Implement Thirdweb wallet connection
      // const address = await connectWallet();

      // Mock connection
      const mockAddress = '0x1234...5678';
      setAddress(mockAddress);
      setConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    setConnected(false);
    setDropdownOpen(false);
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      // TODO: Show toast notification
      console.log('Address copied');
    }
  };

  if (!connected) {
    return (
      <Button
        onClick={handleConnect}
        variant="primary"
        size="md"
        icon={<Wallet className="w-4 h-4" />}
        className={className}
      >
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg',
          'bg-brand-black dark:bg-white text-white dark:text-brand-black',
          'hover:opacity-90',
          'transition-opacity',
          className
        )}
      >
        <Wallet className="w-4 h-4" />
        <span className="font-medium">{address}</span>
        <ChevronDown className={cn(
          'w-4 h-4 transition-transform',
          dropdownOpen && 'rotate-180'
        )} />
      </button>

      {dropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropdownOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Connected Wallet
              </div>
              <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                {address}
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={copyAddress}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Address</span>
              </button>

              <a
                href={`https://basescan.org/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on Explorer</span>
              </a>

              <button
                onClick={handleDisconnect}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

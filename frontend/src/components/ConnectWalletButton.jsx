import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { cn } from '../utils/cn';

/**
 * ConnectWalletButton Component
 * Button to trigger the Reown AppKit wallet connection modal
 *
 * @param {string} className - Additional CSS classes
 */
export default function ConnectWalletButton({ className = '' }) {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const handleClick = () => {
    open();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
        'bg-brand-black dark:bg-white text-white dark:text-brand-black',
        'hover:bg-gray-800 dark:hover:bg-gray-200',
        'focus:outline-none focus:ring-2 focus:ring-brand-black dark:focus:ring-white',
        className
      )}
    >
      {isConnected && address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : 'Connect Wallet'}
    </button>
  );
}

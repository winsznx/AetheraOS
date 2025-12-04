import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import Button from './Button';
import Card from './Card';

const PLATFORM_WALLET = import.meta.env.VITE_PLATFORM_WALLET || '0xA81514fBAE19DDEb16F4881c02c363c8E7c2B0d8';

/**
 * Payment Approval Modal
 * Shows plan cost and requests user payment approval
 */
export default function PaymentModal({ plan, onApprove, onCancel, isOpen }) {
  const { address } = useAccount();
  const [status, setStatus] = useState('idle'); // idle, paying, confirming, success, error
  const [error, setError] = useState(null);

  const { sendTransaction, data: txHash, isPending: isSending } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Update status based on transaction state
  useEffect(() => {
    if (isSending) setStatus('paying');
    else if (isConfirming) setStatus('confirming');
    else if (isConfirmed && txHash) {
      setStatus('success');
      // Automatically call onApprove with payment proof
      setTimeout(() => {
        onApprove({
          transactionHash: txHash,
          amount: parseEther(plan?.totalCost || '0').toString(),
          chain: baseSepolia.id.toString(),
          from: address
        });
      }, 500);
    }
  }, [isSending, isConfirming, isConfirmed, txHash, address, plan, onApprove]);

  if (!isOpen || !plan) return null;

  const handlePayment = async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setError(null);
      setStatus('paying');

      // Send payment transaction
      await sendTransaction({
        to: PLATFORM_WALLET,
        value: parseEther(plan.totalCost),
        chainId: baseSepolia.id
      });
    } catch (err) {
      console.error('Payment failed:', err);
      setError(err.message || 'Payment failed');
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg mx-4 relative">
        {/* Close button */}
        {status === 'idle' && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Payment Required
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Approve this transaction to execute your query
            </p>
          </div>
        </div>

        {/* Plan Details */}
        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Query Intent</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">{plan.intent}</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Execution Plan</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{plan.reasoning}</p>
            <div className="space-y-2">
              {plan.steps?.map((step, idx) => (
                <div key={idx} className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">Step {idx + 1}:</span>{' '}
                  <span className="text-gray-700 dark:text-gray-300">{step.tool}</span>
                  <span className="text-gray-500 dark:text-gray-500 ml-2">({step.reason})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Cost</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {plan.totalCost} ETH
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Network</span>
              <span>Base Sepolia (Testnet)</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Recipient</span>
              <span className="font-mono">{PLATFORM_WALLET.slice(0, 6)}...{PLATFORM_WALLET.slice(-4)}</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100">Payment Failed</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {status === 'paying' && (
          <div className="mb-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
              <span className="text-sm text-blue-900 dark:text-blue-100">Waiting for wallet approval...</span>
            </div>
          </div>
        )}

        {status === 'confirming' && (
          <div className="mb-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
              <span className="text-sm text-blue-900 dark:text-blue-100">Confirming transaction...</span>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-900 dark:text-green-100">Payment confirmed! Executing query...</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
            disabled={status === 'paying' || status === 'confirming' || status === 'success'}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            className="flex-1"
            disabled={status !== 'idle' && status !== 'error'}
          >
            {status === 'paying' && (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Approving...
              </>
            )}
            {status === 'confirming' && (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirming...
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Executing...
              </>
            )}
            {(status === 'idle' || status === 'error') && (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Pay {plan.totalCost} ETH
              </>
            )}
          </Button>
        </div>

        {/* Testnet Notice */}
        <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
          💡 This is Base Sepolia testnet. Get free ETH from{' '}
          <a
            href="https://www.alchemy.com/faucets/base-sepolia"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Alchemy Faucet
          </a>
        </p>
      </Card>
    </div>
  );
}

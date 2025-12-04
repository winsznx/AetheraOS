import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import { encodePayment } from 'thirdweb/x402';
import { createThirdwebClient } from 'thirdweb';
import Button from './Button';
import Card from './Card';

const PLATFORM_WALLET = import.meta.env.VITE_PLATFORM_WALLET || '0xA81514fBAE19DDEb16F4881c02c363c8E7c2B0d8';
const THIRDWEB_CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID;
const AGENT_URL = import.meta.env.VITE_AGENT_URL;

// Create Thirdweb client for x402 payment encoding
const client = createThirdwebClient({
  clientId: THIRDWEB_CLIENT_ID
});

/**
 * Payment Approval Modal
 * Shows plan cost and requests user payment approval
 */
export default function PaymentModal({ plan, onApprove, onCancel, isOpen }) {
  const { address } = useAccount();
  const [status, setStatus] = useState('idle'); // idle, paying, confirming, success, error
  const [error, setError] = useState(null);
  const [hasCalledApprove, setHasCalledApprove] = useState(false);

  const { sendTransaction, data: txHash, isPending: isSending } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStatus('idle');
      setError(null);
      setHasCalledApprove(false);
    }
  }, [isOpen]);

  // Update status based on transaction state
  useEffect(() => {
    if (isSending && status !== 'paying') {
      setStatus('paying');
    } else if (isConfirming && status !== 'confirming') {
      setStatus('confirming');
    }
  }, [isSending, isConfirming, status]);

  // Update status and call onApprove when payment is confirmed
  useEffect(() => {
    if (isConfirmed && txHash && !hasCalledApprove) {
      setStatus('success');
      setHasCalledApprove(true);

      // Prepare x402 payment proof after transaction confirms
      const prepareAndApprove = async () => {
        try {
          const costValue = (plan?.totalCost || '0').replace(' ETH', '').trim();

          // Encode x402 payment proof
          const paymentData = await encodePayment({
            client,
            payTo: PLATFORM_WALLET,
            price: costValue,
            network: 'eip155:84532', // Base Sepolia
            resourceUrl: `${AGENT_URL}/execute`,
            metadata: {
              transactionHash: txHash,
              planId: plan.id || Date.now(),
              steps: plan.steps?.length || 0,
              intent: plan.intent
            }
          });

          console.log('[PaymentModal] x402 proof encoded');

          // Call onApprove with payment proof
          onApprove({
            paymentData, // x402 payment proof from Thirdweb
            transactionHash: txHash,
            from: address
          });
        } catch (err) {
          console.error('[PaymentModal] Error encoding payment proof:', err);
          setError('Failed to encode payment proof');
        }
      };

      prepareAndApprove();
    }
  }, [isConfirmed, txHash, hasCalledApprove, plan, address, onApprove]);

  if (!isOpen || !plan) return null;

  const handlePayment = async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setError(null);
      setStatus('paying');

      // Clean totalCost - remove " ETH" suffix if present
      const costValue = plan.totalCost.replace(' ETH', '').trim();

      console.log('[PaymentModal] Sending payment:', {
        amount: costValue,
        to: PLATFORM_WALLET,
        from: address
      });

      // Send payment transaction using wagmi
      await sendTransaction({
        to: PLATFORM_WALLET,
        value: parseEther(costValue),
        chainId: baseSepolia.id
      });

      setStatus('confirming');
      console.log('[PaymentModal] Transaction sent, waiting for confirmation...');

    } catch (err) {
      console.error('Payment failed:', err);
      setError(err.message || 'Payment failed');
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-sm mx-auto relative max-h-[85vh] overflow-y-auto">
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
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Payment Required
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Approve to execute your query
            </p>
          </div>
        </div>

        {/* Plan Details */}
        <div className="space-y-2 mb-3">
          <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">Query Intent</h3>
            <p className="text-xs text-gray-700 dark:text-gray-300">{plan.intent}</p>
          </div>

          <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">Execution Plan</h3>
            <p className="text-xs text-gray-700 dark:text-gray-300 mb-1.5">{plan.reasoning}</p>
            <div className="space-y-1">
              {plan.steps?.map((step, idx) => (
                <div key={idx} className="text-xs">
                  <span className="font-medium text-gray-900 dark:text-white">Step {idx + 1}:</span>{' '}
                  <span className="text-gray-700 dark:text-gray-300">{step.tool}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="p-2.5 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Total Cost</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {plan.totalCost}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Network</span>
              <span>Base Sepolia</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Recipient</span>
              <span className="font-mono text-[10px]">{PLATFORM_WALLET.slice(0, 6)}...{PLATFORM_WALLET.slice(-4)}</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-red-900 dark:text-red-100">Payment Failed</p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {status === 'paying' && (
          <div className="mb-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
              <span className="text-xs text-blue-900 dark:text-blue-100">Waiting for wallet approval...</span>
            </div>
          </div>
        )}

        {status === 'confirming' && (
          <div className="mb-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
              <span className="text-xs text-blue-900 dark:text-blue-100">Confirming transaction...</span>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="mb-2 p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs text-green-900 dark:text-green-100">Payment confirmed! Executing query...</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
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
                Pay {plan.totalCost}
              </>
            )}
          </Button>
        </div>

        {/* Testnet Notice */}
        <p className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
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

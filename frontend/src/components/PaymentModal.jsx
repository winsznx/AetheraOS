import { useState } from 'react';
import { X, Loader2, CheckCircle, DollarSign } from 'lucide-react';
import { useAccount, useWalletClient, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import Button from './Button';
import Card from './Card';

const AGENT_URL = import.meta.env.VITE_AGENT_URL;

/**
 * Payment Approval Modal
 * Shows plan cost and handles x402 payment via Reown wallet
 */
export default function PaymentModal({ plan, onApprove, onCancel, isOpen }) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [paymentTxHash, setPaymentTxHash] = useState(null);

  // Get connected account from Reown (wagmi)
  const { address, isConnected, chain } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();

  if (!isOpen || !plan) return null;

  const handlePayment = async () => {
    try {
      setError(null);
      setIsExecuting(true);

      // Check if user is connected
      if (!isConnected || !address) {
        throw new Error('Please connect your wallet first');
      }

      console.log('[PaymentModal] Starting x402 payment flow...', {
        endpoint: `${AGENT_URL}/execute`,
        planCost: plan.totalCost,
        steps: plan.steps?.length,
        payerAddress: address
      });

      // Step 1: Try to execute - expect 402 Payment Required
      const initialResponse = await fetch(`${AGENT_URL}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan })
      });

      if (initialResponse.status !== 402) {
        // Not a payment request - handle response directly
        const data = await initialResponse.json();
        if (!initialResponse.ok || !data.success) {
          throw new Error(data.error || 'Execution failed');
        }
        onApprove(data);
        setIsExecuting(false);
        return;
      }

      // Step 2: Got 402 - extract payment details
      const paymentDetails = await initialResponse.json();
      console.log('[PaymentModal] 402 Payment Required:', paymentDetails);

      const payTo = paymentDetails.payment_details?.payTo;
      const priceStr = paymentDetails.payment_details?.price || '0.001';

      if (!payTo) {
        throw new Error('Invalid payment details received');
      }

      // Step 3: Send payment transaction via Reown wallet
      console.log('[PaymentModal] Sending payment transaction...', { to: payTo, value: priceStr });

      const txHash = await sendTransactionAsync({
        to: payTo,
        value: parseEther(priceStr)
      });

      console.log('[PaymentModal] Payment transaction sent:', txHash);
      setPaymentTxHash(txHash);

      // Step 4: Retry request with payment proof
      // Format payment proof as JSON for Thirdweb x402
      const paymentProof = JSON.stringify({
        transactionHash: txHash,
        from: address,
        to: payTo,
        value: priceStr,
        chainId: chain?.id || 84532
      });

      console.log('[PaymentModal] Retrying with payment proof...');

      const retryResponse = await fetch(`${AGENT_URL}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-payment': paymentProof
        },
        body: JSON.stringify({ plan })
      });

      console.log('[PaymentModal] Retry response:', retryResponse.status);

      const data = await retryResponse.json();

      if (!retryResponse.ok || !data.success) {
        throw new Error(data.error || data.report || 'Execution failed after payment');
      }

      // Success!
      onApprove(data);
      setIsExecuting(false);

    } catch (err) {
      console.error('[PaymentModal] Payment/execution failed:', err);
      setError(err.message || 'Payment or execution failed');
      setIsExecuting(false);
    }
  };

  const isLoading = isExecuting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-sm mx-auto relative max-h-[85vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

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
              Powered by Thirdweb x402
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
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-brand-black dark:bg-white text-white dark:text-brand-black text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {step.tool}: {step.reason}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="p-2.5 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Cost</span>
              <span className="text-lg font-bold text-brand-black dark:text-white">
                {plan.totalCost}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Network</span>
              <span>Base Sepolia</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Protocol</span>
              <span>Thirdweb x402</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Status Messages */}
        {isLoading && (
          <div className="mb-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
              <span className="text-xs text-blue-900 dark:text-blue-100">
                Processing payment and executing query...
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handlePayment}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Pay & Execute
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <p className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
          Payment will be handled securely via Thirdweb x402
        </p>
      </Card>
    </div>
  );
}

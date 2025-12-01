import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '../utils/cn';
import Button from './Button';

/**
 * PaymentModal Component
 * Modal for x402 payment approval with Thirdweb
 * Uses global CSS classes from styles/index.css
 *
 * @param {boolean} isOpen - Modal visibility
 * @param {function} onClose - Close modal callback
 * @param {object} paymentDetails - Payment details
 * @param {function} onApprove - Approve payment callback
 */
export default function PaymentModal({
  isOpen,
  onClose,
  paymentDetails = {},
  onApprove
}) {
  const [status, setStatus] = useState('pending'); // pending, processing, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [txHash, setTxHash] = useState('');

  const {
    toolName = 'Unknown Tool',
    price = '0',
    currency = 'ETH',
    network = 'Base Sepolia',
    description = '',
    category = ''
  } = paymentDetails;

  // Reset status when modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus('pending');
      setErrorMessage('');
      setTxHash('');
    }
  }, [isOpen]);

  const handleApprove = async () => {
    setStatus('processing');
    setErrorMessage('');

    try {
      const result = await onApprove();

      if (result?.success) {
        setStatus('success');
        if (result.txHash) {
          setTxHash(result.txHash);
        }

        // Auto-close after success
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        throw new Error(result?.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to process payment');
    }
  };

  const handleClose = () => {
    if (status !== 'processing') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={cn(
            'card-base w-full max-w-md animate-fade-in-up',
            'relative'
          )}
        >
          {/* Close button */}
          {status !== 'processing' && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          )}

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-primary mb-2">
              Payment Required
            </h2>
            <p className="text-secondary text-sm">
              Approve payment to use this tool
            </p>
          </div>

          {/* Status-based Content */}
          {status === 'pending' && (
            <>
              {/* Tool Details */}
              <div className="space-y-4 mb-6">
                {/* Tool Name */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-secondary">Tool</p>
                    <p className="text-lg font-medium text-primary">{toolName}</p>
                    {category && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-secondary rounded">
                        {category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {description && (
                  <div>
                    <p className="text-sm text-secondary mb-1">Description</p>
                    <p className="text-sm text-primary">{description}</p>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700" />

                {/* Payment Details */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Amount</span>
                    <span className="text-lg font-semibold text-primary">
                      {price} {currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Network</span>
                    <span className="text-sm font-medium text-primary">{network}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondary">Payment Protocol</span>
                    <span className="text-secondary">x402 via Thirdweb</span>
                  </div>
                </div>

                {/* Info Box */}
                <div className="flex gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <AlertCircle size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Payment will be processed on {network}. Make sure you have sufficient {currency} in your wallet.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  label="Cancel"
                />
                <Button
                  variant="primary"
                  onClick={handleApprove}
                  className="flex-1"
                  label={`Pay ${price} ${currency}`}
                />
              </div>
            </>
          )}

          {status === 'processing' && (
            <div className="py-12 text-center">
              <Loader2 size={48} className="mx-auto mb-4 text-brand-black dark:text-white animate-spin" />
              <h3 className="text-lg font-medium text-primary mb-2">
                Processing Payment
              </h3>
              <p className="text-sm text-secondary">
                Please confirm the transaction in your wallet...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-12 text-center">
              <CheckCircle size={48} className="mx-auto mb-4 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-medium text-primary mb-2">
                Payment Successful!
              </h3>
              <p className="text-sm text-secondary mb-4">
                Your payment has been processed successfully.
              </p>
              {txHash && (
                <a
                  href={`https://sepolia.basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View transaction
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="py-12 text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-medium text-primary mb-2">
                Payment Failed
              </h3>
              <p className="text-sm text-secondary mb-6">
                {errorMessage || 'An error occurred while processing your payment.'}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  label="Close"
                />
                <Button
                  variant="primary"
                  onClick={() => {
                    setStatus('pending');
                    setErrorMessage('');
                  }}
                  className="flex-1"
                  label="Try Again"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/midtrans';

interface MidtransCallbackResult {
  transaction_id: string;
  order_id: string;
  status_code: string;
  status_message?: string;
  payment_type: string;
  transaction_status: string;
  fraud_status?: string;
  gross_amount: string;
}

interface MidtransCallbackOptions {
  onSuccess: (result: MidtransCallbackResult) => void;
  onPending: (result: MidtransCallbackResult) => void;
  onError: (result: MidtransCallbackResult) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: MidtransCallbackOptions) => void;
    };
  }
}

interface MidtransPaymentProps {
  amount: number;
  onSuccess?: () => void;
  onPending?: () => void;
  onError?: (error: Error | string) => void;
  onClose?: () => void;
  isFreeTrial?: boolean;
}

export default function MidtransPayment({
  amount,
  onSuccess,
  onPending,
  onError,
  onClose,
  isFreeTrial = false
}: MidtransPaymentProps) {
  const router = useRouter();
  const snapScriptLoaded = useRef(false);
  
  // Function to load Midtrans Snap script
  const loadSnapScript = () => {
    if (snapScriptLoaded.current) return;
    
    const script = document.createElement('script');
    script.src = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
    script.async = true;
    script.onload = () => {
      snapScriptLoaded.current = true;
    };
    document.body.appendChild(script);
  };
  
  useEffect(() => {
    // Load Snap script on component mount
    loadSnapScript();
    
    // Cleanup function
    return () => {
      // Remove script if needed
      if (snapScriptLoaded.current) {
        const script = document.querySelector(`script[src="${process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL}"]`);
        if (script) {
          document.body.removeChild(script);
          snapScriptLoaded.current = false;
        }
      }
    };
  }, []);
  
  // Start free trial
  const handleStartTrial = async () => {
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'startTrial' }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Trial started successfully
        if (onSuccess) onSuccess();
        router.push('/dashboard'); // Redirect to dashboard
      } else {
        // Trial start failed
        if (onError) onError(data.error || 'Failed to start trial');
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      if (onError) onError(error instanceof Error ? error : new Error('Unknown error'));
    }
  };
  
  // Handle payment with Midtrans
  const handlePayment = async () => {
    try {
      // Create payment transaction
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'upgrade' }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }
      
      // Open Midtrans Snap payment page
      if (window.snap && data.token) {
        window.snap.pay(data.token, {
          onSuccess: (result: MidtransCallbackResult) => {
            console.log('Payment success:', result);
            // Update payment status on backend
            updatePaymentStatus(data.orderId, 'success');
            if (onSuccess) onSuccess();
          },
          onPending: (result: MidtransCallbackResult) => {
            console.log('Payment pending:', result);
            updatePaymentStatus(data.orderId, 'pending');
            if (onPending) onPending();
          },
          onError: (result: MidtransCallbackResult) => {
            console.error('Payment error:', result);
            updatePaymentStatus(data.orderId, 'failed');
            if (onError) onError(result.status_message || 'Payment failed');
          },
          onClose: () => {
            console.log('Customer closed the payment modal');
            if (onClose) onClose();
          },
        });
      } else {
        // Redirect to Midtrans payment page if Snap is not available
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          throw new Error('Payment gateway not available');
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      if (onError) onError(error instanceof Error ? error : new Error('Unknown error'));
    }
  };
  
  // Update payment status on the backend
  const updatePaymentStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch('/api/subscription', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          orderId,
          status,
        }),
      });
      
      const data = await response.json();
      console.log('Payment status update:', data);
      
      // Redirect to dashboard if payment successful
      if (status === 'success') {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };
  
  return (
    <div className="flex flex-col items-center space-y-4">
      {isFreeTrial ? (
        <Button 
          onClick={handleStartTrial}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md"
        >
          Coba Pro Gratis 2 Hari
        </Button>
      ) : (
        <Button 
          onClick={handlePayment}
          className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-md"
        >
          Beli Sekarang ({formatCurrency(amount)})
        </Button>
      )}
    </div>
  );
} 
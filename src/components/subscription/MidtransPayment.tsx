"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/midtrans';
import { toast } from 'sonner';

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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Start free trial
  const handleStartTrial = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log('Starting free trial');
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'startTrial' }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        const errorMsg = data.error || 'Failed to start trial';
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }
      
      const data = await response.json();
      console.log('Trial started successfully:', data);
      
      // Trial started successfully
      toast.success('Free trial started successfully!');
      if (onSuccess) onSuccess();
      router.push('/dashboard'); // Redirect to dashboard
    } catch (error) {
      console.error('Error starting trial:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      if (onError) onError(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle payment with Midtrans
  const handlePayment = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log('Starting payment process for amount:', amount);
      
      // Create payment transaction
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'upgrade' }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        const errorMsg = data.error || 'Failed to create payment';
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      const data = await response.json();
      console.log('Payment data received:', { 
        tokenExists: !!data.token, 
        redirectUrl: !!data.redirectUrl,
        orderId: data.orderId
      });
      
      if (!data.token) {
        const errorMsg = 'Payment initialization failed: missing token';
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      // Load Midtrans Snap script
      const script = document.createElement('script');
      script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
      script.async = true;
      
      script.onload = () => {
        console.log('Midtrans Snap script loaded successfully');
        
        // Open Midtrans Snap payment page
        if (window.snap) {
          window.snap.pay(data.token, {
            onSuccess: (result) => {
              console.log('Payment success:', result);
              updatePaymentStatus(data.orderId, 'success');
              toast.success('Payment successful!');
              if (onSuccess) onSuccess();
              router.push('/dashboard');
            },
            onPending: (result) => {
              console.log('Payment pending:', result);
              updatePaymentStatus(data.orderId, 'pending');
              toast.info('Payment is pending. We will notify you when it completes.');
              if (onPending) onPending();
            },
            onError: (result) => {
              console.error('Payment error:', result);
              updatePaymentStatus(data.orderId, 'failed');
              const errorMsg = result.status_message || 'Payment failed';
              setErrorMessage(errorMsg);
              toast.error(`Payment failed: ${errorMsg}`);
              if (onError) onError(errorMsg);
            },
            onClose: () => {
              console.log('Customer closed the payment modal');
              setIsLoading(false);
              if (onClose) onClose();
            }
          });
        } else {
          // Redirect to Midtrans payment page if Snap is not available
          if (data.redirectUrl) {
            console.log('Redirecting to:', data.redirectUrl);
            window.location.href = data.redirectUrl;
          } else {
            const errorMsg = 'Payment gateway not available';
            setErrorMessage(errorMsg);
            toast.error(errorMsg);
            setIsLoading(false);
          }
        }
      };
      
      script.onerror = () => {
        const errorMsg = 'Failed to load payment gateway. Please try again later.';
        console.error(errorMsg);
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
      };
      
      document.body.appendChild(script);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      if (onError) onError(error instanceof Error ? error : new Error('Unknown error'));
      setIsLoading(false);
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
      {errorMessage && (
        <div className="w-full p-3 bg-red-100 text-red-800 rounded-md text-sm mb-4">
          {errorMessage}
        </div>
      )}
      
      {isFreeTrial ? (
        <Button 
          onClick={handleStartTrial}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md"
        >
          {isLoading ? 'Processing...' : 'Coba Pro Gratis 2 Hari'}
        </Button>
      ) : (
        <Button 
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-md"
        >
          {isLoading ? 'Processing...' : `Beli Sekarang (${formatCurrency(amount)})`}
        </Button>
      )}
    </div>
  );
} 
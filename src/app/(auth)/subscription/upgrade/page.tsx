"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon } from "lucide-react";
import MidtransPayment from "@/components/subscription/MidtransPayment";
import { PLANS } from "@/lib/midtrans";
import { formatCurrency } from "@/lib/midtrans";

export default function UpgradePage() {
  const [subscription, setSubscription] = useState<{
    status: string;
    plan: string;
    isTrialAvailable: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Fetch subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch subscription data');
        }
        
        setSubscription(data);
      } catch (error) {
        setError('Failed to load subscription data. Please try again later.');
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscription();
  }, []);
  
  // Handle payment success
  const handlePaymentSuccess = () => {
    router.push('/dashboard');
  };
  
  // Handle payment error
  const handlePaymentError = (error: Error | string) => {
    setError('Payment failed. Please try again later.');
    console.error('Payment error:', error);
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2">{error}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-black text-white rounded-md"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Upgrade to Pro Plan</h1>
          <p className="text-gray-500 mt-2">
            Get unlimited access to all premium features
          </p>
        </div>
        
        <Card className="border-2 border-black overflow-hidden">
          <CardHeader className="bg-black text-white text-center py-6">
            <CardTitle className="text-2xl">Pro Plan</CardTitle>
            <CardDescription className="text-gray-300">
              Unlock the full potential of your business
            </CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">{formatCurrency(PLANS.pro.price)}</span>
              <span className="text-gray-300">/month</span>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">What&apos;s included:</h3>
            <ul className="space-y-3">
              {PLANS.pro.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          
          <CardFooter className="p-6 bg-gray-50 flex justify-center">
            <MidtransPayment 
              amount={PLANS.pro.price}
              isFreeTrial={subscription?.isTrialAvailable}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </CardFooter>
        </Card>
        
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            By subscribing, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
} 
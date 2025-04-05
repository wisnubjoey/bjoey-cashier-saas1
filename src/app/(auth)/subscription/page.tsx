"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "lucide-react";
import MidtransPayment from "@/components/subscription/MidtransPayment";
import { PLANS } from "@/lib/midtrans";
import { toast } from "sonner";

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<"free" | "pro">("pro");
  const router = useRouter();
  
  const handleSuccess = () => {
    toast.success("Payment successful! Your subscription has been activated.");
    router.push("/dashboard");
  };
  
  const handleError = (error: Error | string) => {
    const errorMessage = typeof error === "string" ? error : error.message;
    toast.error(`Payment failed: ${errorMessage}`);
  };
  
  const handleClose = () => {
    // Handle close event if needed
  };
  
  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold text-center mb-2">Choose Your Plan</h1>
        <p className="text-center text-gray-500 mb-8">
          Select the plan that best fits your business needs
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div 
            className={`border rounded-lg overflow-hidden flex flex-col bg-white cursor-pointer
              ${selectedPlan === "free" ? 'ring-2 ring-black' : ''}
            `}
            onClick={() => setSelectedPlan("free")}
          >
            <div className="p-6 flex-grow">
              <h2 className="text-xl font-bold">{PLANS.free.name}</h2>
              <p className="mt-4 text-3xl font-bold">Free</p>
              <p className="text-gray-500">limited features</p>
              
              <ul className="mt-6 space-y-3">
                {PLANS.free.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Pro Plan */}
          <div 
            className={`border rounded-lg overflow-hidden flex flex-col bg-white cursor-pointer
              ${selectedPlan === "pro" ? 'ring-2 ring-black' : ''}
            `}
            onClick={() => setSelectedPlan("pro")}
          >
            <div className="bg-black text-white text-center py-1 text-sm font-medium">
              RECOMMENDED
            </div>
            <div className="p-6 flex-grow">
              <h2 className="text-xl font-bold">{PLANS.pro.name}</h2>
              <p className="mt-4 text-3xl font-bold">Rp 99,000</p>
              <p className="text-gray-500">per month</p>
              
              <ul className="mt-6 space-y-3">
                {PLANS.pro.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 max-w-md mx-auto">
          <MidtransPayment 
            amount={selectedPlan === "pro" ? PLANS.pro.price : 0}
            isFreeTrial={selectedPlan === "free"}
            onSuccess={handleSuccess}
            onError={handleError}
            onClose={handleClose}
          />
        </div>
        
        <p className="text-center text-gray-500 mt-8">
          You can change your plan anytime from your account settings.
        </p>
      </div>
    </div>
  );
}
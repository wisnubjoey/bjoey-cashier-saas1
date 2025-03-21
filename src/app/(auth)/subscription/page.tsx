"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { CheckIcon } from "lucide-react";

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: "Rp 99.000",
    features: [
      "Up to 3 organizations",
      "Unlimited products",
      "Basic reporting",
      "1 cashier device"
    ]
  },
  {
    id: "pro",
    name: "Professional",
    price: "Rp 199.000",
    features: [
      "Up to 10 organizations",
      "Unlimited products",
      "Advanced reporting & analytics",
      "Up to 3 cashier devices",
      "Export to Excel"
    ],
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Rp 499.000",
    features: [
      "Unlimited organizations",
      "Unlimited products",
      "Advanced reporting & analytics",
      "Unlimited cashier devices",
      "Priority support",
      "API access"
    ]
  }
];

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const router = useRouter();
  const { user } = useUser();
  
  const handleSubscribe = async (planId: string) => {
    // Untuk MVP, kita langsung redirect ke organizations
    // Nantinya di sini akan ada integrasi dengan Stripe
    console.log(`Subscribing to ${planId} plan`);
    router.push("/organizations");
  };
  
  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold text-center mb-2">Choose Your Plan</h1>
        <p className="text-center text-gray-500 mb-8">
          Select the plan that best fits your business needs
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`border rounded-lg overflow-hidden flex flex-col bg-white ${
                plan.popular ? 'ring-2 ring-black' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-black text-white text-center py-1 text-sm font-medium">
                  MOST POPULAR
                </div>
              )}
              <div className="p-6 flex-grow">
                <h2 className="text-xl font-bold">{plan.name}</h2>
                <p className="mt-4 text-3xl font-bold">{plan.price}</p>
                <p className="text-gray-500">per month</p>
                
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-6 border-t">
                <button 
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full py-2 px-4 rounded-md ${
                    plan.popular 
                      ? 'bg-black text-white hover:bg-gray-800' 
                      : 'border border-black hover:bg-gray-100'
                  }`}
                >
                  Subscribe
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-center text-gray-500 mt-8">
          You can change your plan anytime from your account settings.
        </p>
      </div>
    </div>
  );
}
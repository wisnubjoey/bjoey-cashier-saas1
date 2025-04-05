"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FREE_PLAN_LIMITS } from "@/lib/subscription";

interface FeatureLimiterProps {
  feature: keyof typeof FREE_PLAN_LIMITS;
  currentCount: number;
  children: ReactNode;
}

export default function FeatureLimiter({
  feature,
  currentCount,
  children
}: FeatureLimiterProps) {
  const [subscription, setSubscription] = useState<{
    status: "free" | "trial" | "pro";
    plan: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription');
        const data = await response.json();
        
        if (response.ok) {
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscription();
  }, []);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // If not subscribed or no data, default to free plan
  const isPro = subscription?.status === "pro" || subscription?.status === "trial";
  const limit = FREE_PLAN_LIMITS[feature];
  
  // Allow access if pro/trial or under the limit
  if (isPro || currentCount < limit) {
    return <>{children}</>;
  }
  
  // Otherwise, show limit reached message
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-gray-200 rounded-lg bg-gray-50">
      <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
      <h3 className="text-xl font-semibold mb-2">Feature Limit Reached</h3>
      <p className="text-gray-600 mb-6">
        You&apos;ve reached the limit of {limit} {feature} on the free plan.
        Upgrade to Pro to get unlimited {feature}.
      </p>
      <Button
        onClick={() => router.push('/subscription/upgrade')}
        className="bg-black hover:bg-gray-800 text-white"
      >
        Upgrade to Pro
      </Button>
    </div>
  );
} 
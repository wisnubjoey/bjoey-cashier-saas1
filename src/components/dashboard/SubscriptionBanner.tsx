"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock } from "lucide-react";

interface SubscriptionBannerProps {
  className?: string;
}

export default function SubscriptionBanner({ className }: SubscriptionBannerProps) {
  const [subscription, setSubscription] = useState<{
    status: "free" | "trial" | "pro";
    plan: string;
    trialEndDate?: string | null;
    currentPeriodEnd?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Fetch subscription status
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
        setLoading(false);
      }
    };
    
    fetchSubscription();
    
    // Refresh subscription data every minute to update the countdown
    const interval = setInterval(fetchSubscription, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (loading || !subscription) {
    return null;
  }
  
  // Don't show banner for pro plan users who aren't on trial
  if (subscription.status === "pro" && subscription.plan === "pro" && !subscription.trialEndDate) {
    return null;
  }
  
  const handleUpgradeClick = () => {
    router.push('/subscription/upgrade');
  };
  
  // Format trial end time
  const formatTrialRemaining = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "soon";
    }
  };
  
  let message = "";
  let buttonText = "Upgrade to Pro";
  let icon = <AlertCircle className="h-5 w-5 mr-2" />;
  let bannerClass = "bg-yellow-100 text-yellow-800 border-yellow-300";
  
  if (subscription.status === "trial") {
    message = subscription.trialEndDate 
      ? `Your free trial expires ${formatTrialRemaining(subscription.trialEndDate)}`
      : "Your free trial is active";
    icon = <Clock className="h-5 w-5 mr-2" />;
    buttonText = "Upgrade Now";
    bannerClass = "bg-blue-100 text-blue-800 border-blue-300";
  } else if (subscription.status === "free") {
    if (subscription.trialEndDate) {
      message = "Your trial has expired. Upgrade to continue using premium features.";
    } else {
      message = "You're on the free plan. Upgrade to unlock all features.";
    }
  }
  
  return (
    <div className={`${bannerClass} px-4 py-3 rounded-md border flex items-center justify-between ${className}`}>
      <div className="flex items-center">
        {icon}
        <span>{message}</span>
      </div>
      <Button 
        onClick={handleUpgradeClick} 
        size="sm" 
        variant="outline" 
        className="ml-4 whitespace-nowrap"
      >
        {buttonText}
      </Button>
    </div>
  );
} 
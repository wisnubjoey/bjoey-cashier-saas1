"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();
  
  // Redirect to dashboard after short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="h-20 w-20 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Your payment has been processed successfully and your subscription has been activated.
          You now have full access to all Pro features.
        </p>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            You will be redirected to the dashboard in a few seconds...
          </p>
          
          <Link 
            href="/dashboard" 
            className="block w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-md text-center"
          >
            Go to Dashboard Now
          </Link>
        </div>
      </div>
    </div>
  );
} 
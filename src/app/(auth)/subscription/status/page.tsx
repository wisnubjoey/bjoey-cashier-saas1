"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function PaymentStatusPage() {
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "failed">("loading");
  const [message, setMessage] = useState("Checking payment status...");
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  
  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      setMessage("Invalid payment information.");
      return;
    }
    
    const checkPaymentStatus = async () => {
      try {
        // Fetch payment status from API
        const response = await fetch(`/api/payment/status?orderId=${orderId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to check payment status");
        }
        
        // Update UI based on payment status
        setStatus(data.status);
        
        if (data.status === "success") {
          setMessage("Your payment was successful! Your subscription has been activated.");
          // Redirect to dashboard after a delay
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        } else if (data.status === "pending") {
          setMessage("Your payment is being processed. We'll update your subscription once the payment is confirmed.");
        } else {
          setMessage("Your payment was not successful. Please try again or contact support.");
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        setStatus("failed");
        setMessage("Failed to check payment status. Please try again later.");
      }
    };
    
    checkPaymentStatus();
  }, [orderId, router]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          {status === "loading" && <Loader2 className="h-20 w-20 text-blue-500 animate-spin" />}
          {status === "success" && <CheckCircle className="h-20 w-20 text-green-500" />}
          {status === "pending" && <AlertTriangle className="h-20 w-20 text-amber-500" />}
          {status === "failed" && <XCircle className="h-20 w-20 text-red-500" />}
        </div>
        
        <h1 className="text-3xl font-bold mb-2">
          {status === "loading" && "Processing Your Payment"}
          {status === "success" && "Payment Successful"}
          {status === "pending" && "Payment Pending"}
          {status === "failed" && "Payment Failed"}
        </h1>
        
        <p className="text-gray-600 mb-8">{message}</p>
        
        <div className="space-y-4">
          {status === "failed" && (
            <Link 
              href="/subscription/upgrade" 
              className="block w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-md text-center"
            >
              Try Again
            </Link>
          )}
          
          <Link 
            href="/dashboard" 
            className="block w-full bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-6 rounded-md border border-gray-300 text-center"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 
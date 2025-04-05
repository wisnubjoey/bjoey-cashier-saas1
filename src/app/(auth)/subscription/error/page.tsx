"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function PaymentErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <AlertTriangle className="h-20 w-20 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-8">
          We encountered an issue processing your payment. Please try again or contact support if the problem persists.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/subscription/upgrade" 
            className="block w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-md text-center"
          >
            Try Again
          </Link>
          
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
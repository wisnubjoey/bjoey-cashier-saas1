"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export function Hero() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('clerk-db-jwt');
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };
    
    checkAuth();
  }, []);
  
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              <span className="text-green-600">Modern</span> Cashier System for Your Business
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">
              Transform your business with our cloud-based cashier system. 
              Manage inventory, process sales, and view reports from anywhere.
            </p>
            <div className="flex flex-wrap gap-4">
              {isLoggedIn ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors inline-block font-medium"
                  >
                    Go to Dashboard
                  </Link>
                  <Link 
                    href="/subscription/upgrade" 
                    className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors inline-block font-medium"
                  >
                    Try Pro Free for 2 Days
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/register" 
                    className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors inline-block font-medium"
                  >
                    Create Account
                  </Link>
                  <Link 
                    href="/login" 
                    className="border border-black px-6 py-3 rounded-md hover:bg-gray-100 transition-colors inline-block font-medium"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span>Free 2-day Pro trial</span>
              </div>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="bg-gray-100 rounded-lg p-4 shadow-lg border border-gray-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-600 rounded-bl-full opacity-20"></div>
              <div className="aspect-video relative">
                <Image 
                  src="/images/cashier-preview.png" 
                  alt="Cashier System Preview" 
                  fill
                  className="object-cover rounded-md"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200 rounded-md"><p class="text-gray-500">Cashier System Preview</p></div>';
                    }
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-md">
                  <p className="text-gray-500">Cashier System Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 
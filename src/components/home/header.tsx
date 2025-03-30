"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-bold text-xl flex items-center">
            <span className="text-green-600 mr-1 font-semibold">SaaS</span>
            <span className="font-semibold">Cashier</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/pricing" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Pricing
            </Link>
            <Link href="#features" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Features
            </Link>
            <Link href="#testimonials" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Testimonials
            </Link>
            
            {isSignedIn ? (
              <Link 
                href="/organizations" 
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium"
              >
                Dashboard
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium"
              >
                Get Started
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 flex flex-col gap-4">
            <Link 
              href="/pricing" 
              className="text-gray-700 hover:text-green-600 transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="#features" 
              className="text-gray-700 hover:text-green-600 transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="#testimonials" 
              className="text-gray-700 hover:text-green-600 transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonials
            </Link>
            
            {isSignedIn ? (
              <Link 
                href="/organizations" 
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors inline-block w-fit font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors inline-block w-fit font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
} 
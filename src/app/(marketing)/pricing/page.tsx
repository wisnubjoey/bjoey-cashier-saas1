import Link from "next/link";
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

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navigation */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="font-bold text-xl">SaaS Cashier</Link>
          <nav className="flex gap-4">
            <Link href="/login" className="hover:underline">
              Login
            </Link>
            <Link 
              href="/register" 
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Pricing Section */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold text-center mb-2">Choose Your Plan</h1>
          <p className="text-center text-gray-500 mb-12">
            Select the plan that best fits your business needs
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`border rounded-lg overflow-hidden flex flex-col ${
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
                  <Link 
                    href="/register" 
                    className={`block text-center py-2 px-4 rounded-md w-full ${
                      plan.popular 
                        ? 'bg-black text-white hover:bg-gray-800' 
                        : 'border border-black hover:bg-gray-100'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          &copy; {new Date().getFullYear()} SaaS Cashier. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

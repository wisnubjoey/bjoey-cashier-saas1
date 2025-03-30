import Link from "next/link";
import { CheckIcon } from "lucide-react";

export function Pricing() {
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

  return (
    <section id="pricing" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Simple, <span className="text-green-600">Transparent</span> Pricing
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Choose the plan that best fits your business needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`bg-white border rounded-lg overflow-hidden flex flex-col ${
                plan.popular ? 'ring-2 ring-green-600 transform md:scale-105 z-10' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-green-600 text-white text-center py-1 text-sm font-medium">
                  MOST POPULAR
                </div>
              )}
              <div className="p-6 flex-grow">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="mt-4 text-3xl font-bold tracking-tight">{plan.price}</p>
                <p className="text-gray-500">per month</p>
                
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-600 mr-2 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-6 border-t">
                <Link 
                  href="/register" 
                  className={`block text-center py-2 px-4 rounded-md w-full font-medium ${
                    plan.popular 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
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
    </section>
  );
} 
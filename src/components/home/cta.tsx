import Link from "next/link";

export function Cta() {
  return (
    <section className="py-16 md:py-24 bg-black text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
          Ready to <span className="text-green-500">Transform</span> Your Business?
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-lg">
          Join thousands of businesses already using SaaS Cashier to streamline their operations and boost their growth.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/register" 
            className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors inline-block font-medium"
          >
            Start Your Free Trial
          </Link>
          <Link 
            href="/contact" 
            className="border border-white px-8 py-3 rounded-md hover:bg-white hover:text-black transition-colors inline-block font-medium"
          >
            Contact Sales
          </Link>
        </div>
        <p className="text-gray-400 mt-6 text-sm">
          No credit card required. 14-day free trial.
        </p>
      </div>
    </section>
  );
} 
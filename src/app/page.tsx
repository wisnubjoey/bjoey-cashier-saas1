import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navigation */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl">SaaS Cashier</div>
          <nav className="flex gap-4">
            <Link href="/pricing" className="hover:underline">
              Pricing
            </Link>
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

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Modern Cashier System for Your Business
            </h1>
            <p className="text-lg text-gray-600">
              Transform your business with our cloud-based cashier system. 
              Manage inventory, process sales, and view reports from anywhere.
            </p>
            <div className="flex gap-4">
              <Link 
                href="/register" 
                className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 inline-block"
              >
                Get Started
              </Link>
              <Link 
                href="/pricing" 
                className="border border-black px-6 py-3 rounded-md hover:bg-gray-100 inline-block"
              >
                View Pricing
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="bg-gray-200 rounded-lg p-4 aspect-video flex items-center justify-center">
              <p className="text-gray-500 text-center">Cashier System Preview</p>
              {/* Placeholder for a screenshot or illustration */}
            </div>
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

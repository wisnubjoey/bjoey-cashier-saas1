import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="font-bold text-xl flex items-center mb-4">
              <span className="text-green-600 mr-1 font-semibold">SaaS</span>
              <span className="font-semibold">Cashier</span>
            </Link>
            <p className="text-gray-600 mb-4">
              Modern cashier system for businesses of all sizes.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="#features" className="text-gray-600 hover:text-green-600 transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-gray-600 hover:text-green-600 transition-colors">Pricing</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-green-600 transition-colors">Integrations</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-green-600 transition-colors">Updates</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-600 hover:text-green-600 transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-green-600 transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-green-600 transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-green-600 transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-600 hover:text-green-600 transition-colors">Help Center</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-green-600 transition-colors">Documentation</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-green-600 transition-colors">API Reference</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-green-600 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} SaaS Cashier. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 
import { ShoppingCart, BarChart, Package, Settings, Clock, Globe } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: <ShoppingCart className="h-8 w-8 text-green-600" />,
      title: "Point of Sale",
      description: "Fast and intuitive POS system for quick checkout and payment processing."
    },
    {
      icon: <BarChart className="h-8 w-8 text-green-600" />,
      title: "Analytics & Reporting",
      description: "Detailed reports and insights to help you make data-driven decisions."
    },
    {
      icon: <Package className="h-8 w-8 text-green-600" />,
      title: "Inventory Management",
      description: "Track stock levels, set alerts, and manage your products efficiently."
    },
    {
      icon: <Settings className="h-8 w-8 text-green-600" />,
      title: "Customizable",
      description: "Tailor the system to your business needs with flexible configuration options."
    },
    {
      icon: <Clock className="h-8 w-8 text-green-600" />,
      title: "Real-time Updates",
      description: "All your data syncs instantly across devices for up-to-date information."
    },
    {
      icon: <Globe className="h-8 w-8 text-green-600" />,
      title: "Cloud-based",
      description: "Access your business data from anywhere, anytime, on any device."
    }
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Powerful <span className="text-green-600">Features</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Our cashier system comes packed with everything you need to run your business efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 
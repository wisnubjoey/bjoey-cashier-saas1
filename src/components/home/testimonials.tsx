export function Testimonials() {
  const testimonials = [
    {
      quote: "SaaS Cashier has completely transformed how we manage our retail store. The inventory tracking alone has saved us countless hours.",
      author: "Sarah Johnson",
      role: "Boutique Owner",
      avatar: "/avatars/sarah.jpg"
    },
    {
      quote: "The reporting features give me insights I never had before. I can make better business decisions with real data.",
      author: "Michael Chen",
      role: "Restaurant Manager",
      avatar: "/avatars/michael.jpg"
    },
    {
      quote: "Setting up was incredibly easy, and the customer support team has been amazing whenever I've had questions.",
      author: "Aisha Patel",
      role: "Bookstore Owner",
      avatar: "/avatars/aisha.jpg"
    }
  ];

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            What Our <span className="text-green-600">Customers</span> Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Businesses of all sizes are using SaaS Cashier to streamline their operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-gray-50 p-6 rounded-lg border border-gray-200 relative"
            >
              <div className="absolute -top-3 left-6 text-green-600 text-5xl">&quot;</div>
              <p className="text-gray-600 mb-6 pt-4 relative z-10 text-lg">
                {testimonial.quote}
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden mr-4">
                  {/* Fallback avatar */}
                  <div className="w-full h-full flex items-center justify-center bg-green-600 text-white font-bold">
                    {testimonial.author.charAt(0)}
                  </div>
                </div>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { Pricing } from "@/components/home/pricing";
import { Cta } from "@/components/home/cta";
import { Testimonials } from "@/components/home/testimonials";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
     <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
        <Testimonials />
        <Pricing />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}

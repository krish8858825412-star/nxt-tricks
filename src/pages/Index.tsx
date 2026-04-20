import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Pillars from "@/components/sections/Pillars";
import HowItWorks from "@/components/sections/HowItWorks";
import StatsTicker from "@/components/sections/StatsTicker";
import Testimonials from "@/components/sections/Testimonials";
import LeadForm from "@/components/sections/LeadForm";
import Footer from "@/components/sections/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Pillars />
        <HowItWorks />
        <StatsTicker />
        <Testimonials />
        <LeadForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

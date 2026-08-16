import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Statistics } from "@/components/landing/statistics";
import { Features } from "@/components/landing/features";
import { Workflow } from "@/components/landing/workflow";
import { ModulePreview } from "@/components/landing/module-preview";
import { Technology } from "@/components/landing/technology";
import { Security } from "@/components/landing/security";
import { Footer } from "@/components/landing/footer";
import { AuroraBackground } from "@/components/landing/motion";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#070D1B] text-white antialiased">
      <AuroraBackground />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <Statistics />
          <Features />
          <Workflow />
          <ModulePreview />
          <Technology />
          <Security />
        </main>
        <Footer />
      </div>
    </div>
  );
}
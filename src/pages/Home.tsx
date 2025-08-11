// import "./App.css";
// import "./global.css";
import { HeroSection } from "../components/hero-section";
import { FeaturesSection } from "../components/features-section";
import { HowItWorksSection } from "../components/how-it-works-section";
import { CampaignsShowcase } from "../components/campaigns-showcase";
import { Footer } from "../components/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* <Header /> */}
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CampaignsShowcase />
      </main>
      <Footer />
    </div>
  );
}

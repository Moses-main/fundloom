import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { HeroSection } from "../components/hero-section";
import { FeaturesSection } from "../components/features-section";
import { HowItWorksSection } from "../components/how-it-works-section";
import { CampaignsShowcase } from "../components/campaigns-showcase";
import { Footer } from "../components/footer";

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const campaignId = searchParams.get("campaign");
    if (campaignId) {
      navigate(`/campaign/${campaignId}`, { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background">
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

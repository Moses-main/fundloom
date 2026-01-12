import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { HeroSection } from "../components/hero-section";
import { FeaturesSection } from "../components/features-section";
import { HowItWorksSection } from "../components/how-it-works-section";
import { CampaignsShowcase } from "../components/campaigns-showcase";
import Testimonials from "@/components/Testimonials";
import { Footer } from "../components/footer";
import { ProtocolSections } from "../components/protocol-sections";

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a campaign ID in the query parameters
    const campaignId = searchParams.get("campaign");
    if (campaignId) {
      // Redirect to the campaign page with the ID from the query parameter
      navigate(`/campaign/${campaignId}`, { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-ah-screen">
      <main>
        <HeroSection />
        <FeaturesSection />
        <Testimonials />
        <HowItWorksSection />
        <CampaignsShowcase />
      </main>
      <Footer />
    </div>
  );
}

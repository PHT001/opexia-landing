import AgenceNavbar from "@/components/agence/AgenceNavbar";
import AgenceHero from "@/components/agence/AgenceHero";
import SectorChat from "@/components/agence/SectorChat";
import ProblemSection from "@/components/agence/ProblemSection";
import UrgencyTimeline from "@/components/agence/UrgencyTimeline";
import ProcessSteps from "@/components/agence/ProcessSteps";
import AgenceTestimonials from "@/components/agence/AgenceTestimonials";
import FoundersSection from "@/components/agence/FoundersSection";
import AgenceFAQ from "@/components/agence/AgenceFAQ";
import AgenceFooter from "@/components/agence/AgenceFooter";
import AgenceStickyMobileCTA from "@/components/agence/AgenceStickyMobileCTA";
import AgenceChatbot from "@/components/agence/AgenceChatbot";
import JsonLd from "@/components/seo/JsonLd";

export default function Home() {
  return (
    <>
      <JsonLd />
      <AgenceNavbar />
      <AgenceHero />
      <ProblemSection />
      <UrgencyTimeline />
      <ProcessSteps />
      <SectorChat />
      <AgenceTestimonials />
      <FoundersSection />
      <AgenceFAQ />
      <AgenceFooter />
      <AgenceStickyMobileCTA />
      <AgenceChatbot />
    </>
  );
}

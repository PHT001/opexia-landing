"use client";

import AgenceNavbar from "@/components/agence/AgenceNavbar";
import AgenceHero from "@/components/agence/AgenceHero";
import SectorChat from "@/components/agence/SectorChat";
import ProblemSection from "@/components/agence/ProblemSection";
import UrgencyTimeline from "@/components/agence/UrgencyTimeline";
// import ServicesSection from "@/components/agence/ServicesSection";
import ProcessSteps from "@/components/agence/ProcessSteps";
import BeforeAfter from "@/components/agence/BeforeAfter";
import AgenceTestimonials from "@/components/agence/AgenceTestimonials";
import FoundersSection from "@/components/agence/FoundersSection";
import AgenceFAQ from "@/components/agence/AgenceFAQ";
import AgenceFooter from "@/components/agence/AgenceFooter";
import AgenceStickyMobileCTA from "@/components/agence/AgenceStickyMobileCTA";
import AgenceChatbot from "@/components/agence/AgenceChatbot";
export default function Home() {
  return (
    <>
      <AgenceNavbar />
      <AgenceHero />
      <ProblemSection />
      <UrgencyTimeline />
      {/* <ServicesSection /> */}
      <ProcessSteps />
      <SectorChat />
      {/* <BeforeAfter /> */}
      <AgenceTestimonials />
      <FoundersSection />
      <AgenceFAQ />
      <AgenceFooter />
      <AgenceStickyMobileCTA />
      <AgenceChatbot />
    </>
  );
}

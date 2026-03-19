"use client";

import { useEffect } from "react";

export default function AgenceCalendly() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section id="calendly" className="py-16 lg:py-20 bg-[#FAFAFA] scroll-mt-20">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-sm font-semibold text-[#007AFF] uppercase tracking-wider">
            Prenez rendez-vous
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            R&eacute;servez votre audit IA gratuit
          </h2>
          <p className="mt-4 text-[#6B7280] text-base lg:text-lg max-w-xl mx-auto">
            1h pour analyser votre business et identifier vos opportunit&eacute;s d&apos;automatisation.{" "}
            <strong className="font-semibold text-[#374151]">Gratuit et sans engagement.</strong>
          </p>
        </div>

        <div
          className="calendly-inline-widget rounded-2xl overflow-hidden"
          data-url="https://calendly.com/opexiapro/audit-ia-gratuit?hide_gdpr_banner=1&primary_color=007AFF"
          style={{ minWidth: "320px", height: "700px" }}
        />
      </div>
    </section>
  );
}

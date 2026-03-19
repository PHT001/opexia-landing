"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

const cases = [
  {
    sector: "Cabinet Comptable",
    icon: "📊",
    metric: "Saisie de factures",
    before: { value: "4h", unit: "/ jour", detail: "3 employés mobilisés" },
    after: { value: "45 min", unit: "/ jour", detail: "1 seul contrôle humain" },
    saving: "22 000€ / an économisés",
  },
  {
    sector: "Agence Immobilière",
    icon: "🏠",
    metric: "Réponse aux leads",
    before: { value: "24h", unit: "de délai", detail: "Leads perdus chaque semaine" },
    after: { value: "30 min", unit: "de délai", detail: "Réponse IA quasi-instantanée" },
    saving: "+18% de taux de conversion",
  },
  {
    sector: "E-commerce",
    icon: "🛒",
    metric: "Fiches produits",
    before: { value: "2h", unit: "/ fiche", detail: "Rédaction + photos + SEO" },
    after: { value: "20 min", unit: "/ fiche", detail: "Génération IA + relecture" },
    saving: "80 fiches en 1 semaine",
  },
];

function Card({ c, i }: { c: typeof cases[0]; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="rounded-2xl border border-white/30 bg-white overflow-hidden shadow-[0_0_60px_10px_rgba(255,255,255,0.15),0_0_20px_0px_rgba(255,255,255,0.3)] hover:shadow-[0_0_80px_15px_rgba(255,255,255,0.2),0_0_30px_0px_rgba(255,255,255,0.4)] transition-shadow duration-300 flex-shrink-0 w-[85vw] snap-center md:w-auto"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-3">
        <motion.span
          initial={{ scale: 0, rotate: -30 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 + i * 0.15 }}
          className="text-xl"
        >
          {c.icon}
        </motion.span>
        <div>
          <h3 className="text-base font-bold text-[#111]">{c.sector}</h3>
          <p className="text-xs text-[#6B7280]">{c.metric}</p>
        </div>
      </div>

      {/* Before / After side by side */}
      <div className="px-5 pb-4 grid grid-cols-2 gap-3">
        {/* Before */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 + i * 0.15 }}
          className="rounded-xl bg-gray-50 p-4 text-center relative"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-500/70 mb-2 block">
            Avant
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl lg:text-3xl font-black text-[#111]">
              {c.before.value}
            </span>
            <span className="text-xs text-[#6B7280]">{c.before.unit}</span>
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1.5 leading-tight">
            {c.before.detail}
          </p>
        </motion.div>

        {/* After */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
          className="rounded-xl bg-[#007AFF]/10 border border-[#007AFF]/20 p-4 text-center relative"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#007AFF] mb-2 block">
            Apr&egrave;s IA
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl lg:text-3xl font-black text-[#111]">
              {c.after.value}
            </span>
            <span className="text-xs text-[#007AFF]/60">{c.after.unit}</span>
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1.5 leading-tight">
            {c.after.detail}
          </p>
        </motion.div>
      </div>

      {/* Saving footer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.55 + i * 0.15 }}
        className="px-5 py-3 border-t border-gray-100 bg-gradient-to-r from-[#007AFF]/5 to-transparent"
      >
        <div className="flex items-center justify-center gap-2">
          <motion.svg
            initial={{ x: -8, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.65 + i * 0.15 }}
            className="w-3.5 h-3.5 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </motion.svg>
          <p className="text-sm font-bold text-[#111]">{c.saving}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function BeforeAfter() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Track which card is visible on mobile
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (!hasScrolled) setHasScrolled(true);
      const scrollLeft = el.scrollLeft;
      const cardWidth = el.firstElementChild?.getBoundingClientRect().width ?? 1;
      const gap = 16;
      const idx = Math.round(scrollLeft / (cardWidth + gap));
      setActiveIndex(Math.min(idx, cases.length - 1));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [hasScrolled]);

  // Nudge animation on mobile: auto-scroll slightly right then back
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || hasScrolled) return;
    const timer = setTimeout(() => {
      el.scrollTo({ left: 40, behavior: "smooth" });
      setTimeout(() => {
        el.scrollTo({ left: 0, behavior: "smooth" });
      }, 400);
    }, 1500);
    return () => clearTimeout(timer);
  }, [hasScrolled]);

  return (
    <section id="resultats" className="py-14 lg:py-20 bg-[#0A0A0A] scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-sm font-semibold text-[#007AFF] uppercase tracking-wider">
            R&eacute;sultats concrets
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Avant / Apr&egrave;s{" "}
            <span className="text-gray-500">l&apos;IA</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Des r&eacute;sultats mesur&eacute;s chez nos clients.
          </p>
        </motion.div>

        {/* Desktop: grid — Mobile: horizontal scroll */}
        <div
          ref={scrollRef}
          className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0"
        >
          {cases.map((c, i) => (
            <Card key={c.sector} c={c} i={i} />
          ))}
        </div>

        {/* Mobile dots + swipe hint */}
        <div className="flex md:hidden flex-col items-center gap-3 mt-5">
          {/* Dots */}
          <div className="flex gap-2">
            {cases.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIndex === i
                    ? "w-6 bg-[#007AFF]"
                    : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
          {/* Swipe hint — fades out after first scroll */}
          {!hasScrolled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-white/30 text-xs"
            >
              <motion.svg
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </motion.svg>
              Glisse pour voir les autres
            </motion.div>
          )}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a
            href="https://calendly.com/opexiapro/audit-ia-gratuit"
            className="inline-flex items-center gap-2 rounded-full bg-[#007AFF] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0055D4] transition-all hover:shadow-xl hover:shadow-blue-900/30"
          >
            R&eacute;server mon audit gratuit
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

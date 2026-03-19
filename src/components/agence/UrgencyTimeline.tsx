"use client";

import { motion } from "framer-motion";

const timeline = [
  { year: "2023", event: "ChatGPT explose. Tout le monde en parle, personne n'agit.", opacity: "text-white/30" },
  { year: "2024", event: "Les entreprises innovantes commencent à automatiser.", opacity: "text-white/50" },
  { year: "2025", event: "Vos concurrents directs y sont. Ils gagnent du temps et de l'argent.", opacity: "text-white/70" },
  { year: "2026", event: "Ceux qui n'ont pas bougé perdent des parts de marché.", opacity: "text-white", highlight: true },
  { year: "2027", event: "Sans IA, vous êtes hors-jeu.", opacity: "text-white/30" },
];

export default function UrgencyTimeline() {
  return (
    <section className="relative py-16 lg:py-24 bg-[#0A0A0A] overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#007AFF]/5 rounded-full blur-[120px]" />

      <div className="relative mx-auto max-w-3xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-sm font-semibold text-[#007AFF] uppercase tracking-wider">
            Urgence
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            L&apos;IA n&apos;est plus un avantage.
            <br />
            <span className="text-white/40">C&apos;est la norme.</span>
          </h2>
          <p className="mt-4 text-lg text-white/40">
            65% des entreprises d&eacute;clarent que l&apos;IA a am&eacute;lior&eacute; leur productivit&eacute;. O&ugrave; en &ecirc;tes-vous ?
            <span className="block text-sm text-[#007AFF]/60 mt-2 font-medium">Source : McKinsey, The State of AI, 2025</span>
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-[22px] top-0 bottom-0 w-px bg-gradient-to-b from-white/5 via-[#007AFF]/40 to-white/5" />

          <div className="space-y-0">
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative flex items-start gap-6 py-5"
              >
                <div className="relative z-10 flex-shrink-0 w-[45px] flex justify-center">
                  <div
                    className={`h-3 w-3 rounded-full border-2 ${
                      item.highlight
                        ? "bg-[#007AFF] border-[#007AFF] shadow-[0_0_12px_rgba(0,122,255,0.6)]"
                        : "bg-transparent border-white/20"
                    }`}
                  />
                </div>

                <div className="flex-1 -mt-1">
                  <span
                    className={`text-xs font-mono tracking-wider ${
                      item.highlight ? "text-[#007AFF]" : "text-white/20"
                    }`}
                  >
                    {item.year}
                  </span>
                  <p className={`text-lg font-medium leading-snug mt-0.5 ${item.opacity}`}>
                    {item.event}
                  </p>
                </div>

                {item.highlight && (
                  <span className="flex-shrink-0 text-xs font-bold text-[#007AFF] bg-[#007AFF]/10 border border-[#007AFF]/30 rounded-full px-3 py-1 mt-0.5">
                    Vous &ecirc;tes ici
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <a
            href="https://calendly.com/opexiapro/audit-ia-gratuit"
            className="inline-flex items-center gap-2 rounded-full bg-[#007AFF] px-8 py-4 text-base font-semibold text-white hover:bg-[#0055D4] transition-all hover:shadow-xl hover:shadow-blue-900/30"
          >
            Demander mon diagnostic IA
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

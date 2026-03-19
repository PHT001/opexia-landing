"use client";

import { motion } from "framer-motion";

export default function FormationBridge() {
  return (
    <section className="py-16 lg:py-20 bg-[#0A0A0A]">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <h2 className="text-2xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
            Dans 14 jours, votre entreprise
            <br />
            peut gagner <span className="text-[#007AFF]">des heures chaque semaine.</span>
          </h2>

          <p className="mt-4 text-base text-white/50 max-w-md mx-auto">
            <strong className="font-semibold text-white/70">1 heure</strong> pour d&eacute;couvrir ce que l&apos;IA peut changer. <strong className="font-semibold text-white/70">Gratuit. Sans engagement.</strong>
          </p>

          <div className="mt-8">
            <a
              href="https://calendly.com/opexiapro/audit-ia-gratuit"
              className="inline-flex items-center gap-2 rounded-full bg-[#007AFF] px-8 py-4 text-base font-semibold text-white hover:bg-[#0055D4] hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              D&eacute;couvrir mon potentiel IA
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

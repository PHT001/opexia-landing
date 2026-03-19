"use client";

import { motion } from "framer-motion";

export default function AgenceFinalCTA() {
  return (
    <section className="relative py-20 lg:py-28 bg-[#0A0A0A] overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#007AFF]/8 rounded-full blur-[150px]" />

      <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-tight">
            Dans 14 jours, votre entreprise
            <br />
            peut gagner <span className="text-[#007AFF]">des heures chaque semaine.</span>
          </h2>

          <p className="mt-6 text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            <strong className="font-semibold text-gray-300">1 heure</strong> pour d&eacute;couvrir ce que l&apos;IA peut changer dans votre business.
            <br />
            <strong className="font-semibold text-gray-300">Gratuit</strong>. <strong className="font-semibold text-gray-300">Sans engagement</strong>.
          </p>

          <div className="mt-10">
            <a
              href="#calendly"
              className="inline-flex items-center justify-center rounded-full bg-[#007AFF] px-10 py-5 text-lg font-bold text-white transition-all hover:bg-[#0055D4] hover:shadow-2xl hover:shadow-blue-900/40"
            >
              Acc&eacute;der &agrave; mon audit gratuit
              <svg className="ml-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            {["1h", "Gratuit", "Sans engagement", "En visio"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

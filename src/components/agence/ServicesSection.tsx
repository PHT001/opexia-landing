"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const services = [
  {
    title: "Chatbots & Support client",
    desc: "Vos clients ont une r\u00e9ponse en 30 secondes. M\u00eame \u00e0 3h du matin.",
    stat: "24/7",
    statLabel: "disponibilit\u00e9",
    gradient: "from-blue-500/20 to-cyan-500/20",
    accentColor: "#00B4D8",
    features: ["R\u00e9ponse instantan\u00e9e", "Multi-canal", "Qualification leads"],
  },
  {
    title: "Automatisation des process",
    desc: "Facturation, relances, onboarding, reporting \u2014 tout tourne sans vous.",
    stat: "-73%",
    statLabel: "temps manuel",
    gradient: "from-violet-500/20 to-purple-500/20",
    accentColor: "#8B5CF6",
    features: ["Workflows custom", "Int\u00e9grations API", "Z\u00e9ro erreur"],
  },
  {
    title: "G\u00e9n\u00e9ration de contenus",
    desc: "Posts, emails, fiches produits, SEO \u2014 10 min au lieu de 3 heures.",
    stat: "x20",
    statLabel: "plus rapide",
    gradient: "from-emerald-500/20 to-green-500/20",
    accentColor: "#10B981",
    features: ["SEO optimis\u00e9", "Ton de marque", "Multi-format"],
  },
  {
    title: "CRM intelligent",
    desc: "Votre base se met \u00e0 jour et se relance toute seule. Aucun lead oubli\u00e9.",
    stat: "0",
    statLabel: "lead perdu",
    gradient: "from-amber-500/20 to-orange-500/20",
    accentColor: "#F59E0B",
    features: ["Scoring auto", "Relances IA", "Pipeline visuel"],
  },
  {
    title: "Dashboards & Analyse",
    desc: "Toutes vos donn\u00e9es sur un \u00e9cran. D\u00e9cision en 30 secondes.",
    stat: "1",
    statLabel: "seul \u00e9cran",
    gradient: "from-rose-500/20 to-pink-500/20",
    accentColor: "#F43F5E",
    features: ["Temps r\u00e9el", "KPIs cl\u00e9s", "Alertes auto"],
  },
  {
    title: "Formation de vos \u00e9quipes",
    desc: "Votre \u00e9quipe ma\u00eetrise les outils qu'on installe. Z\u00e9ro d\u00e9pendance.",
    stat: "100%",
    statLabel: "autonomie",
    gradient: "from-sky-500/20 to-blue-500/20",
    accentColor: "#007AFF",
    features: ["Sur mesure", "Support inclus", "Vid\u00e9os & docs"],
  },
];

export default function ServicesSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="services" className="py-20 lg:py-28 bg-[#0A0A0A] overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 max-w-2xl"
        >
          <span className="text-sm font-semibold text-[#007AFF] uppercase tracking-wider">
            Nos services
          </span>
        </motion.div>

        {/* Accordion + Detail panel — same layout on all screens */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
          {/* Left: Service list */}
          <div className="space-y-2">
            {services.map((service, i) => (
              <motion.button
                key={service.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setActiveIndex(i)}
                className={`w-full text-left rounded-2xl px-5 py-4 transition-all duration-300 cursor-pointer group ${
                  activeIndex === i
                    ? "bg-white/[0.06] border border-white/[0.1]"
                    : "bg-transparent border border-transparent hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Active indicator */}
                  <div
                    className={`h-8 w-1 rounded-full transition-all duration-300 ${
                      activeIndex === i ? "opacity-100" : "opacity-0"
                    }`}
                    style={{ background: activeIndex === i ? service.accentColor : "transparent" }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-sm sm:text-base font-semibold transition-colors duration-300"
                      style={{ color: activeIndex === i ? "#ffffff" : "rgba(255,255,255,0.4)" }}
                    >
                      {service.title}
                    </h3>
                    <AnimatePresence>
                      {activeIndex === i && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="text-xs sm:text-sm text-white/30 mt-1 leading-relaxed overflow-hidden"
                        >
                          {service.desc}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  {/* Stat badge */}
                  <div
                    className={`text-right transition-opacity duration-300 ${
                      activeIndex === i ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <p className="text-lg font-black" style={{ color: service.accentColor }}>{service.stat}</p>
                    <p className="text-[9px] text-white/25 uppercase tracking-wider">{service.statLabel}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Right / Below: Detail panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`relative rounded-3xl border border-white/[0.08] p-6 sm:p-8 lg:p-10 overflow-hidden min-h-[320px] lg:min-h-[380px] flex flex-col justify-between bg-gradient-to-br ${services[activeIndex].gradient}`}
            >
              {/* Glow orb */}
              <div
                className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[100px] opacity-40"
                style={{ background: services[activeIndex].accentColor }}
              />

              <div className="relative z-10">
                {/* Big stat */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                  className="mb-6 lg:mb-8"
                >
                  <span
                    className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight"
                    style={{ color: services[activeIndex].accentColor }}
                  >
                    {services[activeIndex].stat}
                  </span>
                  <p className="text-xs sm:text-sm text-white/30 uppercase tracking-widest mt-1">
                    {services[activeIndex].statLabel}
                  </p>
                </motion.div>

                {/* Title + description */}
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3">
                  {services[activeIndex].title}
                </h3>
                <p className="text-sm sm:text-base text-white/50 leading-relaxed max-w-md">
                  {services[activeIndex].desc}
                </p>

                {/* Feature chips */}
                <div className="flex flex-wrap gap-2 mt-5 sm:mt-6">
                  {services[activeIndex].features.map((feat, fi) => (
                    <motion.span
                      key={feat}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + fi * 0.08 }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                      style={{
                        borderColor: services[activeIndex].accentColor + "30",
                        color: services[activeIndex].accentColor,
                        background: services[activeIndex].accentColor + "10",
                      }}
                    >
                      {feat}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Bottom navigation dots */}
              <div className="relative z-10 flex items-center gap-2 mt-6 lg:mt-8">
                {services.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      i === activeIndex ? "w-8" : "w-1.5 bg-white/10 hover:bg-white/20"
                    }`}
                    style={i === activeIndex ? { background: services[activeIndex].accentColor } : {}}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <a
            href="#calendly"
            className="inline-flex items-center gap-2 rounded-full bg-[#007AFF] px-8 py-4 text-base font-semibold text-white hover:bg-[#0055D4] transition-all hover:shadow-xl hover:shadow-blue-900/30"
          >
            {"D\u00e9couvrir ce qu'on peut faire pour vous"}
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

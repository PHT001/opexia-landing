"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type Phase = "question" | "typing" | "results";

interface Automation {
  icon: string;
  title: string;
  result: string;
  percent: number;
}

interface Sector {
  name: string;
  icon: string;
  automations: Automation[];
}

const sectors: Sector[] = [
  {
    name: "BTP & Construction",
    icon: "🏗️",
    automations: [
      { icon: "📋", title: "Devis automatisés", result: "-1h/jour", percent: 85 },
      { icon: "🤖", title: "Chatbot qualification chantiers", result: "24/7", percent: 100 },
      { icon: "📊", title: "Suivi de chantier automatisé", result: "Temps réel", percent: 92 },
      { icon: "📧", title: "Relances fournisseurs auto", result: "0 oubli", percent: 100 },
    ],
  },
  {
    name: "Immobilier",
    icon: "🏠",
    automations: [
      { icon: "💬", title: "Chatbot qualification leads", result: "Réponse en 30s", percent: 100 },
      { icon: "🔄", title: "Relances automatiques", result: "0 lead oublié", percent: 95 },
      { icon: "🏷️", title: "Génération d'annonces", result: "10 min vs 2h", percent: 88 },
      { icon: "📈", title: "Dashboard pipeline", result: "Vision temps réel", percent: 100 },
    ],
  },
  {
    name: "E-commerce",
    icon: "🛒",
    automations: [
      { icon: "📦", title: "Suivi commandes automatisé", result: "-2h/jour", percent: 90 },
      { icon: "✍️", title: "Fiches produits par IA", result: "x5 plus rapide", percent: 95 },
      { icon: "💬", title: "SAV chatbot intelligent", result: "24/7", percent: 100 },
      { icon: "📊", title: "Reporting ventes auto", result: "Temps réel", percent: 88 },
    ],
  },
  {
    name: "Santé",
    icon: "🏥",
    automations: [
      { icon: "📅", title: "Prise de RDV automatisée", result: "-1h30/jour", percent: 92 },
      { icon: "🔔", title: "Rappels patients auto", result: "-35% no-show", percent: 85 },
      { icon: "📄", title: "Comptes-rendus par IA", result: "10 min vs 1h", percent: 90 },
      { icon: "💬", title: "Chatbot pré-consultation", result: "24/7", percent: 100 },
    ],
  },
  {
    name: "Restauration",
    icon: "🍽️",
    automations: [
      { icon: "📱", title: "Commandes en ligne auto", result: "24/7", percent: 100 },
      { icon: "⭐", title: "Gestion avis clients", result: "Réponse en 1 min", percent: 95 },
      { icon: "📦", title: "Gestion stocks automatisée", result: "0 rupture", percent: 88 },
      { icon: "📊", title: "Dashboard CA temps réel", result: "Vision claire", percent: 92 },
    ],
  },
  {
    name: "Cabinet Comptable",
    icon: "📊",
    automations: [
      { icon: "🧾", title: "Saisie comptable par IA", result: "-2h/jour", percent: 95 },
      { icon: "📧", title: "Relances impayés auto", result: "0 oubli", percent: 100 },
      { icon: "📄", title: "Génération bilans", result: "3x plus rapide", percent: 88 },
      { icon: "💬", title: "Chatbot client 24/7", result: "Réponse instant.", percent: 92 },
    ],
  },
  {
    name: "Agence Marketing",
    icon: "📱",
    automations: [
      { icon: "✍️", title: "Contenus réseaux sociaux", result: "x3 plus rapide", percent: 95 },
      { icon: "📊", title: "Reporting client auto", result: "-1h/client", percent: 90 },
      { icon: "🎯", title: "Prospection automatisée", result: "+15% leads", percent: 85 },
      { icon: "🤖", title: "Chatbot qualification", result: "24/7", percent: 100 },
    ],
  },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-[#9CA3AF]"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function SectorChat() {
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [phase, setPhase] = useState<Phase>("question");

  const handleSelect = (sector: Sector) => {
    setSelectedSector(sector);
    setPhase("typing");
  };

  useEffect(() => {
    if (phase === "typing") {
      const timer = setTimeout(() => setPhase("results"), 1400);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleReset = () => {
    setSelectedSector(null);
    setPhase("question");
  };

  return (
    <section className="py-16 lg:py-20 bg-[#0A0A0A] overflow-hidden">
      <div className="mx-auto max-w-2xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-sm font-semibold text-[#007AFF] uppercase tracking-wider">
            Projection instantanée
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Voyez ce qu&apos;on automatise <span className="text-[#007AFF]">chez vous</span>
          </h2>
        </motion.div>

        {/* Chat container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative bg-white rounded-3xl shadow-[0_0_40px_0px_rgba(255,255,255,0.15),0_0_80px_0px_rgba(255,255,255,0.06)] border border-white/15 overflow-hidden"
        >
          {/* Chat header bar */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-[#FAFAFA]">
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
              <Image src="/images/logobleu.png" alt="OpexIA" width={36} height={36} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111]">OpexIA</p>
              <p className="text-[11px] text-[#34D399] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] inline-block" />
                En ligne
              </p>
            </div>
          </div>

          {/* Chat body */}
          <div className="px-5 py-6 min-h-[320px] flex flex-col">
            {/* Bot question bubble */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-start gap-2 mb-5"
            >
              <div className="max-w-[85%] bg-[#F0F0F0] rounded-2xl rounded-bl-md px-4 py-3">
                <p className="text-[15px] text-[#111] leading-relaxed">
                  Dans quel secteur êtes-vous ? 🎯
                </p>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {/* Phase: Question — show sector pills */}
              {phase === "question" && (
                <motion.div
                  key="pills"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  className="flex flex-col gap-3 mb-4"
                >
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs text-[#9CA3AF] flex items-center gap-1.5"
                  >
                    <svg className="h-3.5 w-3.5 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    Cliquez sur votre secteur pour voir les résultats
                  </motion.p>
                  <div className="flex flex-wrap gap-2">
                    {sectors.map((sector, i) => (
                      <motion.button
                        key={sector.name}
                        initial={{ opacity: 0, scale: 0.3, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                          delay: 0.4 + i * 0.12,
                          type: "spring",
                          stiffness: 260,
                          damping: 15
                        }}
                        onClick={() => handleSelect(sector)}
                        whileHover={{ scale: 1.06, y: -3 }}
                        whileTap={{ scale: 0.94 }}
                        className={`inline-flex items-center gap-2 rounded-full border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#374151] hover:border-[#007AFF] hover:text-[#007AFF] hover:bg-blue-50/50 hover:shadow-md hover:shadow-blue-100/50 transition-all cursor-pointer ${i === 0 ? "animate-[pulse-border_2s_ease-in-out_infinite_1.5s]" : ""}`}
                      >
                        <span className="text-base">{sector.icon}</span>
                        {sector.name}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Phase: Typing or Results — show user bubble + response */}
              {(phase === "typing" || phase === "results") && selectedSector && (
                <motion.div
                  key="response"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-4"
                >
                  {/* User bubble (right) */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-end"
                  >
                    <div className="bg-[#007AFF] rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]">
                      <p className="text-[15px] text-white font-medium">
                        {selectedSector.icon} {selectedSector.name}
                      </p>
                    </div>
                  </motion.div>

                  {/* Typing or bot reply */}
                  <div className="flex items-start gap-2">
                    <div>
                      <AnimatePresence mode="wait">
                        {phase === "typing" && (
                          <motion.div
                            key="typing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-[#F0F0F0] rounded-2xl rounded-bl-md"
                          >
                            <TypingIndicator />
                          </motion.div>
                        )}

                        {phase === "results" && (
                          <motion.div
                            key="results"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col gap-3"
                          >
                            {/* Bot text reply */}
                            <div className="bg-[#F0F0F0] rounded-2xl rounded-bl-md px-4 py-3">
                              <p className="text-[15px] text-[#111] leading-relaxed">
                                Voici ce qu&apos;on peut automatiser chez vous 👇
                              </p>
                            </div>

                            {/* Automation cards */}
                            <div className="flex flex-col gap-2.5 mt-1">
                              {selectedSector.automations.map((auto, i) => (
                                <motion.div
                                  key={auto.title}
                                  initial={{ opacity: 0, y: 15 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.15, duration: 0.4 }}
                                  className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                                >
                                  <div className="flex items-start justify-between mb-2.5">
                                    <div className="flex items-center gap-2.5">
                                      <span className="text-xl">{auto.icon}</span>
                                      <p className="text-sm font-semibold text-[#111]">{auto.title}</p>
                                    </div>
                                    <span className="text-xs font-bold text-[#007AFF] bg-blue-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                                      {auto.result}
                                    </span>
                                  </div>
                                  {/* Progress bar */}
                                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                      className="h-full bg-[#007AFF] rounded-full"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${auto.percent}%` }}
                                      transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: "easeOut" }}
                                    />
                                  </div>
                                </motion.div>
                              ))}
                            </div>

                            {/* CTA + Reset */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.8 }}
                              className="flex flex-col sm:flex-row items-center gap-3 mt-3"
                            >
                              <a
                                href="https://calendly.com/opexiapro/audit-ia-gratuit"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#007AFF] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0055D4] transition-all hover:shadow-lg hover:shadow-blue-200"
                              >
                                Planifier mon audit offert
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              </a>
                              <button
                                onClick={handleReset}
                                className="text-sm text-[#6B7280] hover:text-[#111] transition-colors cursor-pointer"
                              >
                                ← Changer de secteur
                              </button>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

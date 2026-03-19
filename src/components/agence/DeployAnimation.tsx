"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

/*
  3 phases matching the 3 bullet points:
  1. Déploiement clé en main → install progress with checklist items
  2. Formation pratique → training screen with team members learning
  3. Support illimité → chat support interface, always available
*/

const installSteps = [
  { label: "Configuration CRM", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  { label: "Connexion emails", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { label: "Import données", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
  { label: "Automatisations IA", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { label: "Tests & validation", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
];

const trainingItems = [
  "Prise en main dashboard",
  "Gestion des automatisations",
  "Suivi des performances",
];

export default function DeployAnimation() {
  const [step, setStep] = useState(0); // 0=idle, 1=deploy, 2=formation, 3=support
  const [installProgress, setInstallProgress] = useState(0);
  const [trainingProgress, setTrainingProgress] = useState(0);

  useEffect(() => {
    const sequence = async () => {
      setStep(0);
      setInstallProgress(0);
      setTrainingProgress(0);
      await new Promise((r) => setTimeout(r, 500));

      // Phase 1: Deploy
      setStep(1);
      for (let i = 1; i <= installSteps.length; i++) {
        await new Promise((r) => setTimeout(r, 600));
        setInstallProgress(i);
      }
      await new Promise((r) => setTimeout(r, 800));

      // Phase 2: Training
      setStep(2);
      for (let i = 1; i <= trainingItems.length; i++) {
        await new Promise((r) => setTimeout(r, 900));
        setTrainingProgress(i);
      }
      await new Promise((r) => setTimeout(r, 800));

      // Phase 3: Support
      setStep(3);
      await new Promise((r) => setTimeout(r, 4500));
    };
    sequence();
    const interval = setInterval(sequence, 13000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden" style={{ minHeight: 380 }}>
      <div className="p-5 h-[380px] flex flex-col">

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-5">
          {["Déploiement", "Formation", "Support"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <motion.div
                animate={{
                  backgroundColor: step >= i + 1 ? "#007AFF" : "#E5E7EB",
                  scale: step === i + 1 ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="h-6 w-6 rounded-full flex items-center justify-center"
              >
                {step > i + 1 ? (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={`text-[10px] font-bold ${step >= i + 1 ? "text-white" : "text-gray-400"}`}>
                    {i + 1}
                  </span>
                )}
              </motion.div>
              <span className={`text-[10px] font-semibold ${step === i + 1 ? "text-[#111]" : "text-[#9CA3AF]"}`}>
                {label}
              </span>
              {i < 2 && <div className="w-4 h-px bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Déploiement clé en main ── */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="deploy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">
                Installation en cours
              </p>

              {/* Global progress bar */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-[9px] text-[#6B7280] font-medium">Progression</span>
                  <span className="text-[9px] font-bold text-[#007AFF]">{Math.round((installProgress / installSteps.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${(installProgress / installSteps.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                    className="h-full bg-gradient-to-r from-[#007AFF] to-[#5AC8FA] rounded-full"
                  />
                </div>
              </div>

              {/* Install checklist */}
              <div className="space-y-2 flex-1">
                {installSteps.map((item, i) => {
                  const isDone = i < installProgress;
                  const isCurrent = i === installProgress - 1;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: isDone || i <= installProgress ? 1 : 0.3, x: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.3 }}
                      className={`flex items-center gap-3 rounded-xl p-2.5 border ${isDone ? "bg-emerald-50 border-emerald-100" : i === installProgress ? "bg-blue-50 border-blue-100" : "bg-gray-50 border-gray-100"}`}
                    >
                      {/* Status icon */}
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isDone ? "bg-emerald-100" : "bg-white"}`}>
                        {isDone ? (
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                            className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </motion.svg>
                        ) : i === installProgress ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          >
                            <svg className="h-4 w-4 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </motion.div>
                        ) : (
                          <svg className="h-3.5 w-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                          </svg>
                        )}
                      </div>

                      <span className={`text-[11px] font-semibold ${isDone ? "text-emerald-700" : "text-[#374151]"}`}>
                        {item.label}
                      </span>

                      {isDone && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="ml-auto text-[8px] font-bold text-emerald-500"
                        >
                          Fait
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Formation pratique ── */}
          {step === 2 && (
            <motion.div
              key="training"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">
                Formation de votre équipe
              </p>

              {/* Training screen mockup */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-3">
                {/* Screen header */}
                <div className="h-6 bg-gray-50 border-b border-gray-100 flex items-center px-3 gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-300" />
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-300" />
                  <div className="h-1.5 w-1.5 rounded-full bg-green-300" />
                  <span className="ml-2 text-[7px] text-gray-400 font-medium">Formation OpexIA</span>
                </div>

                {/* Screen content */}
                <div className="p-3 flex gap-3">
                  {/* Sidebar mini */}
                  <div className="w-16 space-y-1.5 flex-shrink-0">
                    {["Module 1", "Module 2", "Module 3"].map((m, i) => (
                      <motion.div
                        key={m}
                        animate={{
                          backgroundColor: i < trainingProgress ? "#EFF6FF" : "#F9FAFB",
                          borderColor: i < trainingProgress ? "#BFDBFE" : "#F3F4F6",
                        }}
                        className="rounded px-1.5 py-1 border text-center"
                      >
                        <span className={`text-[7px] font-semibold ${i < trainingProgress ? "text-[#007AFF]" : "text-gray-400"}`}>{m}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Main content area */}
                  <div className="flex-1">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={trainingProgress}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                      >
                        {trainingProgress > 0 && (
                          <div>
                            <div className="h-12 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center mb-2">
                              <svg className="h-5 w-5 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <p className="text-[8px] font-semibold text-[#374151]">
                              {trainingItems[trainingProgress - 1]}
                            </p>
                            {/* Mini progress */}
                            <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 0.8 }}
                                className="h-full bg-[#007AFF] rounded-full"
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Team members progress */}
              <div className="space-y-2 flex-1">
                {["Alice", "Thomas", "Sarah"].map((name, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-center gap-3"
                  >
                    {/* Avatar */}
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-white">{name[0]}</span>
                    </div>
                    <span className="text-[11px] font-medium text-[#374151] w-14">{name}</span>
                    {/* Progress */}
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((trainingProgress / trainingItems.length) * 100, 100)}%` }}
                        transition={{ delay: i * 0.2, duration: 0.6 }}
                        className="h-full bg-gradient-to-r from-[#007AFF] to-[#5AC8FA] rounded-full"
                      />
                    </div>
                    {trainingProgress >= trainingItems.length && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                        className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0"
                      >
                        <svg className="h-3 w-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Support illimité ── */}
          {step === 3 && (
            <motion.div
              key="support"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">
                Support post-lancement
              </p>

              {/* Chat interface mockup */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex-1 flex flex-col">
                {/* Chat header */}
                <div className="px-3 py-2 bg-white border-b border-gray-100 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-[#007AFF] flex items-center justify-center">
                    <span className="text-[7px] text-white font-black">O</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#111]">Support OpexIA</p>
                    <div className="flex items-center gap-1">
                      <motion.div
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                      />
                      <span className="text-[8px] text-emerald-500 font-medium">En ligne 24/7</span>
                    </div>
                  </div>
                  <div className="ml-auto px-2 py-0.5 rounded-full bg-[#007AFF]/10">
                    <span className="text-[7px] font-bold text-[#007AFF]">Illimité</span>
                  </div>
                </div>

                {/* Chat messages */}
                <div className="p-3 space-y-2.5 flex-1">
                  {/* User message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-end"
                  >
                    <div className="bg-[#007AFF] rounded-2xl rounded-br-sm px-3 py-2 max-w-[75%]">
                      <p className="text-[10px] text-white">Comment modifier une automatisation ?</p>
                    </div>
                  </motion.div>

                  {/* Typing indicator then response */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2 max-w-[80%] shadow-sm">
                      <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ delay: 1.2, duration: 0.2 }}
                        className="flex gap-1 absolute"
                      >
                        {[0, 1, 2].map((d) => (
                          <motion.div
                            key={d}
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: d * 0.15 }}
                            className="h-1.5 w-1.5 rounded-full bg-gray-300"
                          />
                        ))}
                      </motion.div>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.2 }}
                        className="text-[10px] text-[#374151]"
                      >
                        Allez dans Automatisations &gt; cliquez sur &quot;Modifier&quot;. Je vous envoie un tuto vidéo !
                      </motion.p>
                    </div>
                  </motion.div>

                  {/* Resolution */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3 }}
                    className="flex justify-end"
                  >
                    <div className="bg-[#007AFF] rounded-2xl rounded-br-sm px-3 py-2">
                      <p className="text-[10px] text-white">Merci, c&apos;est fait !</p>
                    </div>
                  </motion.div>

                  {/* Resolved badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 3.5 }}
                    className="flex justify-center"
                  >
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      <svg className="h-3 w-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[9px] font-bold text-emerald-600">Résolu en 2 min</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

/*
  3 phases matching the 3 bullet points:
  1. Roadmap priorisée → tasks slide into ranked order
  2. ROI détaillé → ROI values appear next to each
  3. Planning 14 jours → mini gantt/calendar shows deployment
*/

const tasks = [
  { name: "Emails clients", roi: "+18h", days: [1, 4], color: "#007AFF", bg: "#EFF6FF", border: "#BFDBFE" },
  { name: "Saisie factures", roi: "+14h", days: [3, 7], color: "#38BDF8", bg: "#F0F9FF", border: "#BAE6FD" },
  { name: "Relances", roi: "+8h", days: [6, 10], color: "#93C5FD", bg: "#EFF6FF", border: "#DBEAFE" },
  { name: "Reporting", roi: "+6h", days: [9, 14], color: "#A5B4FC", bg: "#EEF2FF", border: "#C7D2FE" },
];

export default function PlanAnimation() {
  const [step, setStep] = useState(0); // 0=idle, 1=roadmap, 2=roi, 3=planning

  useEffect(() => {
    const sequence = async () => {
      setStep(0);
      await new Promise((r) => setTimeout(r, 600));
      setStep(1);
      await new Promise((r) => setTimeout(r, 2500));
      setStep(2);
      await new Promise((r) => setTimeout(r, 2500));
      setStep(3);
      await new Promise((r) => setTimeout(r, 4000));
    };
    sequence();
    const interval = setInterval(sequence, 11000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden" style={{ minHeight: 380 }}>
      <div className="p-5 h-[380px] flex flex-col">

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-5">
          {["Roadmap", "ROI", "Planning"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <motion.div
                animate={{
                  backgroundColor: step >= i + 1 ? "#007AFF" : "#E5E7EB",
                  scale: step === i + 1 ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="h-6 w-6 rounded-full flex items-center justify-center"
              >
                <span className={`text-[10px] font-bold ${step >= i + 1 ? "text-white" : "text-gray-400"}`}>
                  {i + 1}
                </span>
              </motion.div>
              <span className={`text-[10px] font-semibold ${step === i + 1 ? "text-[#111]" : "text-[#9CA3AF]"}`}>
                {label}
              </span>
              {i < 2 && <div className="w-4 h-px bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Roadmap priorisée par impact ── */}
        {step >= 1 && step <= 2 && (
          <div className="flex-1 flex flex-col">
            {/* Section title */}
            <AnimatePresence mode="wait">
              <motion.p
                key={step === 1 ? "roadmap" : "roi"}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3"
              >
                {step === 1 ? "Priorisation par impact" : "ROI par automatisation"}
              </motion.p>
            </AnimatePresence>

            {/* Task rows */}
            <div className="space-y-2.5 flex-1">
              {tasks.map((task, i) => (
                <motion.div
                  key={task.name}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-3"
                >
                  {/* Rank badge */}
                  <motion.div
                    animate={{ scale: step === 1 ? [1, 1.15, 1] : 1 }}
                    transition={{ delay: 0.8 + i * 0.2, duration: 0.4 }}
                    className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: task.bg, border: `1.5px solid ${task.border}` }}
                  >
                    <span className="text-[11px] font-black" style={{ color: task.color }}>
                      #{i + 1}
                    </span>
                  </motion.div>

                  {/* Task bar */}
                  <div className="flex-1 relative">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-[#111]">{task.name}</span>
                      {/* Impact bar */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${100 - i * 18}%` }}
                        transition={{ delay: 0.3 + i * 0.2, duration: 0.6 }}
                        className="h-2 rounded-full flex-1"
                        style={{ backgroundColor: task.bg, maxWidth: 80 }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ delay: 0.5 + i * 0.2, duration: 0.5 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: task.color }}
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* ROI value - appears in step 2 */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={step >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                    transition={{ delay: i * 0.15, type: "spring", stiffness: 300 }}
                    className="flex-shrink-0 rounded-lg px-2.5 py-1 border"
                    style={{ backgroundColor: task.bg, borderColor: task.border }}
                  >
                    <p className="text-[9px] text-[#9CA3AF] font-medium">ROI</p>
                    <p className="text-sm font-black text-[#007AFF]">{task.roi}</p>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Total ROI - step 2 */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between"
              >
                <span className="text-[11px] font-semibold text-[#6B7280]">Gain total estimé</span>
                <span className="text-lg font-black text-[#007AFF]">~46h/mois</span>
              </motion.div>
            )}
          </div>
        )}

        {/* ── STEP 3: Planning de déploiement 14 jours ── */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col"
          >
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">
              Planning de déploiement
            </p>

            {/* Day headers */}
            <div className="flex gap-[2px] mb-2 pl-[100px]">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="flex-1 text-center">
                  <span className="text-[7px] text-[#9CA3AF] font-medium">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* Gantt rows */}
            <div className="space-y-3 flex-1">
              {tasks.map((task, i) => {
                const startPct = ((task.days[0] - 1) / 14) * 100;
                const widthPct = ((task.days[1] - task.days[0] + 1) / 14) * 100;
                return (
                  <motion.div
                    key={task.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    {/* Label */}
                    <span className="text-[10px] font-semibold text-[#374151] w-[92px] flex-shrink-0 truncate">
                      {task.name}
                    </span>

                    {/* Gantt bar track */}
                    <div className="flex-1 h-7 bg-gray-50 rounded-md relative overflow-hidden border border-gray-100">
                      {/* Day grid lines */}
                      {Array.from({ length: 13 }).map((_, j) => (
                        <div
                          key={j}
                          className="absolute top-0 bottom-0 w-px bg-gray-100"
                          style={{ left: `${((j + 1) / 14) * 100}%` }}
                        />
                      ))}
                      {/* Task bar */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ delay: 0.4 + i * 0.2, duration: 0.8, ease: "easeOut" }}
                        className="absolute top-1 bottom-1 rounded-md flex items-center justify-center"
                        style={{
                          left: `${startPct}%`,
                          backgroundColor: task.color,
                        }}
                      >
                        <span className="text-[7px] font-bold text-white whitespace-nowrap px-1">
                          J{task.days[0]}–J{task.days[1]}
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="mt-auto pt-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="h-3 w-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-[#111]">Opérationnel en 14 jours</span>
              </div>
              <span className="text-[11px] font-black text-[#007AFF]">~32 000€/an</span>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

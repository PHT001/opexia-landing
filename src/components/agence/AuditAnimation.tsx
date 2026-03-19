"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

/*
  Visual story: A clock with hands spinning fast (time being wasted),
  task icons pile up around it, then everything calms down and shows the savings.
  No text needed to understand — pure visual.
*/

const taskIcons = ["📧", "📄", "💬", "📊", "🔔", "📋"];

export default function AuditAnimation() {
  const [phase, setPhase] = useState<"idle" | "spinning" | "result">("idle");
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const sequence = async () => {
      setPhase("idle");
      setRotation(0);
      await new Promise((r) => setTimeout(r, 500));

      setPhase("spinning");
      // Simulate clock spinning fast
      const spinDuration = 3000;
      const startTime = Date.now();
      const tick = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed < spinDuration) {
          setRotation((elapsed / spinDuration) * 1800); // 5 full rotations
          requestAnimationFrame(tick);
        } else {
          setRotation(1800);
        }
      };
      requestAnimationFrame(tick);

      await new Promise((r) => setTimeout(r, spinDuration + 500));
      setPhase("result");
      await new Promise((r) => setTimeout(r, 4000));
    };
    sequence();
    const interval = setInterval(sequence, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden" style={{ minHeight: 380 }}>
      <div className="relative w-full h-[380px] flex items-center justify-center">

        {/* Floating task icons — appear during spinning */}
        {phase === "spinning" && taskIcons.map((icon, i) => {
          const angle = (i / taskIcons.length) * 360;
          const radius = 130;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{ opacity: [0, 0.8, 0.6], scale: [0, 1.2, 1], x, y }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="absolute text-2xl"
              style={{ filter: "grayscale(0.3)" }}
            >
              <motion.span
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 + i * 0.2, ease: "easeInOut" }}
                className="block"
              >
                {icon}
              </motion.span>
            </motion.div>
          );
        })}

        {/* Central clock */}
        {phase !== "result" && (
          <div className="relative z-10">
            <svg width="120" height="120" viewBox="0 0 120 120">
              {/* Clock face */}
              <circle cx="60" cy="60" r="55" fill="white" stroke="#E5E7EB" strokeWidth="2" />
              {/* Hour marks */}
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i / 12) * 360 - 90;
                const x1 = 60 + Math.cos((a * Math.PI) / 180) * 45;
                const y1 = 60 + Math.sin((a * Math.PI) / 180) * 45;
                const x2 = 60 + Math.cos((a * Math.PI) / 180) * 50;
                const y2 = 60 + Math.sin((a * Math.PI) / 180) * 50;
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />;
              })}
              {/* Minute hand */}
              <line
                x1="60" y1="60" x2="60" y2="20"
                stroke={phase === "spinning" ? "#EF4444" : "#9CA3AF"}
                strokeWidth="2.5"
                strokeLinecap="round"
                transform={`rotate(${rotation} 60 60)`}
              />
              {/* Hour hand */}
              <line
                x1="60" y1="60" x2="60" y2="30"
                stroke={phase === "spinning" ? "#EF4444" : "#6B7280"}
                strokeWidth="3"
                strokeLinecap="round"
                transform={`rotate(${rotation / 12} 60 60)`}
              />
              {/* Center dot */}
              <circle cx="60" cy="60" r="4" fill={phase === "spinning" ? "#EF4444" : "#9CA3AF"} />
            </svg>

            {/* Red pulse when spinning */}
            {phase === "spinning" && (
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute inset-0 rounded-full border-2 border-red-400"
              />
            )}
          </div>
        )}

        {/* Result phase */}
        {phase === "result" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex flex-col items-center gap-4 w-full max-w-[280px]"
          >
            {/* Big check */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="h-16 w-16 rounded-full bg-[#007AFF]/10 flex items-center justify-center"
            >
              <svg className="h-8 w-8 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.div>

            <p className="text-sm font-bold text-[#111]">Audit terminé</p>

            {/* Result card */}
            <div className="w-full rounded-xl border border-gray-100 bg-gray-50 p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#9CA3AF] font-medium">Temps perdu / jour</p>
                <p className="text-xl font-black text-[#111]">~5h</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#9CA3AF] font-medium">Récupérable</p>
                <p className="text-xl font-black text-[#007AFF]">~4h30</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

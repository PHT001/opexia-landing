"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PROOF_MESSAGES = [
  { sector: "Cabinet comptable", city: "Lyon", action: "a r\u00e9serv\u00e9 son audit gratuit", time: "il y a 3 min" },
  { sector: "Agence immobili\u00e8re", city: "Paris", action: "a automatis\u00e9 ses relances", time: "il y a 12 min" },
  { sector: "Restaurant", city: "Bordeaux", action: "a r\u00e9serv\u00e9 son audit gratuit", time: "il y a 18 min" },
  { sector: "E-commerce", city: "Marseille", action: "a lanc\u00e9 son chatbot IA", time: "il y a 25 min" },
  { sector: "Coach sportif", city: "Toulouse", action: "a r\u00e9serv\u00e9 son audit gratuit", time: "il y a 34 min" },
  { sector: "Kin\u00e9sith\u00e9rapeute", city: "Nantes", action: "a automatis\u00e9 ses RDV", time: "il y a 41 min" },
  { sector: "Artisan plombier", city: "Lille", action: "a r\u00e9serv\u00e9 son audit gratuit", time: "il y a 52 min" },
  { sector: "Boutique en ligne", city: "Strasbourg", action: "a automatis\u00e9 son support", time: "il y a 1h" },
];

export default function SocialProofToast() {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const showToast = useCallback(() => {
    setVisible(true);
    setTimeout(() => setVisible(false), 4000);
  }, []);

  useEffect(() => {
    // First toast after 15s
    const initial = setTimeout(() => {
      showToast();
    }, 15000);

    return () => clearTimeout(initial);
  }, [showToast]);

  useEffect(() => {
    if (!visible) {
      // Next toast 20-40s after previous one hides
      const delay = 20000 + Math.random() * 20000;
      const next = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % PROOF_MESSAGES.length);
        showToast();
      }, delay);
      return () => clearTimeout(next);
    }
  }, [visible, showToast]);

  const msg = PROOF_MESSAGES[currentIndex];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -80, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -80 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-6 z-40 max-w-[320px] hidden md:block"
        >
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-900/10 border border-gray-100 px-4 py-3 flex items-start gap-3">
            {/* Green pulse dot */}
            <div className="mt-1 flex-shrink-0">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 leading-tight">
                {msg.sector} <span className="text-gray-400 font-normal">{"\u00e0 " + msg.city}</span>
              </p>
              <p className="text-[13px] text-gray-500 mt-0.5">
                {msg.action}
              </p>
              <p className="text-[11px] text-gray-300 mt-1">{msg.time}</p>
            </div>

            {/* Close */}
            <button
              onClick={() => setVisible(false)}
              className="text-gray-300 hover:text-gray-500 transition-colors mt-0.5 flex-shrink-0 cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

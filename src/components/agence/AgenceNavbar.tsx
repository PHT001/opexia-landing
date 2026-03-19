"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Résultats", href: "#resultats" },
  { label: "Processus", href: "#process" },
  { label: "FAQ", href: "#faq" },
];

export default function AgenceNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-2 md:pt-5"
    >
      {/* Full-width backdrop to hide content scrolling behind navbar */}
      <div
        className="absolute inset-x-0 -top-1 bottom-0 pointer-events-none -z-10"
        style={{
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
        }}
      />
      <div
        className="relative w-full max-w-3xl rounded-full border border-white/[0.08] px-5 py-2.5 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(10, 10, 10, 0.95)" : "rgba(10, 10, 10, 0.6)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: scrolled
            ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center">
            <span className="text-xl font-extrabold text-white tracking-tight">
              Opex<span className="text-[#5AC8FA]">IA</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13px] font-medium text-white/50 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <a
            href="https://calendly.com/opexiapro/audit-ia-gratuit"
            className="hidden md:inline-flex items-center justify-center rounded-full px-5 py-2 text-[13px] font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #007AFF 0%, #0055D4 100%)",
              boxShadow: "0 2px 12px rgba(0,122,255,0.4)",
            }}
          >
            Audit Gratuit
          </a>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Menu"
          >
            <span className={`block h-0.5 w-5 bg-white transition-transform ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 w-5 bg-white transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-white transition-transform ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-4 right-4 mt-2 rounded-2xl border border-white/[0.08] p-5"
            style={{
              background: "rgba(10, 10, 10, 0.9)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium text-white/60 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="https://calendly.com/opexiapro/audit-ia-gratuit"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white mt-2"
                style={{
                  background: "linear-gradient(135deg, #007AFF 0%, #0055D4 100%)",
                  boxShadow: "0 2px 12px rgba(0,122,255,0.4)",
                }}
              >
                Réserver un audit gratuit
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

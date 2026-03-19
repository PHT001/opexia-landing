"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import LazyVideo from "@/components/ui/LazyVideo";

const rotatingWords = ["automatise", "acc\u00e9l\u00e8re", "optimise"];

function TypewriterWord({ word }: { word: string }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="inline-flex text-[#007AFF]"
    >
      {word.split("").map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.04, delay: i * 0.05 }}
        >
          {char}
        </motion.span>
      ))}
      <motion.span
        className="inline-block w-[3px] h-[0.9em] bg-[#007AFF] ml-0.5 align-middle"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
      />
    </motion.span>
  );
}

function AnimatedCounter({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString("fr-FR")}{suffix}
    </span>
  );
}

export default function AgenceHero() {
  const [wordIndex, setWordIndex] = useState(0);

  const nextWord = useCallback(() => {
    setWordIndex((prev) => (prev + 1) % rotatingWords.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextWord, 3000);
    return () => clearInterval(interval);
  }, [nextWord]);

  return (
    <section className="relative flex items-center pt-28 pb-16 overflow-hidden bg-[#FAFAFA]">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 w-full">
        <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 rounded-md bg-[#0A0A0A] px-3 py-1.5 text-xs font-semibold text-white mb-8 tracking-wider uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-[#007AFF] animate-pulse" />
                Agence d&apos;automatisation IA
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-[28px] sm:text-5xl lg:text-[52px] font-bold leading-[1.15] tracking-tight mb-6"
            >
              On{" "}
              <span className="inline-block">
                <AnimatePresence mode="wait">
                  <TypewriterWord key={wordIndex} word={rotatingWords[wordIndex]} />
                </AnimatePresence>
              </span>
              <br />
              votre entreprise avec l&apos;IA.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-[#6B7280] max-w-xl mx-auto mb-8 leading-relaxed"
            >
              R&eacute;cup&eacute;rez <strong className="font-semibold text-[#111]">10 &agrave; 20h/mois</strong> par &eacute;quipe sans changer vos outils. D&eacute;ploy&eacute; en <strong className="font-semibold text-[#111]">14 jours</strong>, cl&eacute; en main.
            </motion.p>

            {/* Social proof badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex items-center justify-center gap-2.5 mb-8"
            >
              <Image src="/images/customers.webp" alt="Customers" width={100} height={28} className="h-7 w-auto" />
              <span className="text-sm text-[#6B7280]">
                <strong className="font-semibold text-[#111]">4.9</strong>/5 par <strong className="font-semibold text-[#111]">+50</strong> clients
              </span>
              <Image src="/images/blue-badge.svg" alt="Verified" width={18} height={18} className="h-[18px] w-[18px]" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
            >
              <a
                href="https://calendly.com/opexiapro/audit-ia-gratuit"
                className="group inline-flex items-center justify-center rounded-full bg-[#007AFF] px-8 py-4 text-base font-semibold text-white transition-all hover:bg-[#0055D4] hover:shadow-xl hover:shadow-blue-200"
              >
                Obtenir mon audit offert
                <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a href="#resultats" className="text-[#6B7280] text-sm font-medium hover:text-[#111] transition-colors flex items-center gap-1.5 py-4">
                Voir les r&eacute;sultats &darr;
              </a>
            </motion.div>

            {/* Stat bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-8 border-t border-gray-200 pt-6"
            >
              <div>
                <p className="text-2xl font-black text-[#111]"><AnimatedCounter target={50} suffix="+" /></p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">entreprises</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#111]"><AnimatedCounter target={320} suffix="h" /></p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">économisées/mois</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#111]"><AnimatedCounter target={14} suffix="j" /></p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">pour d&eacute;ployer</p>
              </div>
            </motion.div>
        </div>
      </div>
    </section>
  );
}

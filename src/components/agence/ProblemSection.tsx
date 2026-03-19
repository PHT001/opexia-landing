"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import LazyVideo from "@/components/ui/LazyVideo";

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function ProblemSection() {
  return (
    <section className="relative bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <span className="inline-block text-sm font-semibold text-[#007AFF] uppercase tracking-wider mb-3">
            Le constat
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            Le monde change.{" "}
            <span className="text-[#9CA3AF]">Et vous ?</span>
          </h2>
        </div>

        {/* Horloge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-10 sm:mb-14"
        >
          <div className="relative w-24 sm:w-36 overflow-hidden" style={{ maskImage: 'radial-gradient(ellipse 65% 65% at center, black 40%, transparent 95%)', WebkitMaskImage: 'radial-gradient(ellipse 65% 65% at center, black 40%, transparent 95%)' }}>
            <LazyVideo src="/images/horloge.mp4" className="w-full h-auto" />
          </div>
        </motion.div>

        {/* Problem / Solution cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PROBLÈME — red glow */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative rounded-3xl bg-white border border-red-100 p-8 lg:p-10 overflow-hidden hover:border-red-200 transition-all duration-500"
          >
            {/* Red glow effects */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-400/20 rounded-full blur-3xl pointer-events-none group-hover:bg-red-400/30 transition-all duration-500" />
            <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-red-300/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-50/80 via-transparent to-red-50/40 pointer-events-none" />

            <div className="relative">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-100 px-4 py-1.5 mb-6">
                <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-red-500 text-xs font-bold uppercase tracking-wider">Probl&egrave;me</span>
              </div>

              {/* Big stat */}
              <p className="text-6xl lg:text-8xl font-black bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent leading-none mb-1">
                <AnimatedCounter target={65} suffix="%" />
              </p>
              <p className="text-[#111] text-lg sm:text-xl font-bold mb-3">
                des entreprises utilisent d&eacute;j&agrave; l&apos;IA au quotidien
              </p>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-5">
                Pendant que vous traitez vos mails manuellement, vos concurrents automatisent leurs devis, relances et reporting. <strong className="text-[#111]">Chaque mois sans IA = 10 &agrave; 20h perdues</strong> par &eacute;quipe.
              </p>

              {/* Source */}
              <div className="flex items-center gap-2 text-[#9CA3AF] text-xs">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
                McKinsey Global Survey on AI, 2026
              </div>
            </div>
          </motion.div>

          {/* SOLUTION — green glow */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="group relative rounded-3xl bg-white border border-emerald-100 p-8 lg:p-10 overflow-hidden hover:border-emerald-200 transition-all duration-500"
          >
            {/* Green glow effects */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-400/30 transition-all duration-500" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-transparent to-emerald-50/40 pointer-events-none" />

            <div className="relative">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-4 py-1.5 mb-6">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider">Solution</span>
              </div>

              {/* Headline */}
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111] leading-tight mb-4">
                Faites de l&apos;IA votre avantage,{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">pas votre menace.</span>
              </p>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-6">
                En 14 jours, on int&egrave;gre l&apos;IA dans vos op&eacute;rations. Vos &eacute;quipes r&eacute;cup&egrave;rent des heures chaque semaine, sans changer d&apos;outils.
              </p>

              {/* Checklist */}
              <div className="space-y-3.5">
                {[
                  "Devis, relances et reporting automatisés",
                  "Vos équipes formées en 2 jours",
                  "Compatible avec vos outils existants",
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.12 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.4 + i * 0.12 }}
                      className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-200"
                    >
                      <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </motion.div>
                    <span className="text-[#374151] text-sm font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface StatItem {
  value: number;
  suffix: string;
  prefix: string;
  label: string;
  icon: string;
}

const STATS: StatItem[] = [
  { value: 200, suffix: "+", prefix: "", label: "Entreprises accompagn\u00e9es", icon: "\u{1F3E2}" },
  { value: 12000, suffix: "", prefix: "", label: "Heures automatis\u00e9es", icon: "\u23F1\uFE0F" },
  { value: 98, suffix: "%", prefix: "", label: "Clients satisfaits", icon: "\u2B50" },
  { value: 48, suffix: "h", prefix: "<", label: "D\u00e9lai de livraison moyen", icon: "\u26A1" },
];

function AnimatedCounter({ target, prefix, suffix, inView }: { target: number; prefix: string; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    setCount(0);
    let current = 0;
    const steps = 40;
    const increment = target / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 40);
    return () => clearInterval(timer);
  }, [target, inView]);

  return (
    <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#007AFF] tabular-nums">
      {prefix}{count.toLocaleString("fr-FR")}{suffix}
    </span>
  );
}

export default function StatsBar() {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative py-16 lg:py-20 bg-white overflow-hidden">
      {/* Subtle gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F8F9FA] via-white to-white" />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#007AFF]/[0.08] text-2xl mb-3 mx-auto group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className="mb-1">
                <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} inView={inView} />
              </div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

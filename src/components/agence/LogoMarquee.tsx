"use client";

import { motion } from "framer-motion";

const sectors1 = [
  { name: "BTP & Construction", icon: "🏗️" },
  { name: "Immobilier", icon: "🏠" },
  { name: "E-commerce", icon: "🛒" },
  { name: "Santé", icon: "🏥" },
  { name: "Restauration", icon: "🍽️" },
  { name: "Logistique", icon: "📦" },
  { name: "Cabinet Comptable", icon: "📊" },
  { name: "Agence Marketing", icon: "📱" },
];

const sectors2 = [
  { name: "Automobile", icon: "🚗" },
  { name: "Juridique", icon: "⚖️" },
  { name: "Formation", icon: "🎓" },
  { name: "Industrie", icon: "🏭" },
  { name: "Retail", icon: "🏪" },
  { name: "Assurance", icon: "🛡️" },
  { name: "RH & Recrutement", icon: "👥" },
  { name: "Finance", icon: "💼" },
];

function SectorPill({ name, icon }: { name: string; icon: string }) {
  return (
    <div className="flex-shrink-0 inline-flex items-center gap-2.5 rounded-full bg-white border border-gray-100 px-5 py-2.5 mx-2 shadow-sm">
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium text-[#374151] whitespace-nowrap">{name}</span>
    </div>
  );
}

export default function LogoMarquee() {
  const row1 = [...sectors1, ...sectors1, ...sectors1];
  const row2 = [...sectors2, ...sectors2, ...sectors2];

  return (
    <section className="py-12 lg:py-16 bg-[#F8F9FA] overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <p className="text-sm font-semibold text-[#007AFF] uppercase tracking-wider">
          Ils nous font confiance
        </p>
        <p className="mt-2 text-[#6B7280] text-base">
          +15 secteurs d&apos;activit&eacute; accompagn&eacute;s
        </p>
      </motion.div>

      {/* Row 1 → right */}
      <div className="relative mb-4">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#F8F9FA] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#F8F9FA] to-transparent z-10 pointer-events-none" />
        <div className="flex animate-marquee-right">
          {row1.map((s, i) => (
            <SectorPill key={`r1-${i}`} name={s.name} icon={s.icon} />
          ))}
        </div>
      </div>

      {/* Row 2 → left */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#F8F9FA] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#F8F9FA] to-transparent z-10 pointer-events-none" />
        <div className="flex animate-marquee-left">
          {row2.map((s, i) => (
            <SectorPill key={`r2-${i}`} name={s.name} icon={s.icon} />
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const footerLinks = [
  { label: "Services", href: "#services" },
  { label: "Résultats", href: "#resultats" },
  { label: "Processus", href: "#process" },
  { label: "FAQ", href: "#faq" },
  { label: "Formation", href: "/formation" },
];

export default function AgenceFooter() {
  return (
    <footer className="bg-white overflow-hidden">
      {/* Compact CTA */}
      <div className="relative py-12 lg:py-16">
        <div className="relative mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-lg sm:text-xl text-[#6B7280] mb-6">
              <strong className="text-[#111]">1 heure</strong> pour d&eacute;couvrir ce que l&apos;IA peut changer. <strong className="text-[#111]">Gratuit.</strong>
            </p>
            <a
              href="https://calendly.com/opexiapro/audit-ia-gratuit"
              className="inline-flex items-center justify-center rounded-full bg-[#007AFF] px-8 py-4 text-base font-bold text-white transition-all hover:bg-[#0055D4] hover:shadow-xl hover:shadow-blue-500/20"
            >
              Prendre rendez-vous gratuit
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Footer links */}
      <div className="border-t border-gray-200 py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="text-xl font-extrabold tracking-tight text-[#111]">
                Opex<span className="text-[#007AFF]">IA</span>
              </span>
              <span className="text-xs text-[#9CA3AF]">Agence d&apos;automatisation IA</span>
            </div>

            <nav className="flex flex-wrap items-center gap-6">
              {footerLinks.map((link) =>
                link.href.startsWith("/") ? (
                  <Link key={link.label} href={link.href} className="text-sm text-[#6B7280] hover:text-[#111] transition-colors">
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.label} href={link.href} className="text-sm text-[#6B7280] hover:text-[#111] transition-colors">
                    {link.label}
                  </a>
                )
              )}
            </nav>

            <a
              href="https://calendly.com/opexiapro/audit-ia-gratuit"
              className="text-sm font-semibold text-[#007AFF] hover:text-[#0055D4] transition-colors"
            >
              R&eacute;server un audit &rarr;
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-[#9CA3AF]">
              &copy; {new Date().getFullYear()} OpexIA. Tous droits r&eacute;serv&eacute;s.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

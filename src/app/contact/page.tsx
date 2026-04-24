"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AgenceNavbar from "@/components/agence/AgenceNavbar";
import { CAL_BOOKING_URL } from "@/lib/constants";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    // Honeypot anti-bot check
    if (form.website) {
      setStatus("sent");
      return;
    }

    try {
      const { website: _hp, ...formData } = form;
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", message: "", website: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <AgenceNavbar />
      <main id="main-content" className="min-h-screen bg-[#FAFAFA] pt-28 pb-20 px-6">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111] mb-4">
              Nous contacter
            </h1>
            <p className="text-[#6B7280] text-lg">
              R&eacute;servez un appel d&eacute;couverte ou envoyez-nous un message.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 mb-12">
            {/* Cal.com Card */}
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              href={CAL_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-gray-200 bg-white p-6 text-left transition-all hover:border-[#007AFF]/40 hover:shadow-lg hover:shadow-blue-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[#007AFF] flex items-center justify-center text-white">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-[#111]">R&eacute;server un appel</h2>
              </div>
              <p className="text-sm text-[#6B7280] mb-4">
                30 minutes pour identifier vos leviers d&apos;automatisation IA.
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#007AFF] group-hover:gap-2.5 transition-all">
                Ouvrir Cal.com
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </motion.a>

            {/* Email Card */}
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              href="mailto:contact@opexia-agency.com"
              className="group rounded-2xl border border-gray-200 bg-white p-6 text-left transition-all hover:border-[#5AC8FA]/40 hover:shadow-lg hover:shadow-sky-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[#5AC8FA] flex items-center justify-center text-white">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-[#111]">Email</h2>
              </div>
              <p className="text-sm text-[#6B7280] mb-4">
                contact@opexia-agency.com
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5AC8FA] group-hover:gap-2.5 transition-all">
                Envoyer un email
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </motion.a>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8"
          >
            <h2 className="text-xl font-bold text-[#111] mb-6">
              Envoyez-nous un message
            </h2>

            {status === "sent" ? (
              <div className="text-center py-8">
                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-[#111] mb-2">Message envoy&eacute; !</p>
                <p className="text-[#6B7280]">Nous vous r&eacute;pondrons dans les plus brefs d&eacute;lais.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot field — hidden from real users, traps bots */}
                <div className="absolute opacity-0 h-0 w-0 overflow-hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#111] mb-1.5">
                    Pr&eacute;nom
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Votre pr&eacute;nom"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none transition-all focus:border-[#007AFF]/50 focus:ring-2 focus:ring-[#007AFF]/10"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#111] mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="votre@email.com"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none transition-all focus:border-[#007AFF]/50 focus:ring-2 focus:ring-[#007AFF]/10"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#111] mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    placeholder="Comment pouvons-nous vous aider ?"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none transition-all focus:border-[#007AFF]/50 focus:ring-2 focus:ring-[#007AFF]/10 resize-none"
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm text-red-500">
                    Une erreur est survenue. Veuillez r&eacute;essayer ou &eacute;crivez-nous directement &agrave; contact@opexia-agency.com.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full rounded-full bg-[#007AFF] py-3.5 text-base font-semibold text-white transition-all hover:bg-[#0055D4] disabled:opacity-50"
                >
                  {status === "sending" ? "Envoi en cours..." : "Envoyer le message"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}

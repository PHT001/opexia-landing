"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AgenceNavbar from "@/components/agence/AgenceNavbar";

const WHATSAPP_NUMBER = "33756803717";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const openWhatsApp = () => {
    const msg = encodeURIComponent(
      "Bonjour ! Je souhaiterais en savoir plus sur vos services d'automatisation IA."
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  return (
    <>
      <AgenceNavbar />
      <main className="min-h-screen bg-[#FAFAFA] pt-28 pb-20 px-6">
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
              Une question ? Contactez-nous par email ou directement sur WhatsApp.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 mb-12">
            {/* WhatsApp Card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onClick={openWhatsApp}
              className="group rounded-2xl border border-gray-200 bg-white p-6 text-left transition-all hover:border-[#25D366]/40 hover:shadow-lg hover:shadow-green-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.121.553 4.116 1.518 5.855L.057 23.764l6.087-1.421A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82a9.796 9.796 0 01-5.222-1.505l-.375-.222-3.61.843.91-3.502-.253-.392A9.796 9.796 0 012.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-[#111]">WhatsApp</h2>
              </div>
              <p className="text-sm text-[#6B7280] mb-4">
                R&eacute;ponse rapide, &eacute;changez directement avec notre &eacute;quipe.
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#25D366] group-hover:gap-2.5 transition-all">
                Ouvrir WhatsApp
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </motion.button>

            {/* Email Card */}
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              href="mailto:contact@opexia-agency.com"
              className="group rounded-2xl border border-gray-200 bg-white p-6 text-left transition-all hover:border-[#007AFF]/40 hover:shadow-lg hover:shadow-blue-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[#007AFF] flex items-center justify-center text-white">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-[#111]">Email</h2>
              </div>
              <p className="text-sm text-[#6B7280] mb-4">
                contact@opexia-agency.com
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#007AFF] group-hover:gap-2.5 transition-all">
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
                    style={{ fontSize: "16px" }}
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
                    style={{ fontSize: "16px" }}
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
                    style={{ fontSize: "16px" }}
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm text-red-500">
                    Une erreur est survenue. Veuillez r&eacute;essayer ou nous contacter sur WhatsApp.
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

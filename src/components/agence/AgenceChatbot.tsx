"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/* ───────── Types ───────── */
type Step = "menu" | "sector" | "redirect" | "email-done";

interface Message {
  id: number;
  role: "bot" | "user";
  text: string;
  bold?: string;
}

interface Choice {
  label: string;
  value: string;
}

/* ───────── Flow Data ───────── */
const CAL_BOOKING_URL = "https://cal.com/opexia/30min";
const CONTACT_EMAIL = "contact@opexia-agency.com";

const SECTORS: Choice[] = [
  { label: "🏪 Commerce / Retail", value: "Commerce / Retail" },
  { label: "🏗️ BTP / Artisanat", value: "BTP / Artisanat" },
  { label: "💼 Consulting / Services", value: "Consulting / Services" },
  { label: "🏥 Santé / Bien-être", value: "Santé / Bien-être" },
  { label: "🏠 Immobilier", value: "Immobilier" },
  { label: "📚 Formation / Coaching", value: "Formation / Coaching" },
  { label: "🏭 Industrie / Logistique", value: "Industrie / Logistique" },
  { label: "💻 Tech / Digital", value: "Tech / Digital" },
  { label: "🏢 Autre", value: "Autre" },
];

/* ───────── Helpers: open bot from anywhere ───────── */
/** Opens the chatbot in conversation menu mode (not booking — booking CTAs go straight to Cal.com). */
export function openLeadBot() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("openLeadBot"));
  }
}

/* ───────── Render message text with bold support ───────── */
function RenderText({ text, bold }: { text: string; bold?: string }) {
  if (!bold) return <>{text}</>;
  const idx = text.indexOf(bold);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <strong className="font-bold">{bold}</strong>
      {text.slice(idx + bold.length)}
    </>
  );
}

/* ───────── Component ───────── */
export default function AgenceChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("menu");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [started, setStarted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  /* Lock body scroll on mobile when chat is open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    };
  }, [isOpen]);

  /* Auto-scroll */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  /* Bot message with typing simulation */
  const addBotMessage = useCallback(
    (text: string, delay = 800, bold?: string): Promise<void> => {
      return new Promise((resolve) => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            { id: Date.now() + Math.random(), role: "bot", text, bold },
          ]);
          resolve();
        }, delay);
      });
    },
    []
  );

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), role: "user", text },
    ]);
  };

  /* Start with menu (2 choices) */
  const startConversation = useCallback(async () => {
    await addBotMessage("Bonjour 👋 Comment pouvons-nous vous aider ?", 500);
    setStep("menu");
  }, [addBotMessage]);

  /* Listen for global open events */
  useEffect(() => {
    const handleMenu = () => setIsOpen(true);
    window.addEventListener("openLeadBot", handleMenu);
    return () => window.removeEventListener("openLeadBot", handleMenu);
  }, []);

  /* Start conversation on first open */
  useEffect(() => {
    if (isOpen && !started) {
      setStarted(true);
      startConversation();
    }
  }, [isOpen, started, startConversation]);

  /* Handle choice clicks */
  const handleChoice = async (choice: Choice) => {
    addUserMessage(choice.label);
    switch (step) {
      case "menu":
        if (choice.value === "booking") {
          await addBotMessage("Parfait. Dans quel secteur exercez-vous ?", 600);
          setStep("sector");
        } else if (choice.value === "email") {
          await addBotMessage(
            `Pas de souci. Écrivez-nous directement à ${CONTACT_EMAIL} ou remplissez le formulaire de contact — on vous répond sous 24h.`,
            700,
            CONTACT_EMAIL
          );
          setStep("email-done");
        }
        break;
      case "sector":
        await addBotMessage(
          "Parfait. On peut automatiser une grande partie de vos processus, avec des résultats visibles sous 14 jours.",
          800,
          "14 jours"
        );
        await addBotMessage(
          "Je vous envoie sur notre page de réservation. Choisissez le créneau qui vous convient 🚀",
          700
        );
        setStep("redirect");
        setTimeout(() => {
          window.open(CAL_BOOKING_URL, "_blank", "noopener,noreferrer");
          setIsOpen(false);
        }, 1800);
        break;
    }
  };

  const handleReset = () => {
    setMessages([]);
    setStarted(false);
    setStep("menu");
    setIsOpen(false);
  };

  const currentChoices = (): Choice[] | null => {
    if (step === "menu")
      return [
        { label: "📅 Prendre RDV en 30 secondes", value: "booking" },
        { label: "✉️ Poser une question par email", value: "email" },
      ];
    if (step === "sector") return SECTORS;
    return null;
  };

  const choices = currentChoices();

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="fab"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(true)}
            aria-label="Ouvrir le chat OpexIA"
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #007AFF 0%, #0055D4 100%)",
              boxShadow: "0 4px 20px rgba(0,122,255,0.5), 0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 flex flex-col overflow-hidden bg-white shadow-2xl sm:h-[560px] sm:w-[380px] sm:rounded-2xl"
            role="dialog"
            aria-label="Chat OpexIA"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between gap-3 px-4 py-3 text-white"
              style={{
                background: "linear-gradient(135deg, #007AFF 0%, #0055D4 100%)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                  <Image
                    src="/icon.png"
                    alt="OpexIA"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">OpexIA</p>
                  <p className="flex items-center gap-1 text-[11px] leading-tight text-white/80">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400"></span>
                    En ligne
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Fermer"
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#F9FAFB] p-4">
              <div className="flex flex-col gap-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                        m.role === "user"
                          ? "rounded-br-sm bg-[#007AFF] text-white"
                          : "rounded-bl-sm bg-white text-[#111] shadow-sm ring-1 ring-gray-100"
                      }`}
                    >
                      <RenderText text={m.text} bold={m.bold} />
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm bg-white px-3.5 py-3 shadow-sm ring-1 ring-gray-100">
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></span>
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></span>
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input / Choices */}
            <div className="border-t border-gray-100 bg-white p-3">
              {choices && !isTyping ? (
                <div className="flex flex-wrap gap-2">
                  {choices.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => handleChoice(c)}
                      className="rounded-full border border-[#007AFF]/20 bg-[#007AFF]/5 px-3.5 py-1.5 text-xs font-medium text-[#007AFF] transition-colors hover:bg-[#007AFF]/10"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              ) : step === "email-done" ? (
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="rounded-full bg-[#007AFF] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0055D4]"
                  >
                    ✉️ Ouvrir mon mail
                  </a>
                  <a
                    href="/contact"
                    className="rounded-full border border-[#007AFF]/20 bg-[#007AFF]/5 px-3.5 py-1.5 text-xs font-medium text-[#007AFF] transition-colors hover:bg-[#007AFF]/10"
                  >
                    Formulaire de contact
                  </a>
                  <button
                    onClick={handleReset}
                    className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    Recommencer
                  </button>
                </div>
              ) : (
                <p className="text-center text-xs text-gray-400">L&apos;assistant OpexIA prépare la réponse…</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

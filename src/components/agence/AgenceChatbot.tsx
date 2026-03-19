"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Message {
  role: "bot" | "user";
  text: string;
  link?: { label: string; href: string };
}

const faqData: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["prix", "tarif", "combien", "coût", "cher", "budget", "devis"],
    answer:
      "Chaque projet est unique. On propose un audit gratuit d'1h pour comprendre vos besoins et vous donner un devis précis. Les projets démarrent généralement à partir de 500€.",
  },
  {
    keywords: ["chatbot", "chat", "bot", "assistant"],
    answer:
      "Nos chatbots IA répondent 24/7 à vos clients : support, prise de RDV, qualification de leads. Ils s'intègrent à votre site en quelques jours. Tarif : à partir de 800€.",
  },
  {
    keywords: ["automatisation", "automatiser", "workflow", "processus", "tâche"],
    answer:
      "On automatise vos tâches répétitives : facturation, relances, reporting, onboarding. Vos équipes gagnent des heures chaque semaine. Tarif : à partir de 500€.",
  },
  {
    keywords: ["agent", "autonome", "veille", "prospection"],
    answer:
      "Nos agents IA travaillent en autonomie 24/7 : veille concurrentielle, analyse de données, prospection automatisée. Tarif : à partir de 1 500€.",
  },
  {
    keywords: ["site", "web", "landing", "page"],
    answer:
      "On crée des sites web optimisés avec l'IA : design moderne, SEO intégré, performance maximale. Livraison rapide. Contactez-nous pour un devis.",
  },
  {
    keywords: ["délai", "temps", "durée", "livraison", "rapide"],
    answer:
      "Les délais varient selon le projet : un chatbot peut être livré en 3-5 jours, une automatisation en 1-2 semaines. On vous donne un planning précis lors de l'audit gratuit.",
  },
  {
    keywords: ["audit", "gratuit", "rdv", "rendez-vous", "appel", "calendly"],
    answer:
      "L'audit gratuit dure 1h. On analyse vos process, identifie les gains possibles avec l'IA, et vous propose un plan d'action concret. Sans engagement.",
  },
  {
    keywords: ["formation", "former", "apprendre", "cours", "programme"],
    answer:
      "Vous voulez maîtriser l'IA vous-même ? On propose aussi une formation complète pour lancer votre propre agence IA. Découvrez-la sur notre page dédiée !",
  },
];

function findAnswer(input: string): { text: string; link?: { label: string; href: string } } {
  const lower = input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const faq of faqData) {
    for (const kw of faq.keywords) {
      const normalizedKw = kw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (lower.includes(normalizedKw)) {
        if (faq.keywords.includes("formation")) {
          return { text: faq.answer, link: { label: "Voir la formation", href: "/formation" } };
        }
        return { text: faq.answer };
      }
    }
  }
  return {
    text: "Bonne question ! Pour une réponse personnalisée, réservez votre audit gratuit d'1h. On analysera votre situation en détail.",
  };
}

export default function AgenceChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Bonjour ! 👋 Je suis l'assistant OpexIA. Comment puis-je vous aider ? Posez-moi vos questions sur nos services IA.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSend = (text?: string) => {
    const trimmed = (text || input).trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    if (!text) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const { text: answer, link } = findAnswer(trimmed);
      setMessages((prev) => [...prev, { role: "bot", text: answer, link }]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  const quickReplies = [
    "Quels sont vos services ?",
    "Combien ça coûte ?",
    "Vous proposez des formations ?",
  ];

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#007AFF] text-white shadow-xl shadow-blue-900/30 flex items-center justify-center hover:bg-[#0055D4] transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden flex flex-col"
            style={{ height: "480px" }}
          >
            {/* Header */}
            <div className="bg-[#0A0A0A] px-5 py-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full overflow-hidden flex-shrink-0">
                <Image src="/images/logobleu.png" alt="OpexIA" width={36} height={36} className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Assistant OpexIA</p>
                <p className="text-white/40 text-xs flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
                  En ligne
                </p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#007AFF] text-white rounded-br-md"
                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                    {msg.link && (
                      <a
                        href={msg.link.href}
                        className="mt-2 inline-flex items-center gap-1.5 text-[#007AFF] font-semibold text-xs hover:underline"
                      >
                        {msg.link.label}
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Quick replies */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-xs border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-gray-100 px-4 py-3 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Posez votre question..."
                className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2.5 outline-none focus:border-[#007AFF]/50 focus:ring-2 focus:ring-[#007AFF]/10 transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="h-10 w-10 rounded-full bg-[#007AFF] text-white flex items-center justify-center hover:bg-[#0055D4] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

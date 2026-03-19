"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/* ───────── Types ───────── */
type Step = "welcome" | "sector" | "pain" | "team" | "contact" | "name" | "phone" | "done";

interface Message {
  id: number;
  role: "bot" | "user";
  text: string;
}

interface Choice {
  label: string;
  value: string;
}

/* ───────── Flow Data ───────── */
const WHATSAPP_NUMBER = "33756803717";

const SECTORS: Choice[] = [
  { label: "🏠 Immobilier", value: "Immobilier" },
  { label: "🛒 E-commerce", value: "E-commerce" },
  { label: "💼 Services B2B", value: "Services B2B" },
  { label: "🍽️ Restauration", value: "Restauration" },
  { label: "🏢 Autre", value: "Autre" },
];

const PAINS: Choice[] = [
  { label: "📞 Prospection / relance", value: "Prospection et relance clients" },
  { label: "💬 Support client / SAV", value: "Support client et SAV" },
  { label: "📋 Gestion administrative", value: "Gestion administrative" },
  { label: "✍️ Création de contenu", value: "Création de contenu" },
];

const TEAMS: Choice[] = [
  { label: "Solo", value: "Solo" },
  { label: "2-10 personnes", value: "2-10" },
  { label: "11-50 personnes", value: "11-50" },
  { label: "50+", value: "50+" },
];

const CONTACTS: Choice[] = [
  { label: "📞 Appel de 15 min", value: "Appel téléphonique" },
  { label: "💻 Google Meet", value: "Google Meet" },
  { label: "💬 Via WhatsApp", value: "WhatsApp" },
];

const TIME_SAVINGS: Record<string, string> = {
  "Prospection et relance clients": "15 à 25h",
  "Support client et SAV": "10 à 20h",
  "Gestion administrative": "12 à 18h",
  "Création de contenu": "8 à 15h",
};

/* ───────── Helper: open bot from anywhere ───────── */
export function openLeadBot() {
  window.dispatchEvent(new Event("openLeadBot"));
}

/* ───────── Component ───────── */
export default function AgenceChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("welcome");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [answers, setAnswers] = useState({
    sector: "",
    pain: "",
    team: "",
    contactMethod: "",
    name: "",
    phone: "",
  });
  const [started, setStarted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Auto-scroll */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  /* Listen for global open event */
  useEffect(() => {
    const handler = () => {
      setIsOpen(true);
    };
    window.addEventListener("openLeadBot", handler);
    return () => window.removeEventListener("openLeadBot", handler);
  }, []);

  /* Start conversation on first open */
  useEffect(() => {
    if (isOpen && !started) {
      setStarted(true);
      startConversation();
    }
  }, [isOpen, started]);

  /* Focus input when needed */
  useEffect(() => {
    if ((step === "name" || step === "phone") && isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [step, isOpen]);

  /* Bot message with typing simulation */
  const addBotMessage = useCallback((text: string, delay = 800): Promise<void> => {
    return new Promise((resolve) => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { id: Date.now() + Math.random(), role: "bot", text }]);
        resolve();
      }, delay);
    });
  }, []);

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), role: "user", text }]);
  };

  const startConversation = async () => {
    await addBotMessage("Salut ! 👋 Je suis l'assistant OpexIA.", 500);
    await addBotMessage("En 30 secondes, on va voir comment l'IA peut vous faire gagner du temps. C'est parti ?", 900);
    setStep("welcome");
  };

  /* Handle button choices */
  const handleChoice = async (choice: Choice) => {
    addUserMessage(choice.label);

    switch (step) {
      case "welcome":
        setStep("sector");
        await addBotMessage("Cool ! Vous êtes dans quel secteur ?", 600);
        break;

      case "sector":
        setAnswers((prev) => ({ ...prev, sector: choice.value }));
        setStep("pain");
        await addBotMessage("Et c'est quoi qui vous prend le plus de temps au quotidien ?", 700);
        break;

      case "pain":
        setAnswers((prev) => ({ ...prev, pain: choice.value }));
        setStep("team");
        await addBotMessage("Vous êtes combien dans l'équipe ?", 600);
        break;

      case "team": {
        setAnswers((prev) => ({ ...prev, team: choice.value }));
        const savings = TIME_SAVINGS[answers.pain] || "10 à 20h";
        setStep("contact");
        await addBotMessage(
          `Top ! D'après ce que vous me dites, on peut vous faire gagner ${savings} par mois. Nos clients voient les premiers résultats en 14 jours. 🚀`,
          1000
        );
        await addBotMessage("Comment vous préférez qu'on en discute ?", 600);
        break;
      }

      case "contact":
        setAnswers((prev) => ({ ...prev, contactMethod: choice.value }));
        if (choice.value === "WhatsApp") {
          await addBotMessage("Parfait, je vous redirige vers WhatsApp ! 💬", 500);
          setStep("done");
          setTimeout(() => {
            const msg = encodeURIComponent(
              `Bonjour ! Je suis intéressé par vos services d'automatisation IA.\n\nSecteur : ${answers.sector}\nBesoin : ${answers.pain}\nÉquipe : ${answers.team}\n\n(Envoyé depuis opexia-agency.com)`
            );
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
          }, 600);
          await addBotMessage("La fenêtre WhatsApp devrait s'ouvrir. À très vite ! 🎉", 800);
        } else {
          setStep("name");
          await addBotMessage("Super ! C'est quoi votre prénom ?", 600);
        }
        break;
    }
  };

  /* Handle text input (name / phone) */
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    const value = inputValue.trim();
    addUserMessage(value);
    setInputValue("");

    if (step === "name") {
      setAnswers((prev) => ({ ...prev, name: value }));
      setStep("phone");
      await addBotMessage(`Enchanté ${value} ! Et votre numéro de téléphone ?`, 700);
    } else if (step === "phone") {
      const updatedAnswers = { ...answers, phone: value };
      setAnswers(updatedAnswers);
      setStep("done");
      await addBotMessage(
        `C'est noté ${answers.name} ! 🎉 On vous recontacte dans les 24h pour un ${answers.contactMethod.toLowerCase()}.`,
        800
      );
      await addBotMessage("Envoyez-nous un petit message sur WhatsApp pour confirmer :", 600);
    }
  };

  /* WhatsApp redirect with full context */
  const handleWhatsAppFinal = () => {
    const msg = encodeURIComponent(
      `Bonjour, je suis ${answers.name} (${answers.phone}).\n\nSecteur : ${answers.sector}\nBesoin : ${answers.pain}\nÉquipe : ${answers.team}\nContact souhaité : ${answers.contactMethod}\n\n(Envoyé depuis opexia-agency.com)`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  /* Reset conversation */
  const handleReset = () => {
    setMessages([]);
    setStep("welcome");
    setAnswers({ sector: "", pain: "", team: "", contactMethod: "", name: "", phone: "" });
    setInputValue("");
    setStarted(false);
    setStarted(true);
    startConversation();
  };

  /* Current options based on step */
  const getCurrentOptions = (): Choice[] => {
    switch (step) {
      case "welcome": return [{ label: "C'est parti ! 🚀", value: "start" }];
      case "sector": return SECTORS;
      case "pain": return PAINS;
      case "team": return TEAMS;
      case "contact": return CONTACTS;
      default: return [];
    }
  };

  const showOptions = ["welcome", "sector", "pain", "team", "contact"].includes(step) && !isTyping;
  const showInput = (step === "name" || step === "phone") && !isTyping;
  const showWhatsAppButton = step === "done" && answers.contactMethod !== "WhatsApp" && !isTyping;
  const options = getCurrentOptions();

  /* Progress */
  const stepOrder: Step[] = ["welcome", "sector", "pain", "team", "contact", "name", "phone", "done"];
  const currentIndex = stepOrder.indexOf(step);
  const totalSteps = answers.contactMethod === "WhatsApp" ? 5 : 7;
  const progress = Math.min(((currentIndex + 1) / totalSteps) * 100, 100);

  return (
    <>
      {/* ─── Floating Button ─── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#007AFF] text-white shadow-xl shadow-blue-900/30"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {/* Pulse */}
            <span className="absolute inset-0 rounded-full bg-[#007AFF] animate-ping opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── Chat Window ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-0 right-0 z-50 flex flex-col bg-white shadow-2xl
                       w-full h-[100dvh]
                       sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-auto sm:max-h-[min(640px,calc(100dvh-48px))] sm:rounded-2xl sm:border sm:border-gray-200"
          >
            {/* Header */}
            <div className="bg-[#0A0A0A] px-5 py-4 flex items-center justify-between sm:rounded-t-2xl flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image src="/images/logobleu.png" alt="OpexIA" width={40} height={40} className="h-full w-full object-cover" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0A0A0A] bg-green-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">OpexIA</p>
                  <p className="text-white/40 text-xs flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
                    Répond en quelques secondes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-100 flex-shrink-0">
              <motion.div
                className="h-full bg-[#007AFF]"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
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
                  </div>
                </motion.div>
              ))}

              {/* Typing dots */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}

              <div />
            </div>

            {/* ─── Options Buttons ─── */}
            <AnimatePresence>
              {showOptions && options.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="px-4 pb-4 flex-shrink-0"
                >
                  <div className="flex flex-wrap gap-2">
                    {options.map((opt, i) => (
                      <motion.button
                        key={opt.value}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.06 }}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleChoice(opt)}
                        className="rounded-full border border-[#007AFF]/25 bg-[#007AFF]/5 px-4 py-2.5 text-sm font-medium text-[#007AFF] hover:bg-[#007AFF] hover:text-white transition-colors duration-200"
                      >
                        {opt.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── Text Input (name / phone) ─── */}
            <AnimatePresence>
              {showInput && (
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onSubmit={handleSubmit}
                  className="px-4 pb-4 flex gap-2 flex-shrink-0"
                >
                  <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={step === "name" ? "Votre prénom..." : "06 XX XX XX XX"}
                    type={step === "phone" ? "tel" : "text"}
                    className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#007AFF]/50 focus:ring-2 focus:ring-[#007AFF]/10 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="h-10 w-10 rounded-full bg-[#007AFF] text-white flex items-center justify-center hover:bg-[#0055D4] transition-colors disabled:opacity-30 flex-shrink-0"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* ─── Final WhatsApp Button ─── */}
            <AnimatePresence>
              {showWhatsAppButton && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 pb-4 space-y-2 flex-shrink-0"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWhatsAppFinal}
                    className="w-full rounded-full py-3.5 text-sm font-semibold text-white flex items-center justify-center gap-2 shadow-lg"
                    style={{ backgroundColor: "#25D366" }}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.121.553 4.116 1.518 5.855L.057 23.764l6.087-1.421A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82a9.796 9.796 0 01-5.222-1.505l-.375-.222-3.61.843.91-3.502-.253-.392A9.796 9.796 0 012.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z" />
                    </svg>
                    Confirmer sur WhatsApp
                  </motion.button>
                  <button
                    onClick={handleReset}
                    className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors"
                  >
                    Recommencer la conversation
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Done state for WhatsApp direct */}
            {step === "done" && answers.contactMethod === "WhatsApp" && !isTyping && (
              <div className="px-4 pb-4 flex-shrink-0">
                <button
                  onClick={handleReset}
                  className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors"
                >
                  Recommencer la conversation
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

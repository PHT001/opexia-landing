"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/* ───────── Types ───────── */
type Step =
  | "sector"
  | "pain"
  | "contact"
  | "name"
  | "email"
  | "schedule"
  | "phone"
  | "done";

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
  { label: "📋 Gestion admin", value: "Gestion administrative" },
  { label: "✍️ Création de contenu", value: "Création de contenu" },
];

const CONTACTS: Choice[] = [
  { label: "📞 Appel WhatsApp · 15 min", value: "Appel WhatsApp" },
  { label: "💻 Google Meet", value: "Google Meet" },
];

const TIME_SAVINGS: Record<string, string> = {
  "Prospection et relance clients": "15 à 25h",
  "Support client et SAV": "10 à 20h",
  "Gestion administrative": "12 à 18h",
  "Création de contenu": "8 à 15h",
};

const EMAIL_DOMAINS = [
  "@gmail.com",
  "@outlook.fr",
  "@hotmail.com",
  "@yahoo.fr",
  "@icloud.com",
];

const SLOTS = ["10:00", "11:00", "14:00", "15:30", "17:00"];
const DAY_NAMES = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTH_NAMES = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"];

function getNextBusinessDays(count: number): Date[] {
  const days: Date[] = [];
  const d = new Date();
  d.setDate(d.getDate() + 1); // start tomorrow
  while (days.length < count) {
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      days.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

/* ───────── Helper: open bot from anywhere ───────── */
export function openLeadBot() {
  window.dispatchEvent(new Event("openLeadBot"));
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
  const [step, setStep] = useState<Step>("sector");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [answers, setAnswers] = useState({
    sector: "",
    pain: "",
    contactMethod: "",
    name: "",
    email: "",
    phone: "",
    schedule: "",
  });
  const [started, setStarted] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const businessDays = useRef(getNextBusinessDays(5)).current;

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

  /* Handle iOS virtual keyboard resize */
  useEffect(() => {
    if (!isOpen) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, [isOpen]);

  /* Auto-scroll */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  /* Listen for global open event */
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("openLeadBot", handler);
    return () => window.removeEventListener("openLeadBot", handler);
  }, []);

  /* Start conversation on first open — go straight to first question */
  useEffect(() => {
    if (isOpen && !started) {
      setStarted(true);
      startConversation();
    }
  }, [isOpen, started]);

  /* Focus input when needed */
  useEffect(() => {
    if ((step === "name" || step === "email" || step === "phone") && isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [step, isOpen]);

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

  /* Start straight with first question */
  const startConversation = async () => {
    await addBotMessage("Salut ! 👋 Réservez votre audit gratuit en 30 secondes.", 500, "30 secondes");
    await addBotMessage("Vous êtes dans quel secteur ?", 700);
    setStep("sector");
  };

  /* Handle button choices */
  const handleChoice = async (choice: Choice) => {
    addUserMessage(choice.label);

    switch (step) {
      case "sector":
        setAnswers((prev) => ({ ...prev, sector: choice.value }));
        setStep("pain");
        await addBotMessage(
          "C'est quoi qui vous prend le plus de temps au quotidien ?",
          700
        );
        break;

      case "pain": {
        setAnswers((prev) => ({ ...prev, pain: choice.value }));
        const savings = TIME_SAVINGS[choice.value] || "10 à 20h";
        setStep("contact");
        await addBotMessage(
          `On peut vous faire gagner ${savings} par mois. Résultats en 14 jours. 🚀`,
          900,
          savings
        );
        await addBotMessage("Comment on en discute ?", 600);
        break;
      }

      case "contact":
        setAnswers((prev) => ({ ...prev, contactMethod: choice.value }));
        setStep("name");
        await addBotMessage("C'est quoi votre prénom ?", 600);
        break;
    }
  };

  /* Apply email domain suggestion */
  const applyEmailSuggestion = (fullEmail: string) => {
    setInputValue(fullEmail);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  /* Handle schedule slot selection */
  const handleSlotSelect = async (slot: string) => {
    if (!selectedDay) return;
    const dayLabel = `${DAY_NAMES[selectedDay.getDay()]} ${selectedDay.getDate()} ${MONTH_NAMES[selectedDay.getMonth()]}`;
    const scheduleText = `${dayLabel} à ${slot}`;
    setAnswers((prev) => ({ ...prev, schedule: scheduleText }));
    addUserMessage(`📅 ${scheduleText}`);
    setStep("done");
    await addBotMessage(
      `Parfait ${answers.name} ! 🎉 RDV Google Meet le ${scheduleText}. L'invitation arrive sur ${answers.email}.`,
      800
    );
    await addBotMessage("Une question en attendant ? On reste dispo 👇", 600);
  };

  /* Handle text input (name / email / phone) */
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    const value = inputValue.trim();
    addUserMessage(value);
    setInputValue("");

    if (step === "name") {
      setAnswers((prev) => ({ ...prev, name: value }));

      if (answers.contactMethod === "Google Meet") {
        setStep("email");
        await addBotMessage(
          `Enchanté ${value} ! Votre email pour l'invitation Meet ?`,
          700
        );
      } else {
        setStep("phone");
        await addBotMessage(
          `Enchanté ${value} ! Votre numéro pour qu'on vous appelle ?`,
          700
        );
      }
    } else if (step === "email") {
      setAnswers((prev) => ({ ...prev, email: value }));
      setStep("schedule");
      await addBotMessage("Top ! Choisissez un créneau qui vous arrange 👇", 700);
    } else if (step === "phone") {
      setAnswers((prev) => ({ ...prev, phone: value }));
      setStep("done");
      await addBotMessage(
        `C'est noté ${answers.name} ! 🎉 On vous appelle sur WhatsApp dans les 24h.`,
        800
      );
      await addBotMessage("Une question en attendant ? On reste dispo 👇", 600);
    }
  };

  /* WhatsApp question link */
  const handleWhatsAppQuestion = () => {
    const context = answers.name
      ? `Bonjour, c'est ${answers.name}. J'ai une question concernant vos services d'automatisation IA.`
      : `Bonjour, j'ai une question concernant vos services d'automatisation IA.`;
    const msg = encodeURIComponent(context);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  /* Reset conversation */
  const handleReset = () => {
    setMessages([]);
    setStep("sector");
    setAnswers({ sector: "", pain: "", contactMethod: "", name: "", email: "", phone: "", schedule: "" });
    setInputValue("");
    setSelectedDay(null);
    setStarted(false);
    setTimeout(() => {
      setStarted(true);
      startConversation();
    }, 100);
  };

  /* Current options based on step */
  const getCurrentOptions = (): Choice[] => {
    switch (step) {
      case "sector": return SECTORS;
      case "pain": return PAINS;
      case "contact": return CONTACTS;
      default: return [];
    }
  };

  const showOptions = ["sector", "pain", "contact"].includes(step) && !isTyping;
  const showInput = (step === "name" || step === "email" || step === "phone") && !isTyping;
  const showSchedule = step === "schedule" && !isTyping;
  const showDone = step === "done" && !isTyping;
  const options = getCurrentOptions();

  /* Email suggestions */
  const emailLocalPart = inputValue.split("@")[0];
  const emailHasFullDomain = inputValue.includes("@") && inputValue.split("@")[1]?.includes(".");
  const showEmailSuggestions = step === "email" && emailLocalPart.length > 0 && !emailHasFullDomain;

  const getEmailSuggestions = () => {
    const local = emailLocalPart;
    if (!local) return [];
    const afterAt = inputValue.includes("@") ? inputValue.split("@")[1]?.toLowerCase() || "" : "";
    return EMAIL_DOMAINS.filter((d) => {
      if (!afterAt) return true;
      return d.toLowerCase().startsWith("@" + afterAt);
    }).map((d) => local + d);
  };

  /* Progress */
  const stepMap: Record<Step, number> = {
    sector: 1, pain: 2, contact: 3, name: 4, email: 5, schedule: 6, phone: 5, done: 6,
  };
  const progress = Math.min((stepMap[step] / 6) * 100, 100);

  /* Input placeholder & type */
  const getInputProps = () => {
    switch (step) {
      case "name": return { placeholder: "Votre prénom...", type: "text" };
      case "email": return { placeholder: "votre@email.com", type: "email" };
      case "phone": return { placeholder: "06 XX XX XX XX", type: "tel" };
      default: return { placeholder: "", type: "text" };
    }
  };

  const inputProps = getInputProps();

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
            className="fixed bottom-5 right-5 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-[#007AFF] text-white shadow-xl shadow-blue-900/30"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="absolute inset-0 rounded-full bg-[#007AFF] animate-ping opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── Chat Window ─── */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998] bg-white sm:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              style={{
                paddingTop: "env(safe-area-inset-top)",
                paddingBottom: "env(safe-area-inset-bottom)",
              }}
              className="fixed inset-0 z-[9999] flex flex-col bg-white
                         sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:max-h-[min(660px,calc(100dvh-48px))] sm:rounded-2xl sm:border sm:border-gray-200 sm:shadow-2xl"
            >
              {/* Header */}
              <div className="bg-[#0A0A0A] px-4 py-3 flex items-center justify-between sm:rounded-t-2xl flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="h-9 w-9 rounded-full overflow-hidden">
                      <Image src="/images/logobleu.png" alt="OpexIA" width={36} height={36} className="h-full w-full object-cover" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0A0A0A] bg-green-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold">OpexIA</p>
                    <p className="text-white/40 text-xs flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block flex-shrink-0" />
                      En ligne
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
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
              <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 sm:px-4 sm:py-4 space-y-2.5">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-[13px] sm:text-sm leading-relaxed break-words ${
                        msg.role === "user"
                          ? "bg-[#007AFF] text-white rounded-br-md max-w-[75%]"
                          : "bg-gray-100 text-gray-800 rounded-bl-md max-w-[85%]"
                      }`}
                    >
                      <RenderText text={msg.text} bold={msg.bold} />
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
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
                    className="px-3 pb-3 sm:px-4 sm:pb-4 flex-shrink-0"
                  >
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {options.map((opt, i) => (
                        <motion.button
                          key={opt.value}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleChoice(opt)}
                          className="rounded-full border border-[#007AFF]/25 bg-[#007AFF]/5 px-3 py-2 sm:px-4 sm:py-2.5 text-[13px] sm:text-sm font-medium text-[#007AFF] active:bg-[#007AFF] active:text-white transition-colors duration-150"
                        >
                          {opt.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Text Input (name / email / phone) ─── */}
              <AnimatePresence>
                {showInput && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="px-3 pb-3 sm:px-4 sm:pb-4 flex-shrink-0"
                  >
                    <AnimatePresence>
                      {showEmailSuggestions && getEmailSuggestions().length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          className="flex flex-wrap gap-1.5 mb-2 overflow-x-auto"
                        >
                          {getEmailSuggestions().map((email) => (
                            <button
                              key={email}
                              type="button"
                              onClick={() => applyEmailSuggestion(email)}
                              className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-700 active:bg-[#007AFF]/15 active:text-[#007AFF] transition-colors whitespace-nowrap flex-shrink-0"
                            >
                              {email}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="flex gap-2">
                      <input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={inputProps.placeholder}
                        type={inputProps.type}
                        autoComplete={step === "email" ? "email" : step === "phone" ? "tel" : "given-name"}
                        autoCapitalize={step === "email" ? "none" : "words"}
                        className="flex-1 min-w-0 rounded-full border border-gray-200 px-4 py-2.5 text-base outline-none focus:border-[#007AFF]/50 focus:ring-2 focus:ring-[#007AFF]/10 transition-all"
                        style={{ fontSize: "16px" }}
                      />
                      <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="h-11 w-11 rounded-full bg-[#007AFF] text-white flex items-center justify-center transition-colors disabled:opacity-30 flex-shrink-0"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Schedule Picker (Google Meet) ─── */}
              <AnimatePresence>
                {showSchedule && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="px-3 pb-3 sm:px-4 sm:pb-4 flex-shrink-0"
                  >
                    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                      {/* Day selector */}
                      <div className="flex border-b border-gray-100">
                        {businessDays.map((day) => {
                          const isSelected = selectedDay?.toDateString() === day.toDateString();
                          return (
                            <button
                              key={day.toISOString()}
                              onClick={() => setSelectedDay(day)}
                              className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-colors ${
                                isSelected
                                  ? "bg-[#007AFF] text-white"
                                  : "text-gray-600 hover:bg-gray-50 active:bg-gray-100"
                              }`}
                            >
                              <span className="text-[10px] font-medium uppercase">
                                {DAY_NAMES[day.getDay()]}
                              </span>
                              <span className="text-sm font-bold">{day.getDate()}</span>
                              <span className="text-[10px]">
                                {MONTH_NAMES[day.getMonth()]}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Time slots */}
                      <AnimatePresence mode="wait">
                        {selectedDay ? (
                          <motion.div
                            key={selectedDay.toISOString()}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-2.5 grid grid-cols-3 gap-1.5"
                          >
                            {SLOTS.map((slot) => (
                              <button
                                key={slot}
                                onClick={() => handleSlotSelect(slot)}
                                className="rounded-lg border border-gray-200 py-2 text-[13px] font-medium text-gray-700 hover:border-[#007AFF] hover:text-[#007AFF] active:bg-[#007AFF] active:text-white active:border-[#007AFF] transition-colors"
                              >
                                {slot}
                              </button>
                            ))}
                          </motion.div>
                        ) : (
                          <div className="p-4 text-center text-xs text-gray-400">
                            Sélectionnez un jour ci-dessus
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Done: Question WhatsApp + Reset ─── */}
              <AnimatePresence>
                {showDone && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-3 pb-3 sm:px-4 sm:pb-4 space-y-2 flex-shrink-0"
                  >
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleWhatsAppQuestion}
                      className="w-full rounded-full py-3 text-[13px] sm:text-sm font-semibold text-white flex items-center justify-center gap-2 shadow-lg"
                      style={{ backgroundColor: "#25D366" }}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.121.553 4.116 1.518 5.855L.057 23.764l6.087-1.421A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82a9.796 9.796 0 01-5.222-1.505l-.375-.222-3.61.843.91-3.502-.253-.392A9.796 9.796 0 012.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z" />
                      </svg>
                      Poser une question sur WhatsApp
                    </motion.button>
                    <button
                      onClick={handleReset}
                      className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors"
                    >
                      Recommencer
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

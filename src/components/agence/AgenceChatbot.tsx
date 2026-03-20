"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/* ───────── Types ───────── */
type Step =
  | "menu"
  | "sector"
  | "contact"
  | "name"
  | "email"
  | "phone"
  | "schedule"
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

const CONTACTS: Choice[] = [
  { label: "📞 Appel téléphonique", value: "Appel téléphonique" },
  { label: "💻 Google Meet", value: "Google Meet" },
];

const EMAIL_DOMAINS = [
  "@gmail.com",
  "@outlook.fr",
  "@hotmail.com",
  "@yahoo.fr",
  "@icloud.com",
];

const SLOTS = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const DAY_NAMES = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTH_NAMES = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Monday–Saturday (1–6), skip Sunday */
function getNextAvailableDays(count: number): Date[] {
  const days: Date[] = [];
  const d = new Date();
  d.setDate(d.getDate() + 1); // start tomorrow
  while (days.length < count) {
    if (d.getDay() !== 0) {
      days.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

/* ───────── Helpers: open bot from anywhere ───────── */
/** Opens the chatbot in menu mode (message vs booking) */
export function openLeadBot() {
  window.dispatchEvent(new Event("openLeadBot"));
}
/** Opens the chatbot directly in booking mode (skips menu) */
export function openLeadBotBooking() {
  window.dispatchEvent(new Event("openLeadBotBooking"));
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
  const [inputValue, setInputValue] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [answers, setAnswers] = useState({
    sector: "",
    contactMethod: "",
    name: "",
    email: "",
    phone: "",
    schedule: "",
  });
  const [started, setStarted] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [bookingLoading, setBookingLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const availableDays = useRef(getNextAvailableDays(7)).current;

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

  /* Start directly in booking mode (called by CTAs) */
  const startBookingFlow = useCallback(async () => {
    await addBotMessage("Bonjour 👋 Prenez rendez-vous en 30 secondes.", 500, "30 secondes");
    await addBotMessage("Dans quel secteur exercez-vous ?", 700);
    setStep("sector");
  }, [addBotMessage]);

  const pendingMode = useRef<"menu" | "booking" | null>(null);

  /* Listen for global open events */
  useEffect(() => {
    const handleMenu = () => {
      pendingMode.current = "menu";
      setIsOpen(true);
    };
    const handleBooking = () => {
      pendingMode.current = "booking";
      setIsOpen(true);
    };
    window.addEventListener("openLeadBot", handleMenu);
    window.addEventListener("openLeadBotBooking", handleBooking);
    return () => {
      window.removeEventListener("openLeadBot", handleMenu);
      window.removeEventListener("openLeadBotBooking", handleBooking);
    };
  }, []);

  /* Start conversation on first open */
  useEffect(() => {
    if (isOpen && !started) {
      setStarted(true);
      const mode = pendingMode.current;
      pendingMode.current = null;
      if (mode === "booking") {
        startBookingFlow();
      } else {
        startConversation();
      }
    }
  }, [isOpen, started, startConversation, startBookingFlow]);

  /* Focus input when needed */
  useEffect(() => {
    if ((step === "name" || step === "email" || step === "phone") && isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [step, isOpen]);

  /* Handle button choices */
  const handleChoice = async (choice: Choice) => {
    addUserMessage(choice.label);

    switch (step) {
      case "menu":
        if (choice.value === "whatsapp") {
          const msg = encodeURIComponent("Bonjour ! Je souhaiterais poser une question concernant vos services d'automatisation IA.");
          window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
          await addBotMessage("Vous allez être redirigé vers WhatsApp. À tout de suite ! 🙌", 600);
          setStep("done");
        } else {
          await addBotMessage("Prenez rendez-vous en 30 secondes.", 500, "30 secondes");
          await addBotMessage("Dans quel secteur exercez-vous ?", 700);
          setStep("sector");
        }
        break;

      case "sector":
        setAnswers((prev) => ({ ...prev, sector: choice.value }));
        setStep("contact");
        await addBotMessage(
          "Parfait. Nous pouvons automatiser une grande partie de vos processus, avec des résultats visibles sous 14 jours.",
          800,
          "14 jours"
        );
        await addBotMessage("Comment souhaitez-vous échanger ?", 600);
        break;

      case "contact":
        setAnswers((prev) => ({ ...prev, contactMethod: choice.value }));
        setStep("name");
        await addBotMessage("Quel est votre prénom ?", 600);
        break;
    }
  };

  /* Apply email domain suggestion */
  const applyEmailSuggestion = (fullEmail: string) => {
    setInputValue(fullEmail);
    setEmailError(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  /* Fetch booked slots when entering schedule step */
  useEffect(() => {
    if (step === "schedule") {
      fetch("/api/book")
        .then((r) => r.json())
        .then((data) => setBookedSlots(new Set(data.booked)))
        .catch(() => {});
    }
  }, [step]);

  /* Handle schedule slot selection */
  const handleSlotSelect = async (slot: string) => {
    if (!selectedDay || bookingLoading) return;
    const dayLabel = `${DAY_NAMES[selectedDay.getDay()]} ${selectedDay.getDate()} ${MONTH_NAMES[selectedDay.getMonth()]}`;
    const scheduleText = `${dayLabel} à ${slot}`;
    const y = selectedDay.getFullYear();
    const m = String(selectedDay.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDay.getDate()).padStart(2, "0");
    const slotKey = `${y}-${m}-${d}T${slot}`;

    if (bookedSlots.has(slotKey)) return;

    setBookingLoading(true);
    addUserMessage(`📅 ${scheduleText}`);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...answers,
          schedule: scheduleText,
          slotKey,
        }),
      });

      if (res.status === 409) {
        setBookedSlots((prev) => new Set(prev).add(slotKey));
        await addBotMessage("Ce créneau vient d'être réservé. Veuillez en sélectionner un autre.", 600);
        setBookingLoading(false);
        return;
      }

      setAnswers((prev) => ({ ...prev, schedule: scheduleText }));
      setBookedSlots((prev) => new Set(prev).add(slotKey));
      setStep("done");

      const isCall = answers.contactMethod === "Appel téléphonique";
      if (isCall) {
        await addBotMessage(
          `Votre rendez-vous est confirmé, ${answers.name}. Nous vous appellerons le ${scheduleText}. Une confirmation a été envoyée à ${answers.email}.`,
          800
        );
      } else {
        await addBotMessage(
          `Votre rendez-vous est confirmé, ${answers.name}. Rendez-vous le ${scheduleText} sur Google Meet. Une confirmation a été envoyée à ${answers.email}.`,
          800
        );
      }
      await addBotMessage("Si vous avez des questions d'ici là, n'hésitez pas à nous contacter.", 600);
    } catch {
      await addBotMessage("Une erreur est survenue. Veuillez réessayer.", 600);
    }
    setBookingLoading(false);
  };

  /* Handle text input (name / email / phone) */
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    const value = inputValue.trim();

    // Email validation
    if (step === "email" && !EMAIL_REGEX.test(value)) {
      setEmailError(true);
      return;
    }

    // Phone validation
    if (step === "phone" && !/^[\d\s\-+().]{7,20}$/.test(value)) {
      setPhoneError(true);
      return;
    }

    setEmailError(false);
    setPhoneError(false);
    addUserMessage(value);
    setInputValue("");

    if (step === "name") {
      setAnswers((prev) => ({ ...prev, name: value }));
      setStep("email");
      await addBotMessage(`Enchanté ${value}. Quelle est votre adresse email ?`, 700);
    } else if (step === "email") {
      setAnswers((prev) => ({ ...prev, email: value }));
      setStep("phone");
      await addBotMessage("Merci. Quel est votre numéro de téléphone ?", 600);
    } else if (step === "phone") {
      setAnswers((prev) => ({ ...prev, phone: value }));
      setStep("schedule");
      await addBotMessage("Merci. Choisissez le créneau qui vous convient le mieux.", 700);
    }
  };

  /* WhatsApp question link */
  const handleWhatsAppQuestion = () => {
    const context = answers.name
      ? `Bonjour, je suis ${answers.name}. Je souhaiterais poser une question concernant vos services d'automatisation IA.`
      : `Bonjour, je souhaiterais poser une question concernant vos services d'automatisation IA.`;
    const msg = encodeURIComponent(context);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  /* Reset conversation */
  const handleReset = () => {
    setMessages([]);
    setStep("menu");
    setAnswers({ sector: "", contactMethod: "", name: "", email: "", phone: "", schedule: "" });
    setInputValue("");
    setEmailError(false);
    setPhoneError(false);
    setSelectedDay(null);
    setStarted(false);
    setTimeout(() => {
      setStarted(true);
      startConversation();
    }, 100);
  };

  /* Menu choices */
  const MENU_CHOICES: Choice[] = [
    { label: "💬 Nous envoyer un message", value: "whatsapp" },
    { label: "📅 Prendre un RDV", value: "booking" },
  ];

  /* Current options based on step */
  const getCurrentOptions = (): Choice[] => {
    switch (step) {
      case "menu": return MENU_CHOICES;
      case "sector": return SECTORS;
      case "contact": return CONTACTS;
      default: return [];
    }
  };

  const showOptions = ["menu", "sector", "contact"].includes(step) && !isTyping;
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
    menu: 0, sector: 1, contact: 2, name: 3, email: 4, phone: 5, schedule: 6, done: 7,
  };
  const progress = Math.min((stepMap[step] / 7) * 100, 100);

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
            aria-label="Ouvrir le chat"
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
              role="dialog"
              aria-modal="true"
              aria-label="Chat OpexIA"
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
                  aria-label="Fermer le chat"
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
                  role="progressbar"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
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

              {/* ─── Menu Buttons (prominent) ─── */}
              <AnimatePresence>
                {step === "menu" && !isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="px-3 pb-3 sm:px-4 sm:pb-4 flex-shrink-0 space-y-2"
                  >
                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleChoice({ label: "📅 Prendre RDV en 30 secondes", value: "booking" })}
                      className="w-full rounded-xl py-3.5 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
                      style={{
                        background: "linear-gradient(135deg, #007AFF 0%, #0055D4 100%)",
                        boxShadow: "0 4px 14px rgba(0,122,255,0.35)",
                      }}
                    >
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Prendre RDV en 30 secondes
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleChoice({ label: "💬 Nous contacter par WhatsApp", value: "whatsapp" })}
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 flex items-center justify-center gap-2 transition-all hover:border-[#25D366]/40 hover:text-[#25D366]"
                    >
                      <svg className="h-4 w-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.121.553 4.116 1.518 5.855L.057 23.764l6.087-1.421A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82a9.796 9.796 0 01-5.222-1.505l-.375-.222-3.61.843.91-3.502-.253-.392A9.796 9.796 0 012.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z" />
                      </svg>
                      Nous contacter par WhatsApp
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Options Buttons (sector, contact) ─── */}
              <AnimatePresence>
                {showOptions && step !== "menu" && options.length > 0 && (
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

                    {emailError && (
                      <p className="text-red-500 text-xs mb-2 px-1">Veuillez entrer un email valide</p>
                    )}
                    {phoneError && (
                      <p className="text-red-500 text-xs mb-2 px-1">Veuillez entrer un numéro de téléphone valide</p>
                    )}

                    <form onSubmit={handleSubmit} className="flex gap-2">
                      <input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => {
                          setInputValue(e.target.value);
                          if (emailError) setEmailError(false);
                          if (phoneError) setPhoneError(false);
                        }}
                        placeholder={inputProps.placeholder}
                        type={inputProps.type}
                        autoComplete={step === "email" ? "email" : step === "phone" ? "tel" : "given-name"}
                        autoCapitalize={step === "email" ? "none" : step === "phone" ? "none" : "words"}
                        className={`flex-1 min-w-0 rounded-full border px-4 py-2.5 text-base outline-none transition-all ${
                          emailError || phoneError
                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            : "border-gray-200 focus:border-[#007AFF]/50 focus:ring-2 focus:ring-[#007AFF]/10"
                        }`}
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

              {/* ─── Schedule Picker ─── */}
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
                      <div className="flex overflow-x-auto border-b border-gray-100">
                        {availableDays.map((day) => {
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
                            {SLOTS.map((slot) => {
                              const y = selectedDay.getFullYear();
                              const m = String(selectedDay.getMonth() + 1).padStart(2, "0");
                              const d = String(selectedDay.getDate()).padStart(2, "0");
                              const key = `${y}-${m}-${d}T${slot}`;
                              const isBooked = bookedSlots.has(key);
                              return (
                                <button
                                  key={slot}
                                  onClick={() => !isBooked && handleSlotSelect(slot)}
                                  disabled={isBooked || bookingLoading}
                                  className={`rounded-lg border py-2 text-[13px] font-medium transition-colors ${
                                    isBooked
                                      ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                                      : "border-gray-200 text-gray-700 hover:border-[#007AFF] hover:text-[#007AFF] active:bg-[#007AFF] active:text-white active:border-[#007AFF]"
                                  }`}
                                >
                                  {isBooked ? `${slot} ✕` : slot}
                                </button>
                              );
                            })}
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

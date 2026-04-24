export const WHATSAPP_URL =
  "https://wa.me/33756885225?text=Bonjour%20%21%20Je%20suis%20int%C3%A9ress%C3%A9%20par%20vos%20services%20d%27automatisation%20IA.%20J%27aimerais%20r%C3%A9server%20un%20appel%20d%C3%A9couverte.";

export const CAL_BOOKING_URL = "https://cal.com/opexia/30min";

/** All "Audit gratuit" / booking CTAs open Cal.com in a new tab. */
export function openLeadBotBooking(): void {
  if (typeof window !== "undefined") {
    window.open(CAL_BOOKING_URL, "_blank", "noopener,noreferrer");
  }
}

/** Kept for backward-compat — opens the chatbot in its conversation (non-booking) mode. */
export { openLeadBot } from "@/components/agence/AgenceChatbot";

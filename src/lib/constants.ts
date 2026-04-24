export const CAL_BOOKING_URL = "https://cal.com/opexia/30min";

/** All "Audit gratuit" / booking CTAs open Cal.com in a new tab. */
export function openLeadBotBooking(): void {
  if (typeof window !== "undefined") {
    window.open(CAL_BOOKING_URL, "_blank", "noopener,noreferrer");
  }
}

/** Kept for backward-compat — opens the chatbot in its conversation (non-booking) mode. */
export { openLeadBot } from "@/components/agence/AgenceChatbot";

import { NextResponse } from "next/server";
import crypto from "node:crypto";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CRM_CHAT_ID = process.env.TELEGRAM_CRM_CHAT_ID;
const TELEGRAM_CRM_RDV_THREAD_ID = process.env.TELEGRAM_CRM_RDV_THREAD_ID;
const CAL_WEBHOOK_SECRET = process.env.CAL_WEBHOOK_SECRET;

const rateMap = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 30;
}

function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function fmtDate(iso: string | undefined, tz?: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
      timeZone: tz || "Europe/Paris",
      weekday: "short",
      day: "2-digit",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

type CalAttendee = {
  email?: string;
  name?: string;
  timeZone?: string;
};

type CalPayload = {
  triggerEvent?: string;
  createdAt?: string;
  payload?: {
    type?: string;
    title?: string;
    startTime?: string;
    endTime?: string;
    organizer?: { name?: string; email?: string; timeZone?: string };
    attendees?: CalAttendee[];
    uid?: string;
    location?: string;
    additionalNotes?: string;
    responses?: Record<string, { value?: string; label?: string } | string>;
    rescheduleUid?: string;
    cancellationReason?: string;
  };
};

function buildMessage(p: CalPayload): string {
  const evt = p.triggerEvent || "BOOKING";
  const data = p.payload || {};
  const att = data.attendees?.[0] || {};
  const tz = att.timeZone || data.organizer?.timeZone || "Europe/Paris";
  const start = fmtDate(data.startTime, tz);

  let title: string;
  let icon: string;
  switch (evt) {
    case "BOOKING_CREATED":
      icon = "📅";
      title = "Nouveau RDV pris";
      break;
    case "BOOKING_RESCHEDULED":
      icon = "🔄";
      title = "RDV reporté";
      break;
    case "BOOKING_CANCELLED":
      icon = "❌";
      title = "RDV annulé";
      break;
    case "BOOKING_REJECTED":
      icon = "🚫";
      title = "RDV refusé";
      break;
    case "BOOKING_REQUESTED":
      icon = "⏳";
      title = "RDV en attente";
      break;
    default:
      icon = "🔔";
      title = evt;
  }

  const lines = [
    `${icon} <b>${escapeHtml(title)}</b>`,
    "",
    `👤 <b>${escapeHtml(att.name || "—")}</b>`,
    `✉️ <code>${escapeHtml(att.email || "—")}</code>`,
    `🕒 ${escapeHtml(start)}`,
  ];

  if (data.title && data.title !== title) {
    lines.push(`📌 ${escapeHtml(data.title)}`);
  }
  if (data.location) {
    lines.push(`📍 ${escapeHtml(data.location)}`);
  }

  // Custom responses (entreprise, secteur, taille — selon les questions Cal.com)
  if (data.responses) {
    const interesting: string[] = [];
    for (const [key, val] of Object.entries(data.responses)) {
      if (["name", "email", "location"].includes(key)) continue;
      const value =
        typeof val === "string" ? val : (val?.value as string | undefined);
      const label =
        typeof val === "object" ? (val?.label as string | undefined) : undefined;
      if (value) {
        interesting.push(`▸ <b>${escapeHtml(label || key)}</b> : ${escapeHtml(value)}`);
      }
    }
    if (interesting.length) {
      lines.push("", ...interesting);
    }
  }

  if (data.additionalNotes) {
    lines.push("", `📝 <i>${escapeHtml(data.additionalNotes)}</i>`);
  }
  if (data.cancellationReason) {
    lines.push("", `🛑 <i>${escapeHtml(data.cancellationReason)}</i>`);
  }

  return lines.join("\n");
}

async function sendTelegram(text: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CRM_CHAT_ID) {
    throw new Error("Telegram env vars missing");
  }
  const body: Record<string, unknown> = {
    chat_id: TELEGRAM_CRM_CHAT_ID,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };
  if (TELEGRAM_CRM_RDV_THREAD_ID) {
    body.message_thread_id = Number(TELEGRAM_CRM_RDV_THREAD_ID);
  }
  const resp = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Telegram API ${resp.status}: ${errText}`);
  }
}

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!CAL_WEBHOOK_SECRET) return true; // No secret set = skip verification
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha256", CAL_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  // Constant-time compare
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Cal.com sends signature in `X-Cal-Signature-256`
  const sig =
    req.headers.get("x-cal-signature-256") ||
    req.headers.get("x-cal-signature") ||
    null;
  if (!verifySignature(raw, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: CalPayload;
  try {
    payload = JSON.parse(raw) as CalPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const text = buildMessage(payload);
    await sendTelegram(text);
  } catch (err) {
    console.error("[cal-webhook]", err);
    return NextResponse.json({ error: "Telegram send failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

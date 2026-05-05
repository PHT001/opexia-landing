import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { Resend } from "resend";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CRM_CHAT_ID = process.env.TELEGRAM_CRM_CHAT_ID;
const TELEGRAM_CRM_RDV_THREAD_ID = process.env.TELEGRAM_CRM_RDV_THREAD_ID;
const CAL_WEBHOOK_SECRET = process.env.CAL_WEBHOOK_SECRET;
const HOST_NOTIFY_EMAIL =
  process.env.HOST_NOTIFY_EMAIL || "opexiapro@gmail.com";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

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

function buildHostEmail(p: CalPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const evt = p.triggerEvent || "BOOKING";
  const data = p.payload || {};
  const att = data.attendees?.[0] || {};
  const tz = att.timeZone || data.organizer?.timeZone || "Europe/Paris";
  const start = fmtDate(data.startTime, tz);

  const labels: Record<string, { subject: string; banner: string; color: string }> = {
    BOOKING_CREATED: {
      subject: "Nouveau RDV pris",
      banner: "Nouveau RDV",
      color: "#2563EB",
    },
    BOOKING_RESCHEDULED: {
      subject: "RDV reporté",
      banner: "RDV reporté",
      color: "#d97706",
    },
    BOOKING_CANCELLED: {
      subject: "RDV annulé",
      banner: "RDV annulé",
      color: "#dc2626",
    },
    BOOKING_REQUESTED: {
      subject: "RDV en attente de validation",
      banner: "Demande de RDV",
      color: "#7c3aed",
    },
  };
  const meta =
    labels[evt] || { subject: evt, banner: evt, color: "#0a1628" };

  const responsesRows: string[] = [];
  const responsesText: string[] = [];
  if (data.responses) {
    for (const [key, val] of Object.entries(data.responses)) {
      if (["name", "email", "location"].includes(key)) continue;
      const value =
        typeof val === "string" ? val : (val?.value as string | undefined);
      const label =
        typeof val === "object" ? (val?.label as string | undefined) : undefined;
      if (value) {
        const niceLabel = escapeHtml(label || key);
        const niceValue = escapeHtml(value);
        responsesRows.push(
          `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;">${niceLabel}</td><td style="padding:6px 0;color:#0a1628;font-weight:600;font-size:14px;text-align:right;">${niceValue}</td></tr>`,
        );
        responsesText.push(`${label || key} : ${value}`);
      }
    }
  }

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><title>${escapeHtml(meta.subject)}</title></head>
<body style="margin:0;padding:24px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0a1628;">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(10,22,40,0.08);">
    <div style="background:${meta.color};padding:24px 28px;color:white;">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:0.8;font-weight:600;">OpexIA · Cal.com</div>
      <div style="font-size:24px;font-weight:800;margin-top:6px;letter-spacing:-0.5px;">📅 ${escapeHtml(meta.banner)}</div>
    </div>
    <div style="padding:28px;">
      <div style="font-size:18px;font-weight:700;margin-bottom:4px;">${escapeHtml(att.name || "—")}</div>
      <div style="font-size:14px;color:#64748b;margin-bottom:20px;"><a href="mailto:${escapeHtml(att.email || "")}" style="color:#2563EB;text-decoration:none;">${escapeHtml(att.email || "—")}</a></div>
      <div style="background:#f8fafc;border-radius:12px;padding:18px 20px;margin-bottom:18px;">
        <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#64748b;font-weight:600;margin-bottom:6px;">Créneau</div>
        <div style="font-size:16px;font-weight:700;color:#0a1628;">${escapeHtml(start)}</div>
        ${data.location ? `<div style="font-size:13px;color:#64748b;margin-top:4px;">📍 ${escapeHtml(data.location)}</div>` : ""}
      </div>
      ${
        responsesRows.length
          ? `<div style="border-top:1px solid #e2e8f0;padding-top:18px;margin-bottom:18px;">
        <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#64748b;font-weight:600;margin-bottom:10px;">Réponses</div>
        <table style="width:100%;border-collapse:collapse;">${responsesRows.join("")}</table>
      </div>`
          : ""
      }
      ${
        data.additionalNotes
          ? `<div style="background:#fffbeb;border-left:3px solid #f59e0b;padding:12px 16px;border-radius:6px;margin-bottom:18px;">
        <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#92400e;font-weight:600;margin-bottom:4px;">Notes</div>
        <div style="font-size:14px;color:#78350f;">${escapeHtml(data.additionalNotes)}</div>
      </div>`
          : ""
      }
      ${
        data.cancellationReason
          ? `<div style="background:#fef2f2;border-left:3px solid #dc2626;padding:12px 16px;border-radius:6px;margin-bottom:18px;">
        <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#991b1b;font-weight:600;margin-bottom:4px;">Motif d'annulation</div>
        <div style="font-size:14px;color:#7f1d1d;">${escapeHtml(data.cancellationReason)}</div>
      </div>`
          : ""
      }
      <div style="font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:14px;margin-top:8px;">UID booking : <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-family:Menlo,monospace;font-size:11px;">${escapeHtml(data.uid || "—")}</code></div>
    </div>
  </div>
  <div style="text-align:center;font-size:11px;color:#94a3b8;margin-top:18px;">Notification automatique · cal.com/opexia/30min</div>
</body>
</html>`;

  const textLines = [
    meta.banner.toUpperCase(),
    "",
    `Client : ${att.name || "—"}`,
    `Email : ${att.email || "—"}`,
    `Créneau : ${start}`,
  ];
  if (data.location) textLines.push(`Lieu : ${data.location}`);
  if (responsesText.length) {
    textLines.push("", ...responsesText);
  }
  if (data.additionalNotes) {
    textLines.push("", `Notes : ${data.additionalNotes}`);
  }
  if (data.cancellationReason) {
    textLines.push("", `Motif annulation : ${data.cancellationReason}`);
  }

  return {
    subject: `📅 ${meta.subject} — ${att.name || "client"} · ${start}`,
    html,
    text: textLines.join("\n"),
  };
}

async function sendHostEmail(p: CalPayload): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY missing");
  }
  const { subject, html, text } = buildHostEmail(p);
  const replyToEmail = p.payload?.attendees?.[0]?.email;
  const result = await getResend().emails.send({
    from: "OpexIA Bookings <bookings@opexia-agency.com>",
    to: [HOST_NOTIFY_EMAIL],
    replyTo: replyToEmail || undefined,
    subject,
    html,
    text,
  });
  if (result.error) {
    throw new Error(`Resend error: ${JSON.stringify(result.error)}`);
  }
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

  const tgText = buildMessage(payload);

  const [tgResult, mailResult] = await Promise.allSettled([
    sendTelegram(tgText),
    sendHostEmail(payload),
  ]);
  if (tgResult.status === "rejected") {
    console.error("[cal-webhook] telegram", tgResult.reason);
  }
  if (mailResult.status === "rejected") {
    console.error("[cal-webhook] host-email", mailResult.reason);
  }
  if (tgResult.status === "rejected" && mailResult.status === "rejected") {
    return NextResponse.json(
      { error: "All notifications failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    telegram: tgResult.status,
    email: mailResult.status,
  });
}

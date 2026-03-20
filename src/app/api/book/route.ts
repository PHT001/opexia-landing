import { NextResponse } from "next/server";
import { Resend } from "resend";
import { google } from "googleapis";

/* ───── Lazy-init Resend so builds don't crash without env vars ───── */
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const OWNER_EMAIL = process.env.OWNER_EMAIL || "contact@opexia-agency.com";

/* ───── HTML sanitization ───── */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ───── ICS value sanitization ───── */
function sanitizeICSValue(str: string): string {
  return str.replace(/[\r\n\\;,]/g, "");
}

/* ───── Input validation helpers ───── */
const SLOT_KEY_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_SECTORS = [
  "Commerce / Retail",
  "BTP / Artisanat",
  "Consulting / Services",
  "Santé / Bien-être",
  "Immobilier",
  "Formation / Coaching",
  "Industrie / Logistique",
  "Tech / Digital",
  "Autre",
];
const VALID_CONTACT_METHODS = ["Appel téléphonique", "Google Meet"];

/* ───── Simple in-memory rate limiter ───── */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

/* ───── Google Calendar auth ───── */
function getCalendarClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || "";
  const rawKey = process.env.GOOGLE_PRIVATE_KEY || "";
  // Key is base64 encoded to avoid newline issues on Vercel
  const privateKey = rawKey.startsWith("LS0t")
    ? Buffer.from(rawKey, "base64").toString("utf-8")
    : rawKey.replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  return google.calendar({ version: "v3", auth });
}

/* ───── Fetch booked slots from Google Calendar ───── */
async function getBookedSlotsFromCalendar(): Promise<string[]> {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  const now = new Date();
  const inSevenDays = new Date();
  inSevenDays.setDate(now.getDate() + 8);

  const res = await calendar.events.list({
    calendarId,
    timeMin: now.toISOString(),
    timeMax: inSevenDays.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    q: "Audit OpexIA",
  });

  const slots: string[] = [];
  for (const event of res.data.items || []) {
    if (event.start?.dateTime) {
      // Convert to "YYYY-MM-DDThh:mm" format in Europe/Paris
      const dt = new Date(event.start.dateTime);
      const parisTime = dt.toLocaleString("sv-SE", { timeZone: "Europe/Paris" });
      // "sv-SE" gives "YYYY-MM-DD HH:MM:SS"
      const slotKey = parisTime.slice(0, 16).replace(" ", "T");
      slots.push(slotKey);
    }
  }
  return slots;
}

/* ───── Create Google Calendar event ───── */
async function createCalendarEvent({
  name,
  email,
  sector,
  slotKey,
  contactMethod,
}: {
  name: string;
  email: string;
  sector: string;
  slotKey: string;
  contactMethod: string;
}) {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  const startDateTime = `${slotKey}:00`;
  const [date, time] = slotKey.split("T");
  const [hour, minute] = time.split(":");
  const h = parseInt(hour, 10);
  const endH = (h + 1) % 24;
  const endDate = endH < h ? (() => {
    const d = new Date(`${date}T${hour}:${minute}:00`);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })() : date;
  const endDateTime = `${endDate}T${String(endH).padStart(2, "0")}:${minute}:00`;

  await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `Audit OpexIA — ${name}`,
      description: `Prospect: ${name}\nEmail: ${email || "—"}\nSecteur: ${sector}\nMode: ${contactMethod}`,
      start: { dateTime: startDateTime, timeZone: "Europe/Paris" },
      end: { dateTime: endDateTime, timeZone: "Europe/Paris" },
      reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 15 }] },
    },
  });
}

/* ───── Generate .ics calendar invite ───── */
function generateICS({
  name,
  email,
  sector,
  slotKey,
  meetLink,
}: {
  name: string;
  email: string;
  sector: string;
  slotKey: string;
  meetLink: string;
}): string {
  const safeName = sanitizeICSValue(name);
  const safeEmail = sanitizeICSValue(email);
  const safeSector = sanitizeICSValue(sector);

  const [date, time] = slotKey.split("T");
  const [year, month, day] = date.split("-");
  const [hour, minute] = time.split(":");
  const startH = parseInt(hour, 10);
  const endH = (startH + 1) % 24;

  const dtStart = `${year}${month}${day}T${String(startH).padStart(2, "0")}${minute}00`;
  // Handle day rollover for endH
  let endDateStr: string;
  if (endH < startH) {
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day) + 1);
    endDateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  } else {
    endDateStr = `${year}${month}${day}`;
  }
  const dtEnd = `${endDateStr}T${String(endH).padStart(2, "0")}${minute}00`;

  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}T${String(now.getUTCHours()).padStart(2, "0")}${String(now.getUTCMinutes()).padStart(2, "0")}${String(now.getUTCSeconds()).padStart(2, "0")}Z`;
  const uid = `${slotKey}-${Date.now()}@opexia-agency.com`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//OpexIA//Booking//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Europe/Paris:${dtStart}`,
    `DTEND;TZID=Europe/Paris:${dtEnd}`,
    `SUMMARY:Audit OpexIA — ${safeName}`,
    `DESCRIPTION:Prospect: ${safeName}\\nEmail: ${safeEmail}\\nSecteur: ${safeSector}${meetLink ? `\\nGoogle Meet: ${meetLink}` : ""}`,
    `ORGANIZER;CN=OpexIA:mailto:${OWNER_EMAIL}`,
    `ATTENDEE;CN=${safeName}:mailto:${safeEmail || OWNER_EMAIL}`,
    meetLink ? `URL:${meetLink}` : "",
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:RDV dans 15 minutes",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

/* ───── GET: return booked slots from Google Calendar ───── */
export async function GET() {
  try {
    const booked = await getBookedSlotsFromCalendar();
    return NextResponse.json({ booked });
  } catch (err) {
    console.error("Failed to fetch booked slots:", err);
    return NextResponse.json({ error: "Impossible de récupérer les créneaux" }, { status: 500 });
  }
}

/* ───── POST: book a slot + send emails + add to Google Calendar ───── */
export async function POST(req: Request) {
  try {
    // Rate limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard" }, { status: 429 });
    }

    const body = await req.json();
    const { name, email, phone, sector, contactMethod, schedule, slotKey } = body;

    // Validate required fields are present and are strings
    if (
      !name || typeof name !== "string" ||
      !schedule || typeof schedule !== "string" ||
      !slotKey || typeof slotKey !== "string"
    ) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Validate slotKey format
    if (!SLOT_KEY_REGEX.test(slotKey)) {
      return NextResponse.json({ error: "Format de créneau invalide" }, { status: 400 });
    }

    // Validate email format if provided
    if (email && (typeof email !== "string" || !EMAIL_REGEX.test(email))) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // Validate sector
    if (!sector || typeof sector !== "string" || !VALID_SECTORS.includes(sector)) {
      return NextResponse.json({ error: "Secteur invalide" }, { status: 400 });
    }

    // Validate contactMethod
    if (!contactMethod || typeof contactMethod !== "string" || !VALID_CONTACT_METHODS.includes(contactMethod)) {
      return NextResponse.json({ error: "Mode de contact invalide" }, { status: 400 });
    }

    // Check if slot is already taken (from Google Calendar)
    let bookedSlots: string[];
    try {
      bookedSlots = await getBookedSlotsFromCalendar();
    } catch (err) {
      console.error("Calendar unavailable:", err);
      return NextResponse.json({ error: "Service calendrier indisponible" }, { status: 503 });
    }
    if (bookedSlots.includes(slotKey)) {
      return NextResponse.json({ error: "Créneau déjà pris" }, { status: 409 });
    }

    // Sanitize inputs for HTML emails
    const safeName = escapeHtml(name);
    const safeEmail = email ? escapeHtml(email) : "";
    const safePhone = phone ? escapeHtml(phone) : "";
    const safeSector = escapeHtml(sector);
    const safeContactMethod = escapeHtml(contactMethod);
    const safeSchedule = escapeHtml(schedule);

    const isGoogleMeet = contactMethod === "Google Meet";
    const isCall = contactMethod === "Appel téléphonique";
    const meetLink = process.env.GOOGLE_MEET_LINK || "";

    // Generate .ics calendar invite
    const icsContent = generateICS({ name, email: email || "", sector, slotKey, meetLink });
    const icsBase64 = Buffer.from(icsContent).toString("base64");

    // Add event to Google Calendar automatically
    await createCalendarEvent({ name, email: email || "", sector, slotKey, contactMethod });

    const resend = getResend();

    // Email to prospect
    if (email) {
      await resend.emails.send({
        from: `OpexIA <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
        to: email,
        subject: `Confirmation de votre RDV – ${safeSchedule}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 24px; font-weight: 700; color: #111; margin: 0;">OpexIA</h1>
            </div>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Bonjour ${safeName},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Votre audit gratuit est confirmé pour le <strong>${safeSchedule}</strong>.
            </p>
            ${isGoogleMeet && meetLink ? `
              <div style="background: #f0f7ff; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
                <p style="font-size: 14px; color: #666; margin: 0 0 12px 0;">Lien de la visioconférence :</p>
                <a href="${meetLink}" style="display: inline-block; background: #007AFF; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                  Rejoindre le Google Meet
                </a>
              </div>
            ` : isGoogleMeet ? `
              <div style="background: #f0f7ff; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="font-size: 14px; color: #666; margin: 0;">
                  Un lien Google Meet vous sera envoyé avant le rendez-vous.
                </p>
              </div>
            ` : `
              <div style="background: #f0fff4; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="font-size: 14px; color: #666; margin: 0;">
                  Nous vous appellerons au numéro indiqué.
                </p>
              </div>
            `}
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              Pendant l'audit, nous analyserons vos processus actuels et identifierons les automatisations qui vous feront gagner du temps immédiatement.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="font-size: 13px; color: #999; text-align: center;">
              OpexIA — Agence d'automatisation IA<br/>
              Une question ? Répondez directement à cet email.
            </p>
          </div>
        `,
        attachments: [
          {
            filename: "rdv-opexia.ics",
            content: icsBase64,
            contentType: "text/calendar; method=REQUEST",
          },
        ],
      });
    }

    // Email notification to owner (with .ics for Outlook)
    await resend.emails.send({
      from: `OpexIA Bot <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: OWNER_EMAIL,
      subject: `Nouveau RDV – ${safeName} · ${safeSchedule}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
          <h2 style="font-size: 20px; color: #111; margin: 0 0 20px 0;">Nouveau rendez-vous</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Nom</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${safeName}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Email</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${safeEmail || "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Téléphone</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${safePhone || "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Secteur</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${safeSector}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Mode</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${safeContactMethod}</td></tr>
            <tr style="background: #f0f7ff;"><td style="padding: 12px 8px; color: #007AFF; font-weight: 600; font-size: 14px;">Créneau</td><td style="padding: 12px 8px; font-weight: 700; font-size: 16px; color: #007AFF;">${safeSchedule}</td></tr>
          </table>
        </div>
      `,
      attachments: [
        {
          filename: "rdv-opexia.ics",
          content: icsBase64,
          contentType: "text/calendar; method=REQUEST",
        },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Booking error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

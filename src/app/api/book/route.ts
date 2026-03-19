import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const OWNER_EMAIL = "contact@opexia-agency.com";

/* In-memory store for booked slots (resets on cold start).
   Format: "2026-03-20T14:00" */
const bookedSlots = new Set<string>();

/* ───── Generate .ics calendar invite ───── */
function generateICS({
  name,
  email,
  sector,
  pain,
  slotKey,
  meetLink,
}: {
  name: string;
  email: string;
  sector: string;
  pain: string;
  slotKey: string;
  meetLink: string;
}): string {
  // slotKey format: "2026-03-20T14:00"
  const [date, time] = slotKey.split("T");
  const [year, month, day] = date.split("-");
  const [hour, minute] = time.split(":");
  const startH = parseInt(hour, 10);
  const endH = startH + 1;

  const dtStart = `${year}${month}${day}T${String(startH).padStart(2, "0")}${minute}00`;
  const dtEnd = `${year}${month}${day}T${String(endH).padStart(2, "0")}${minute}00`;
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
    `SUMMARY:Audit OpexIA — ${name}`,
    `DESCRIPTION:Prospect: ${name}\\nEmail: ${email}\\nSecteur: ${sector}\\nBesoin: ${pain}${meetLink ? `\\nGoogle Meet: ${meetLink}` : ""}`,
    `ORGANIZER;CN=OpexIA:mailto:${OWNER_EMAIL}`,
    `ATTENDEE;CN=${name}:mailto:${email || OWNER_EMAIL}`,
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

/* ───── GET: return booked slots ───── */
export async function GET() {
  return NextResponse.json({ booked: Array.from(bookedSlots) });
}

/* ───── POST: book a slot + send emails ───── */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, sector, pain, contactMethod, schedule, slotKey } = body;

    if (!name || !schedule || !slotKey) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if slot is already taken
    if (bookedSlots.has(slotKey)) {
      return NextResponse.json({ error: "Créneau déjà pris" }, { status: 409 });
    }

    // Book the slot
    bookedSlots.add(slotKey);

    const isGoogleMeet = contactMethod === "Google Meet";
    const meetLink = process.env.GOOGLE_MEET_LINK || "";

    // Generate .ics calendar invite
    const icsContent = generateICS({ name, email: email || "", sector, pain, slotKey, meetLink });
    const icsBase64 = Buffer.from(icsContent).toString("base64");

    // Email to prospect
    if (email) {
      await resend.emails.send({
        from: `OpexIA <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
        to: email,
        subject: `Confirmation de votre RDV – ${schedule}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 24px; font-weight: 700; color: #111; margin: 0;">OpexIA</h1>
            </div>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Bonjour ${name},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Votre audit gratuit est confirmé pour le <strong>${schedule}</strong>.
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
                  Nous vous appellerons sur WhatsApp au numéro indiqué.
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

    // Email notification to you (with .ics so it appears in Outlook calendar)
    await resend.emails.send({
      from: `OpexIA Bot <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: OWNER_EMAIL,
      subject: `Nouveau RDV – ${name} · ${schedule}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
          <h2 style="font-size: 20px; color: #111; margin: 0 0 20px 0;">Nouveau rendez-vous</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Nom</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Email</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${email || "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Téléphone</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${phone || "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Secteur</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${sector}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Besoin</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${pain}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">Mode</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${contactMethod}</td></tr>
            <tr style="background: #f0f7ff;"><td style="padding: 12px 8px; color: #007AFF; font-weight: 600; font-size: 14px;">Créneau</td><td style="padding: 12px 8px; font-weight: 700; font-size: 16px; color: #007AFF;">${schedule}</td></tr>
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
    console.error("Booking error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

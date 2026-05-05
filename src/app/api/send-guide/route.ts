import { NextResponse } from "next/server";
import { Resend } from "resend";
import { readFile } from "node:fs/promises";
import path from "node:path";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX_ENTRIES = 10_000;

function cleanupRateMap() {
  if (rateMap.size <= RATE_LIMIT_MAX_ENTRIES) return;
  const now = Date.now();
  for (const [key, entry] of rateMap) {
    if (now > entry.resetAt) rateMap.delete(key);
  }
}

function isRateLimited(ip: string): boolean {
  cleanupRateMap();
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 3600_000 });
    return false;
  }
  entry.count++;
  return entry.count > 50;
}

type TallyField = {
  key: string;
  label: string;
  type: string;
  value: unknown;
};

type TallyWebhookPayload = {
  eventType?: string;
  data?: {
    formId?: string;
    fields?: TallyField[];
  };
};

function extractEmail(payload: TallyWebhookPayload): string | null {
  const fields = payload?.data?.fields || [];
  for (const f of fields) {
    if (f.type === "INPUT_EMAIL" && typeof f.value === "string") {
      return f.value.trim();
    }
  }
  return null;
}

function renderEmailHtml(): string {
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <style>
    :root { color-scheme: light only; supported-color-schemes: light only; }
    @media (prefers-color-scheme: dark) {
      .opexia-bg { background:#f1f5f9 !important; }
      .opexia-card { background:#ffffff !important; }
      .opexia-h1 { color:#0a1628 !important; }
      .opexia-text { color:#334155 !important; }
      .opexia-strong { color:#2563EB !important; }
      .opexia-muted { color:#64748b !important; }
      .opexia-bonus-bg { background:#f0f7ff !important; }
      .opexia-cta-text { color:#ffffff !important; }
    }
  </style>
</head>
<body class="opexia-bg" style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,'Inter Tight',Segoe UI,sans-serif;color:#0a1628">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="opexia-bg" style="background:#f1f5f9;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" class="opexia-card" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 20px rgba(10,22,40,0.06)">
        <tr><td style="background:#0a1628;padding:32px 40px 28px">
          <div style="font-weight:800;font-size:28px;letter-spacing:-0.02em;color:#ffffff">
            <span style="color:#ffffff">Opex</span><span style="color:#60a5fa">IA</span>
          </div>
        </td></tr>
        <tr><td style="padding:36px 40px 8px">
          <h1 class="opexia-h1" style="font-size:28px;line-height:1.2;color:#0a1628;margin:0 0 16px;font-weight:800">
            Ton guide OpexIA est arrivé 📘
          </h1>
          <p class="opexia-text" style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 20px">
            Bien reçu, voilà <b class="opexia-strong" style="color:#2563EB">Comment automatiser vos processus par l'IA</b> en pièce jointe de ce mail.
          </p>
          <p class="opexia-text" style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 16px">
            À l'intérieur :
          </p>
          <ul class="opexia-text" style="color:#334155;font-size:15px;line-height:1.8;padding-left:20px;margin:0 0 28px">
            <li>Les 5 processus à automatiser en priorité (gain temps chiffré)</li>
            <li>Le ROI réel : -80% temps, +30% capacité, ROI en 4 à 8 semaines</li>
            <li>Le plan de déploiement en 30 jours, étape par étape</li>
            <li>Un cas client concret avec les chiffres avant/après</li>
          </ul>
        </td></tr>
        <tr><td style="padding:0 40px 36px">
          <div class="opexia-bonus-bg" style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:12px;padding:24px">
            <p style="font-size:13px;color:#2563EB;margin:0 0 8px;letter-spacing:0.1em;text-transform:uppercase;font-weight:700">Bonus</p>
            <p class="opexia-h1" style="font-size:16px;color:#0a1628;margin:0 0 18px;line-height:1.5">
              Envie qu'on regarde ensemble <b>tes</b> 2-3 processus les plus rentables à automatiser ?
            </p>
            <a href="https://cal.com/opexia/30min" class="opexia-cta-text" style="display:inline-block;background:#2563EB;color:#ffffff;font-weight:700;font-size:15px;padding:14px 26px;border-radius:10px;text-decoration:none">
              Réserver un audit 30 min (offert) →
            </a>
          </div>
        </td></tr>
        <tr><td style="padding:20px 40px 40px;border-top:1px solid #e2e8f0">
          <p class="opexia-muted" style="font-size:12px;color:#94a3b8;margin:0;line-height:1.5">
            OpexIA · Agence IA · automatisation des processus<br>
            Ce guide t'est envoyé parce que tu l'as demandé depuis LinkedIn.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  const expectedSecret = process.env.TALLY_WEBHOOK_SECRET;
  if (expectedSecret) {
    const receivedSecret =
      req.headers.get("tally-signature") ||
      req.headers.get("x-tally-secret") ||
      req.headers.get("x-webhook-secret");
    if (receivedSecret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let payload: TallyWebhookPayload;
  try {
    payload = (await req.json()) as TallyWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = extractEmail(payload);
  if (!email || !EMAIL_REGEX.test(email) || email.length > 200) {
    return NextResponse.json({ error: "Email invalide ou manquant" }, { status: 400 });
  }

  let pdfBuffer: Buffer;
  try {
    const pdfPath = path.join(process.cwd(), "public", "guides", "opexia-guide.pdf");
    pdfBuffer = await readFile(pdfPath);
  } catch {
    return NextResponse.json({ error: "Guide PDF introuvable" }, { status: 500 });
  }

  try {
    const resend = getResend();
    await resend.emails.send({
      from: "OpexIA <guide@opexia-agency.com>",
      to: [email],
      subject: "📘 Ton guide OpexIA — Automatiser vos processus par l'IA",
      html: renderEmailHtml(),
      attachments: [
        {
          filename: "guide-opexia.pdf",
          content: pdfBuffer,
        },
      ],
    });
  } catch (err) {
    console.error("[send-guide] Resend error:", err);
    return NextResponse.json({ error: "Erreur d'envoi" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

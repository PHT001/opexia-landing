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
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a1a35;font-family:-apple-system,'Inter Tight',Segoe UI,sans-serif;color:#fff">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#0a1a35;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:linear-gradient(145deg,#0a1a35 0%,#061230 100%);border-radius:16px;overflow:hidden;border:1px solid rgba(90,200,250,0.2)">
        <tr><td style="padding:40px 40px 20px">
          <div style="font-weight:800;font-size:28px;letter-spacing:-0.02em">
            <span style="color:#fff">Opex</span><span style="color:#5AC8FA">IA</span>
          </div>
        </td></tr>
        <tr><td style="padding:0 40px">
          <h1 style="font-size:28px;line-height:1.2;color:#fff;margin:0 0 16px;font-weight:800">
            Ton guide OpexIA est arrivé 📘
          </h1>
          <p style="font-size:16px;line-height:1.6;color:rgba(255,255,255,0.8);margin:0 0 20px">
            Bien reçu, voilà <b style="color:#5AC8FA">Les 10 automatisations IA les plus rentables pour ton cabinet comptable</b> en pièce jointe de ce mail.
          </p>
          <p style="font-size:16px;line-height:1.6;color:rgba(255,255,255,0.8);margin:0 0 24px">
            À l'intérieur :
          </p>
          <ul style="color:rgba(255,255,255,0.8);font-size:15px;line-height:1.8;padding-left:20px;margin:0 0 24px">
            <li>Les 3 tâches qui te bouffent 15h/semaine (et comment les tuer)</li>
            <li>Les outils IA que j'utilise chez mes clients (avec prix)</li>
            <li>Le plan de déploiement en 14 jours, étape par étape</li>
            <li>Les erreurs à éviter (vu chez 8 cabinets ce mois-ci)</li>
          </ul>
        </td></tr>
        <tr><td style="padding:0 40px 32px">
          <div style="background:linear-gradient(145deg,rgba(90,200,250,0.12),rgba(90,200,250,0.03));border:1px solid rgba(90,200,250,0.35);border-radius:12px;padding:24px">
            <p style="font-size:14px;color:rgba(255,255,255,0.7);margin:0 0 8px;letter-spacing:0.1em;text-transform:uppercase;font-weight:600">Bonus</p>
            <p style="font-size:16px;color:#fff;margin:0 0 16px;line-height:1.5">
              Envie qu'on regarde ensemble <b>tes</b> 2-3 processus les plus rentables à automatiser ?
            </p>
            <a href="https://cal.com/opexia/30min" style="display:inline-block;background:linear-gradient(135deg,#5AC8FA 0%,#4A9EFF 100%);color:#0a1a35;font-weight:700;font-size:15px;padding:12px 24px;border-radius:8px;text-decoration:none">
              Réserver un audit 30 min (offert) →
            </a>
          </div>
        </td></tr>
        <tr><td style="padding:20px 40px 40px;border-top:1px solid rgba(255,255,255,0.08)">
          <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:0;line-height:1.5">
            OpexIA · Agence IA française · Cabinets comptables<br>
            Ce guide t'es envoyé parce que tu l'as demandé depuis notre post LinkedIn.
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
      subject: "📘 Ton guide OpexIA — Les 10 automatisations IA rentables pour ton cabinet",
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

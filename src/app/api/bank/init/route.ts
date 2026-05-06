import { NextResponse } from "next/server";
import { createRequisition, listInstitutions } from "@/lib/gocardless";

const REDIRECT_URL = process.env.TALIX_BANK_REDIRECT || "talix://bank/connected";

/**
 * POST /api/bank/init
 * Body : { institutionId: string }
 *   Si institutionId absent, retourne la liste des banques FR.
 *   Si présent, crée une requisition et retourne { link, requisitionId }.
 */
export async function POST(req: Request) {
  let body: { institutionId?: string; country?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // Pas d'institutionId → renvoie la liste des banques (browse mode)
  if (!body.institutionId) {
    try {
      const country = (body.country || "FR").toUpperCase();
      const institutions = await listInstitutions(country);
      return NextResponse.json({
        institutions: institutions.map((i) => ({
          id: i.id,
          name: i.name,
          logo: i.logo,
          bic: i.bic,
          transactionDays: parseInt(i.transaction_total_days || "90", 10),
        })),
      });
    } catch (err) {
      console.error("[bank/init] listInstitutions", err);
      return NextResponse.json(
        { error: "Impossible de récupérer la liste des banques" },
        { status: 500 },
      );
    }
  }

  // institutionId fourni → on crée la requisition
  try {
    const r = await createRequisition({
      institutionId: body.institutionId,
      redirectUrl: REDIRECT_URL,
    });
    return NextResponse.json({
      requisitionId: r.id,
      link: r.link,
      status: r.status,
    });
  } catch (err) {
    console.error("[bank/init] createRequisition", err);
    return NextResponse.json(
      { error: "Échec de la création de la connexion bancaire" },
      { status: 500 },
    );
  }
}

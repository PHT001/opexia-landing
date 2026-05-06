import { NextResponse } from "next/server";
import { ensureUser, getUserToken, createConnectSession } from "@/lib/bridge";

const REDIRECT_URL =
  process.env.TALIX_BANK_REDIRECT || "talix://bank/connected";

/**
 * POST /api/bank/init
 * Body : { externalUserId: string, userEmail?: string }
 *   Crée (ou récupère) un user Bridge mappé sur externalUserId, retourne
 *   { url, sessionId } pour rediriger l'app vers la page de connexion banque.
 *   L'app iOS génère son externalUserId au 1er lancement (UUID stable).
 */
export async function POST(req: Request) {
  let body: { externalUserId?: string; userEmail?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  if (!body.externalUserId) {
    return NextResponse.json(
      { error: "externalUserId requis" },
      { status: 400 },
    );
  }

  try {
    await ensureUser(body.externalUserId);
    const auth = await getUserToken(body.externalUserId);
    const session = await createConnectSession({
      accessToken: auth.access_token,
      userEmail: body.userEmail || `${body.externalUserId}@talix.app`,
      callbackUrl: REDIRECT_URL,
      countryCode: "FR",
    });

    return NextResponse.json({
      sessionId: session.id,
      link: session.url,
      // Pour rétrocompat avec l'ancien client iOS : on renvoie aussi
      // requisitionId (qui pointe sur sessionId côté Bridge).
      requisitionId: session.id,
      status: "PENDING",
    });
  } catch (err) {
    console.error("[bank/init]", err);
    return NextResponse.json(
      { error: "Échec de la création de la connexion bancaire" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import {
  getRequisition,
  getAccountDetails,
  getAccountBalances,
} from "@/lib/gocardless";

/**
 * GET /api/bank/accounts?requisitionId=xxx
 * Retourne la liste des comptes liés à cette requisition + leurs détails + soldes.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const requisitionId = url.searchParams.get("requisitionId");
  if (!requisitionId) {
    return NextResponse.json(
      { error: "requisitionId requis" },
      { status: 400 },
    );
  }

  try {
    const r = await getRequisition(requisitionId);
    if (r.status !== "LN" && r.status !== "GA") {
      return NextResponse.json({
        status: r.status,
        accounts: [],
        message: statusLabel(r.status),
      });
    }

    const accounts = await Promise.all(
      r.accounts.map(async (accountId) => {
        const [details, balances] = await Promise.all([
          getAccountDetails(accountId).catch(() => null),
          getAccountBalances(accountId).catch(() => null),
        ]);
        const closing = balances?.balances.find(
          (b) => b.balanceType === "closingBooked" || b.balanceType === "expected",
        );
        return {
          id: accountId,
          iban: details?.account.iban || "",
          name: details?.account.name || details?.account.ownerName || "",
          owner: details?.account.ownerName || "",
          currency: details?.account.currency || "EUR",
          product: details?.account.product || "",
          balance: closing
            ? Number(closing.balanceAmount.amount)
            : null,
        };
      }),
    );

    return NextResponse.json({
      status: r.status,
      institutionId: r.institution_id,
      accounts,
    });
  } catch (err) {
    console.error("[bank/accounts]", err);
    return NextResponse.json(
      { error: "Échec de la récupération des comptes" },
      { status: 500 },
    );
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "CR":
      return "Connexion en cours de création.";
    case "LN":
      return "Lien actif.";
    case "GC":
      return "Consentement donné, en attente d'activation.";
    case "GA":
      return "Compte sélectionné.";
    case "EX":
      return "Connexion expirée. Reconnecte ta banque.";
    case "RJ":
      return "Connexion refusée.";
    default:
      return `Statut : ${status}`;
  }
}

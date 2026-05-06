import { NextResponse } from "next/server";
import { getAccountTransactions } from "@/lib/gocardless";

/**
 * GET /api/bank/transactions?accountId=xxx
 * Retourne les transactions des 90 derniers jours (booked + pending).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const accountId = url.searchParams.get("accountId");
  if (!accountId) {
    return NextResponse.json({ error: "accountId requis" }, { status: 400 });
  }

  try {
    const r = await getAccountTransactions(accountId);
    const all = [
      ...r.transactions.booked.map((t) => ({ ...t, status: "booked" as const })),
      ...r.transactions.pending.map((t) => ({ ...t, status: "pending" as const })),
    ];

    const normalized = all.map((tx) => {
      const amount = Number(tx.transactionAmount.amount);
      const labelParts = [
        tx.creditorName,
        tx.debtorName,
        tx.remittanceInformationUnstructured,
        ...(tx.remittanceInformationUnstructuredArray || []),
      ].filter(Boolean);
      const label =
        labelParts[0] || tx.remittanceInformationUnstructured || "Transaction";

      return {
        id: tx.transactionId || `${tx.bookingDate}-${amount}-${label}`,
        date: tx.bookingDate || tx.valueDate || "",
        label,
        amount,
        currency: tx.transactionAmount.currency,
        status: tx.status,
      };
    });

    // Tri du plus récent au plus ancien
    normalized.sort((a, b) => (a.date < b.date ? 1 : -1));

    return NextResponse.json({ transactions: normalized });
  } catch (err) {
    console.error("[bank/transactions]", err);
    return NextResponse.json(
      { error: "Échec de la récupération des transactions" },
      { status: 500 },
    );
  }
}

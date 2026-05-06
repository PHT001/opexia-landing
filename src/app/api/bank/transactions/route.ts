import { NextResponse } from "next/server";
import { getUserToken, listTransactions } from "@/lib/bridge";

/**
 * GET /api/bank/transactions?externalUserId=xxx&accountId=YYY
 * Pull les transactions d'un compte (ou tous si accountId absent).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const externalUserId = url.searchParams.get("externalUserId");
  const accountIdRaw = url.searchParams.get("accountId");
  if (!externalUserId) {
    return NextResponse.json(
      { error: "externalUserId requis" },
      { status: 400 },
    );
  }
  const accountId = accountIdRaw ? Number(accountIdRaw) : undefined;

  try {
    const auth = await getUserToken(externalUserId);
    const txs = await listTransactions(auth.access_token, accountId, 200);

    const normalized = txs.map((t) => ({
      id: String(t.id),
      date: t.date,
      label: t.description || t.raw_description || "Transaction",
      amount: t.amount,
      currency: t.currency_code || "EUR",
      status: t.is_future ? "pending" : "booked",
      accountId: String(t.account_id),
    }));

    return NextResponse.json({ transactions: normalized });
  } catch (err) {
    console.error("[bank/transactions]", err);
    return NextResponse.json(
      { error: "Échec de la récupération des transactions" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { getUserToken, listItems, listAccounts } from "@/lib/bridge";

/**
 * GET /api/bank/accounts?externalUserId=xxx
 * Récupère un access_token user, liste les items (banques connectées) et
 * pour chaque item ses comptes + soldes.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const externalUserId = url.searchParams.get("externalUserId");
  if (!externalUserId) {
    return NextResponse.json(
      { error: "externalUserId requis" },
      { status: 400 },
    );
  }

  try {
    const auth = await getUserToken(externalUserId);
    const [items, accounts] = await Promise.all([
      listItems(auth.access_token),
      listAccounts(auth.access_token),
    ]);

    // Indexe les items par id pour avoir le nom + logo de la banque
    const itemMap = new Map<number, (typeof items)[number]>();
    for (const it of items) itemMap.set(it.id, it);

    const enriched = accounts.map((a) => {
      const item = itemMap.get(a.item_id);
      return {
        id: String(a.id),
        iban: a.iban || "",
        name: a.name,
        owner: "",
        currency: a.currency_code || "EUR",
        product: a.type,
        balance: a.balance,
        bankName: item?.bank.name || "",
        bankLogo: item?.bank.logo_url || "",
        itemId: a.item_id,
      };
    });

    return NextResponse.json({
      status: "LN",
      institutionId: items[0]?.bank.id ? String(items[0].bank.id) : "",
      accounts: enriched,
    });
  } catch (err) {
    console.error("[bank/accounts]", err);
    return NextResponse.json(
      { error: "Échec de la récupération des comptes" },
      { status: 500 },
    );
  }
}

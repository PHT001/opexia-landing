// Bridge by Bankin' (PSD2 / Open Banking) — client minimal pour Talix.
// Doc : https://docs.bridgeapi.io/
//
// Headers obligatoires sur tous les appels :
//   Client-Id: <BRIDGE_CLIENT_ID>
//   Client-Secret: <BRIDGE_CLIENT_SECRET>
//   Bridge-Version: 2025-01-15
//   accept: application/json
//   content-type: application/json
//
// Auth scopée par END-USER :
//   1. POST /v3/aggregation/users   → crée un user Bridge mappé sur external_user_id
//   2. POST /v3/aggregation/authorization/token → renvoie un access_token (2h)
//   3. Bearer <access_token> sur tous les appels qui touchent les data utilisateur

const BASE = "https://api.bridgeapi.io";
const VERSION = "2025-01-15";

function appHeaders(): Record<string, string> {
  const id = process.env.BRIDGE_CLIENT_ID;
  const secret = process.env.BRIDGE_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error("Missing BRIDGE_CLIENT_ID / BRIDGE_CLIENT_SECRET");
  }
  return {
    "Client-Id": id,
    "Client-Secret": secret,
    "Bridge-Version": VERSION,
    accept: "application/json",
    "content-type": "application/json",
  };
}

// MARK: - Public types

export interface BridgeUser {
  uuid: string;
  external_user_id?: string | null;
}

export interface BridgeAuthToken {
  access_token: string;
  expires_at: string;
  user: BridgeUser;
}

export interface BridgeConnectSession {
  id: string;
  url: string;
}

export interface BridgeItem {
  id: number;
  status: number; // 0 = OK, sinon code d'erreur
  status_code_info?: string;
  status_code_description?: string;
  bank: { id: number; name: string; logo_url?: string };
  last_successful_refresh?: string | null;
  last_refresh_status?: number;
}

export interface BridgeAccount {
  id: number;
  name: string;
  balance: number;
  status: number; // 1 = OK
  status_code_info?: string;
  iban?: string | null;
  type: string; // checking / savings / credit_card / ...
  currency_code: string;
  item_id: number;
  bank_id: number;
}

export interface BridgeTransaction {
  id: number;
  account_id: number;
  description: string;
  raw_description?: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category_id?: number;
  is_deleted?: boolean;
  is_future?: boolean;
  show_client_side?: boolean;
  updated_at?: string;
  currency_code?: string;
}

// MARK: - Low-level fetch

interface ListResponse<T> {
  resources?: T[];
  pagination?: { next_uri?: string | null; previous_uri?: string | null };
}

async function appCall<T>(path: string, init: RequestInit = {}): Promise<T> {
  const resp = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...appHeaders(), ...(init.headers || {}) },
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Bridge ${path} → ${resp.status}: ${body}`);
  }
  return (await resp.json()) as T;
}

async function userCall<T>(
  accessToken: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const resp = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...appHeaders(),
      Authorization: `Bearer ${accessToken}`,
      ...(init.headers || {}),
    },
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Bridge ${path} → ${resp.status}: ${body}`);
  }
  return (await resp.json()) as T;
}

// MARK: - Public API — app-scoped

export async function ensureUser(externalUserId: string): Promise<BridgeUser> {
  // POST /v3/aggregation/users. Si l'external_user_id existe déjà côté
  // Bridge, on reçoit un 409 (already_exists_with_external_user_id) que l'on
  // rattrape pour retomber sur l'authorization endpoint.
  try {
    return await appCall<BridgeUser>("/v3/aggregation/users", {
      method: "POST",
      body: JSON.stringify({ external_user_id: externalUserId }),
    });
  } catch (e) {
    const msg = (e as Error).message;
    const alreadyExists =
      msg.includes("409") ||
      msg.includes("already_exists_with_external_user_id");
    if (!alreadyExists) throw e;
    const auth = await getUserToken(externalUserId);
    return auth.user;
  }
}

export async function getUserToken(
  externalUserId: string,
): Promise<BridgeAuthToken> {
  return await appCall<BridgeAuthToken>(
    "/v3/aggregation/authorization/token",
    {
      method: "POST",
      body: JSON.stringify({ external_user_id: externalUserId }),
    },
  );
}

// MARK: - Public API — user-scoped

export async function createConnectSession(args: {
  accessToken: string;
  userEmail: string;
  callbackUrl: string;
  countryCode?: string; // FR
}): Promise<BridgeConnectSession> {
  return await userCall<BridgeConnectSession>(
    args.accessToken,
    "/v3/aggregation/connect-sessions",
    {
      method: "POST",
      body: JSON.stringify({
        user_email: args.userEmail,
        callback_url: args.callbackUrl,
        country_code: args.countryCode || "FR",
      }),
    },
  );
}

export async function listItems(
  accessToken: string,
): Promise<BridgeItem[]> {
  const data = await userCall<ListResponse<BridgeItem>>(
    accessToken,
    "/v3/aggregation/items",
    { method: "GET" },
  );
  return data.resources || [];
}

export async function listAccounts(
  accessToken: string,
): Promise<BridgeAccount[]> {
  const data = await userCall<ListResponse<BridgeAccount>>(
    accessToken,
    "/v3/aggregation/accounts",
    { method: "GET" },
  );
  return data.resources || [];
}

export async function listTransactions(
  accessToken: string,
  accountId?: number,
  limit: number = 200,
): Promise<BridgeTransaction[]> {
  const params = new URLSearchParams();
  if (accountId) params.set("account_id", String(accountId));
  params.set("limit", String(limit));
  const data = await userCall<ListResponse<BridgeTransaction>>(
    accessToken,
    `/v3/aggregation/transactions?${params.toString()}`,
    { method: "GET" },
  );
  return data.resources || [];
}

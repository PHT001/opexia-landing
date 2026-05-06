// GoCardless Bank Account Data (anciennement Nordigen) — client minimal.
// Doc : https://developer.gocardless.com/bank-account-data/overview
//
// Auth flow : on utilise un access token court (24h) obtenu via /api/v2/token/new
// avec SECRET_ID + SECRET_KEY. Refresh via /token/refresh.

const BASE = "https://bankaccountdata.gocardless.com/api/v2";

interface TokenResponse {
  access: string;
  access_expires: number;
  refresh: string;
  refresh_expires: number;
}

interface CachedToken {
  access: string;
  expiresAt: number; // unix seconds
}

let cached: CachedToken | null = null;

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.expiresAt > now + 60) return cached.access;

  const secretId = process.env.GOCARDLESS_SECRET_ID;
  const secretKey = process.env.GOCARDLESS_SECRET_KEY;
  if (!secretId || !secretKey) {
    throw new Error("Missing GOCARDLESS_SECRET_ID / GOCARDLESS_SECRET_KEY");
  }

  const resp = await fetch(`${BASE}/token/new/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({ secret_id: secretId, secret_key: secretKey }),
  });
  if (!resp.ok) {
    throw new Error(`GoCardless auth failed: ${resp.status} ${await resp.text()}`);
  }
  const data = (await resp.json()) as TokenResponse;
  cached = {
    access: data.access,
    expiresAt: now + data.access_expires - 60,
  };
  return data.access;
}

async function gcRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const resp = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      authorization: `Bearer ${token}`,
      accept: "application/json",
      "content-type": "application/json",
    },
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`GoCardless ${path} → ${resp.status}: ${body}`);
  }
  return (await resp.json()) as T;
}

// MARK: - Public types

export interface Institution {
  id: string;
  name: string;
  bic: string;
  transaction_total_days: string;
  countries: string[];
  logo: string;
}

export interface RequisitionResponse {
  id: string;
  redirect: string;
  status: string;
  agreements: string;
  accounts: string[];
  link: string; // URL where the user signs in to their bank
  reference?: string;
  institution_id: string;
}

export interface AccountDetails {
  account: {
    iban?: string;
    name?: string;
    ownerName?: string;
    currency?: string;
    product?: string;
    status?: string;
  };
}

export interface AccountBalance {
  balanceAmount: { amount: string; currency: string };
  balanceType: string;
  referenceDate?: string;
}

export interface AccountTransaction {
  transactionId?: string;
  bookingDate?: string;
  valueDate?: string;
  transactionAmount: { amount: string; currency: string };
  remittanceInformationUnstructured?: string;
  remittanceInformationUnstructuredArray?: string[];
  creditorName?: string;
  debtorName?: string;
}

// MARK: - Public API

export async function listInstitutions(country: string): Promise<Institution[]> {
  return gcRequest<Institution[]>(
    `/institutions/?country=${encodeURIComponent(country)}`,
    { method: "GET" },
  );
}

export async function createRequisition(args: {
  institutionId: string;
  redirectUrl: string; // ex: talix://bank/connected
  reference?: string;
}): Promise<RequisitionResponse> {
  return gcRequest<RequisitionResponse>("/requisitions/", {
    method: "POST",
    body: JSON.stringify({
      institution_id: args.institutionId,
      redirect: args.redirectUrl,
      reference: args.reference ?? `talix-${Date.now()}`,
      user_language: "FR",
    }),
  });
}

export async function getRequisition(id: string): Promise<RequisitionResponse> {
  return gcRequest<RequisitionResponse>(`/requisitions/${id}/`, {
    method: "GET",
  });
}

export async function getAccountDetails(
  accountId: string,
): Promise<AccountDetails> {
  return gcRequest<AccountDetails>(`/accounts/${accountId}/details/`, {
    method: "GET",
  });
}

export async function getAccountBalances(
  accountId: string,
): Promise<{ balances: AccountBalance[] }> {
  return gcRequest<{ balances: AccountBalance[] }>(
    `/accounts/${accountId}/balances/`,
    { method: "GET" },
  );
}

export async function getAccountTransactions(
  accountId: string,
): Promise<{
  transactions: { booked: AccountTransaction[]; pending: AccountTransaction[] };
}> {
  return gcRequest<{
    transactions: {
      booked: AccountTransaction[];
      pending: AccountTransaction[];
    };
  }>(`/accounts/${accountId}/transactions/`, { method: "GET" });
}

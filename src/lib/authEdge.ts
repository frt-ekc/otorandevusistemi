// Oturum doğrulama yardımcıları.
// Bu dosya hem middleware'de (edge) hem sunucuda çalışır; bu yüzden sadece fetch kullanır,
// Node'a özel paket içermez.

export const ACCESS_COOKIE = "sb-access-token";
export const REFRESH_COOKIE = "sb-refresh-token";

export type AuthUser = { id: string; email: string | null };
export type Session = { access_token: string; refresh_token: string; expires_in: number };

function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
}

function anonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

// İsteğe bağlı izin listesi: ADMIN_EMAILS="a@x.com,b@y.com"
// Tanımlıysa sadece bu adresler admin paneline girebilir.
function isAllowedEmail(email: string | null) {
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (list.length === 0) return true;
  return Boolean(email && list.includes(email.toLowerCase()));
}

// Token'ı Supabase'e sorar: geçerliyse kullanıcıyı, değilse null döner.
// Daha önce sadece çerezin VAR olup olmadığına bakılıyordu; sahte bir çerez yetiyordu.
export async function verifyAccessToken(token: string | undefined | null): Promise<AuthUser | null> {
  if (!token || !supabaseUrl() || !anonKey()) return null;
  try {
    const res = await fetch(`${supabaseUrl()}/auth/v1/user`, {
      headers: { apikey: anonKey(), Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (!res.ok) return null;
    const user = (await res.json()) as { id?: string; email?: string | null };
    if (!user.id || !isAllowedEmail(user.email ?? null)) return null;
    return { id: user.id, email: user.email ?? null };
  } catch {
    return null;
  }
}

// Token'ın süresi dolmuş mu? Sadece içindeki "exp" alanına bakar, Supabase'e SORMAZ;
// yani gerçek doğrulama değildir. Middleware bunu "yenilemek gerekiyor mu" kararı için
// kullanır. Asıl kontrol sayfada ve her server action'da requireAdmin() ile yapılır.
export function tokenSuresiGecerli(token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    const govde = token.split(".")[1];
    if (!govde) return false;
    const json = JSON.parse(atob(govde.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(govde.length / 4) * 4, "=")));
    return typeof json.exp === "number" && json.exp * 1000 > Date.now() + 30_000;
  } catch {
    return false;
  }
}

// Süresi dolan access token'ı refresh token ile yeniler.
export async function refreshSession(refreshToken: string | undefined | null): Promise<Session | null> {
  if (!refreshToken || !supabaseUrl() || !anonKey()) return null;
  try {
    const res = await fetch(`${supabaseUrl()}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: anonKey(), "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store"
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<Session>;
    if (!data.access_token || !data.refresh_token) return null;
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in ?? 3600
    };
  } catch {
    return null;
  }
}

export const COOKIE_OPTIONS = {
  httpOnly: true, // JavaScript çerezi okuyamaz
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/"
};

// Refresh token 7 gün geçerli kalsın; access token kendi süresi kadar.
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

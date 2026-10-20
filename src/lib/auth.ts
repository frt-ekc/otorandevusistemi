import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, verifyAccessToken, type AuthUser } from "@/lib/authEdge";

// Admin sayfası ve admin işlemlerinin (server action) en başında çağrılır.
// Middleware zaten kontrol ediyor; bu ikinci kat, server action'lar doğrudan
// çağrılsa bile yetkisiz kimsenin veri değiştirememesini garanti eder.
export async function requireAdmin(): Promise<AuthUser> {
  const cookieStore = await cookies();
  const user = await verifyAccessToken(cookieStore.get(ACCESS_COOKIE)?.value);
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}

// Kazanç sayfasını görebilecek hesaplar: KAZANC_EMAILS="patron@x.com,ortak@y.com"
// Depo herkese açık olduğu için liste kodda değil Vercel ortam değişkeninde tutulur.
// Tanımlı değilse kimse göremez: çalışan hesabına yanlışlıkla açılmasın.
export function kazancGorebilir(user: AuthUser) {
  const list = (process.env.KAZANC_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(user.email && list.includes(user.email.toLowerCase()));
}

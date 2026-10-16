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

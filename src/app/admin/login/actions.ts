"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import {
  ACCESS_COOKIE,
  COOKIE_OPTIONS,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  verifyAccessToken
} from "@/lib/authEdge";

// Giriş artık sunucuda yapılıyor ve token'lar httpOnly çerezde tutuluyor.
// Böylece tarayıcıdaki JavaScript (ve olası XSS) token'ı okuyamaz.
export async function loginAction(email: string, password: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !anon) {
    return { ok: false, message: "Sunucu yapılandırması eksik." };
  }

  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password
  });
  if (error || !data.session) {
    return { ok: false, message: "E-posta veya şifre hatalı." };
  }

  // İzin listesi (ADMIN_EMAILS) tanımlıysa burada da kontrol edilir
  if (!(await verifyAccessToken(data.session.access_token))) {
    return { ok: false, message: "Bu hesabın admin paneline erişim yetkisi yok." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, data.session.access_token, {
    ...COOKIE_OPTIONS,
    maxAge: data.session.expires_in ?? 3600
  });
  cookieStore.set(REFRESH_COOKIE, data.session.refresh_token, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_MAX_AGE
  });
  return { ok: true };
}

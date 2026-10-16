import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  COOKIE_OPTIONS,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  refreshSession,
  tokenSuresiGecerli
} from "@/lib/authEdge";

const LOGIN_PATH = "/admin/login";

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = LOGIN_PATH;
  url.search = "";
  url.searchParams.set("from", req.nextUrl.pathname);
  const res = NextResponse.redirect(url);
  // Geçersiz çerezleri temizle
  res.cookies.delete(ACCESS_COOKIE);
  res.cookies.delete(REFRESH_COOKIE);
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Login sayfası korunmaz
  if (pathname.startsWith(LOGIN_PATH)) {
    return NextResponse.next();
  }

  // 1) Token var ve süresi dolmamışsa geçir. Burada Supabase'e sorulmaz: sayfa ve her
  //    server action requireAdmin() ile token'ı zaten Supabase'e doğrulatıyor. Önceden
  //    burada da sorulduğu için her tıklamada aynı kontrol iki kez yapılıyordu.
  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
  if (tokenSuresiGecerli(accessToken)) {
    return NextResponse.next();
  }

  // 2) Süresi dolduysa refresh token ile sessizce yenile (Supabase'den gelen yeni token)
  const session = await refreshSession(req.cookies.get(REFRESH_COOKIE)?.value);
  if (!session) {
    return redirectToLogin(req);
  }

  // Yeni token'ı hem bu isteğe (sayfa ve server action'lar görsün) hem tarayıcıya yaz
  req.cookies.set(ACCESS_COOKIE, session.access_token);
  req.cookies.set(REFRESH_COOKIE, session.refresh_token);
  const res = NextResponse.next({ request: { headers: req.headers } });
  res.cookies.set(ACCESS_COOKIE, session.access_token, {
    ...COOKIE_OPTIONS,
    maxAge: session.expires_in
  });
  res.cookies.set(REFRESH_COOKIE, session.refresh_token, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_MAX_AGE
  });
  return res;
}

export const config = {
  matcher: ["/admin/:path*"]
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIX = "/admin";
const LOGIN_PATH = "/admin/login";
const AUTH_COOKIE = "sb-access-token";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith(PROTECTED_PREFIX)) {
    return NextResponse.next();
  }

  if (pathname.startsWith(LOGIN_PATH)) {
    // Login sayfasını korumuyoruz
    return NextResponse.next();
  }

  const hasAuth = Boolean(req.cookies.get(AUTH_COOKIE)?.value);
  if (hasAuth) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = LOGIN_PATH;
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"]
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 1) Public portal URLs → internal app routes (`NextResponse.rewrite`) so App Router finds
 *    `app/super-admin`, `app/admin-panel`, `app/customer-panel` (next.config rewrites alone
 *    often 404 in App Router because they run after filesystem).
 * 2) Legacy `/super-admin`, `/admin-panel`, `/customer-panel` → canonical URLs (redirect).
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // —— Canonical URLs → internal (must run before legacy redirect block) ——
  if (pathname.startsWith("/platform-admin")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/platform-admin/, "/super-admin");
    url.search = search;
    return NextResponse.rewrite(url);
  }
  if (pathname.startsWith("/platform-super-admin")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/platform-super-admin/, "/super-admin");
    url.search = search;
    return NextResponse.rewrite(url);
  }
  if (pathname.startsWith("/subscriber-admin")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/subscriber-admin/, "/admin-panel");
    url.search = search;
    return NextResponse.rewrite(url);
  }
  if (pathname.startsWith("/subscriber-super-admin")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/subscriber-super-admin/, "/admin-panel");
    url.search = search;
    return NextResponse.rewrite(url);
  }
  if (pathname === "/customer" || pathname.startsWith("/customer/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/customer/, "/customer-panel");
    url.search = search;
    return NextResponse.rewrite(url);
  }

  // —— Legacy internal URLs → canonical (browser bar) ——
  const role = request.cookies.get("canonical_role")?.value ?? "";

  if (pathname === "/super-admin" || pathname.startsWith("/super-admin/")) {
    const base = role === "PLATFORM_ADMIN" ? "/platform-admin" : "/platform-super-admin";
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/super-admin/, base);
    url.search = search;
    return NextResponse.redirect(url);
  }

  if (pathname === "/admin-panel" || pathname.startsWith("/admin-panel/")) {
    const base = role === "SUBSCRIBER_SUPER_ADMIN" ? "/subscriber-super-admin" : "/subscriber-admin";
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/admin-panel/, base);
    url.search = search;
    return NextResponse.redirect(url);
  }

  if (pathname === "/customer-panel" || pathname.startsWith("/customer-panel/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/customer-panel/, "/customer");
    url.search = search;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/platform-admin",
    "/platform-admin/:path*",
    "/platform-super-admin",
    "/platform-super-admin/:path*",
    "/subscriber-admin",
    "/subscriber-admin/:path*",
    "/subscriber-super-admin",
    "/subscriber-super-admin/:path*",
    "/customer",
    "/customer/:path*",
    "/super-admin",
    "/super-admin/:path*",
    "/admin-panel",
    "/admin-panel/:path*",
    "/customer-panel",
    "/customer-panel/:path*",
  ],
};

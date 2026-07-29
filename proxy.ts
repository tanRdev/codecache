import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { isMarketingDeployment } from "@/lib/deployment-mode";

const BYPASS_PREFIXES = ["/_next", "/api"];
const BYPASS_EXACT = new Set(["/favicon.ico", "/icon.svg", "/robots.txt", "/sitemap.xml"]);
const STATIC_FILE_PATTERN = /\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/;

const PROTECTED_ROUTES = ["/dashboard", "/snippets", "/settings", "/auth/cli"];

export function shouldBypassProxy(pathname: string) {
  if (BYPASS_EXACT.has(pathname)) {
    return true;
  }

  if (BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  return STATIC_FILE_PATTERN.test(pathname);
}

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function handleProtectedRoute(request: NextRequest, pathname: string, isAuthenticated: boolean) {
  const callbackPath = `${pathname}${request.nextUrl.search}`;

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const redirectUrl = new URL("/sign-in", request.url);
    redirectUrl.searchParams.set("callbackUrl", callbackPath);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthenticated && pathname === "/sign-in") {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");

    if (callbackUrl?.startsWith("/")) {
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return null;
}

export function shouldAllowMarketingRoute(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/api/health" ||
    pathname.startsWith("/_next/") ||
    (pathname === "/docs" || pathname.startsWith("/docs/")) ||
    BYPASS_EXACT.has(pathname) ||
    STATIC_FILE_PATTERN.test(pathname)
  );
}

function handleMarketingRoute(request: NextRequest, pathname: string) {
  if (shouldAllowMarketingRoute(pathname)) {
    return null;
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "not_available",
          message: "The hosted site contains product documentation only. Run Cache locally to use the API.",
        },
      },
      { status: 404 }
    );
  }

  return NextResponse.redirect(new URL("/docs/getting-started/installation", request.url));
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isMarketingDeployment()) {
    const marketingResponse = handleMarketingRoute(request, pathname);

    if (marketingResponse) {
      return marketingResponse;
    }

    return NextResponse.next();
  }

  if (shouldBypassProxy(pathname)) {
    return NextResponse.next();
  }

  const session = await auth();
  const isAuthenticated = Boolean(session?.user?.id);
  const redirectResponse = handleProtectedRoute(request, pathname, isAuthenticated);

  if (redirectResponse) {
    return redirectResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};

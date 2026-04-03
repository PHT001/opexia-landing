import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* ───── Allowed origins for CSRF protection ───── */
const ALLOWED_ORIGINS = new Set([
  "https://opexia-agency.com",
  "https://www.opexia-agency.com",
]);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  // Allow localhost in development
  if (
    process.env.NODE_ENV !== "production" &&
    /^https?:\/\/localhost(:\d+)?$/.test(origin)
  ) {
    return true;
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* ───── API routes protection ───── */
  if (pathname.startsWith("/api/")) {
    // Block non-GET/POST methods
    if (!["GET", "POST"].includes(request.method)) {
      return NextResponse.json(
        { error: "Méthode non autorisée" },
        { status: 405 }
      );
    }

    // CSRF: validate Origin on all POST requests
    if (request.method === "POST") {
      const origin = request.headers.get("origin");
      if (!isAllowedOrigin(origin)) {
        return NextResponse.json(
          { error: "Origine non autorisée" },
          { status: 403 }
        );
      }

      // Validate Content-Type
      const contentType = request.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        return NextResponse.json(
          { error: "Content-Type invalide" },
          { status: 415 }
        );
      }
    }

    // Add security headers to API responses
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};

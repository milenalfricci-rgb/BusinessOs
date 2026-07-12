import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, computeSessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const expected = await computeSessionToken(process.env.SITE_PASSWORD ?? "");

  if (cookie && cookie === expected) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Everything except the login page itself, static assets, and Next.js
  // internals — those must stay reachable so the login page can render.
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
};

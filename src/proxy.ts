import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSessionToken } from "@/lib/auth";

// Sends signed-out visitors to the admin login page (and signed-in ones away from it).
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const loggedIn = !!(await readSessionToken(request.cookies.get(SESSION_COOKIE)?.value));

  if (pathname === "/admin/login") {
    return loggedIn ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next();
  }
  if (!loggedIn) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };

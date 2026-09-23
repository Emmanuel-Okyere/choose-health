import { NextResponse, type NextRequest } from "next/server";

// HTTP Basic auth for the admin dashboard (username "admin", password from ADMIN_PASSWORD).
export function proxy(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  const header = request.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");

  if (password && scheme === "Basic" && encoded) {
    const [user, ...rest] = atob(encoded).split(":");
    if (user === "admin" && rest.join(":") === password) return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Natural Health admin"' },
  });
}

export const config = { matcher: ["/admin/:path*"] };

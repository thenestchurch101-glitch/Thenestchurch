import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  requestHeaders.set("x-app-section", isAdminRoute ? "admin" : "site");
  requestHeaders.set("x-current-path", pathname);
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

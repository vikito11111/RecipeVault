import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

const protectedRoutes = ["/dashboard", "/profile", "/recipes/new", "/admin"];
const adminRoutes = ["/admin"];
const authRoutes = ["/auth/login", "/auth/register"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const session = token ? verifyToken(token) : null;
  const pathname = request.nextUrl.pathname;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAdmin = adminRoutes.some((r) => pathname.startsWith(r));
  const isAuth = authRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdmin && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAuth && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

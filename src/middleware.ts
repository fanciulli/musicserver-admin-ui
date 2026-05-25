import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/auth/");
  const isApiAuthRoute = pathname.startsWith("/api/auth/");
  const hasToken = request.cookies.has("session_token");

  if (isAuthPage || isApiAuthRoute) {
    if (isAuthPage && hasToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!hasToken) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|css|fonts|js).*)",
  ],
};

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;
    if (path.startsWith("/admin") && role !== "admin") return NextResponse.redirect(new URL("/dashboard", req.url));
    if (path.startsWith("/guru") && role !== "guru") return NextResponse.redirect(new URL("/dashboard", req.url));
  },
  {
    pages: { signIn: "/login" },
    callbacks: { authorized: ({ token }) => !!token },
  }
);

export const config = { matcher: ["/admin/:path*", "/guru/:path*", "/dashboard/:path*"] };

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (token?.status === "pending" && path !== "/auth/pending") {
      return NextResponse.redirect(new URL("/auth/pending", req.url))
    }

    if (token?.status === "rejected" && path !== "/auth/pending") {
      return NextResponse.redirect(new URL("/auth/pending", req.url))
    }

    if (path.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    if (token?.status === "approved" && path === "/auth/pending") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
)

export const config = {
  matcher: ["/cart", "/checkout/:path*", "/orders", "/admin/:path*", "/auth/pending"],
}

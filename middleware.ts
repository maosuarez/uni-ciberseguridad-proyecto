import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/login", // ruta a tu login
  },
})

export const config = {
  matcher: [
    "/",           // protege la página principal
    "/admin/:path*", // protege todas las rutas de admin
  ],
}

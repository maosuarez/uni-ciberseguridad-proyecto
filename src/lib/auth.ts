import type { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos")
        }

        // Validación de entrada para prevenir inyecciones
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(credentials.email)) {
          throw new Error("Email inválido")
        }

        const user = await prisma.profile.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error("Credenciales inválidas")
        }

        if (user.status !== "approved") {
          throw new Error("Tu cuenta está pendiente de aprobación por un administrador")
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Credenciales inválidas")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          image: user.avatar_url,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        const dbUser = await prisma.profile.findUnique({
          where: { id: user.id },
          select: { role: true, status: true },
        })
        token.role = dbUser?.role || "user"
        token.status = dbUser?.status || "pending"
      }

      if (trigger === "update" && token.id) {
        const dbUser = await prisma.profile.findUnique({
          where: { id: token.id as string },
          select: { role: true, status: true },
        })
        token.role = dbUser?.role || "user"
        token.status = dbUser?.status || "pending"
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.status = token.status as string
      }
      return session
    },
    async signIn({ user, account }) {
      // Si es OAuth (Google), verificar y actualizar status si es necesario
      if (account?.provider === "google") {
        const dbUser = await prisma.profile.findUnique({
          where: { email: user.email! },
        })

        // Si el usuario no está aprobado, bloquear el acceso
        if (dbUser && dbUser.status !== "approved") {
          return false
        }
      }
      return true
    },
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
}

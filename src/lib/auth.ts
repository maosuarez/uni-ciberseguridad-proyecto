// src/lib/auth.ts
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
        if (!credentials?.email || !credentials?.password)
          throw new Error("Por favor ingresa email y contraseña")

        const user = await prisma.profile.findUnique({
          where: { email: credentials.email },
        })

        if (!user) throw new Error("Usuario no encontrado")
        if (!user.password) throw new Error("Este usuario solo puede iniciar sesión con Google")
        if (user.status !== "approved")
          throw new Error("Tu cuenta está pendiente de aprobación por un administrador")

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) throw new Error("Contraseña incorrecta")

        return {
          id: user.id,
          name: user.full_name,
          email: user.email,
          image: user.avatar_url,
          role: user.role || "user",
          status: user.status || "pending",
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login", // página de login
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  jwt: { maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role || "user"
        token.status = user.status || "pending"
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
    async redirect({ url, baseUrl }) {
      // Redirección después de login y logout
      if (url === "/") return "/"
      return baseUrl
    },
  },
}

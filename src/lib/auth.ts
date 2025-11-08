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
  try {
    if (!credentials?.email || !credentials?.password) return null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) return null;

    const user = await prisma.profile.findUnique({ where: { email: credentials.email } });
    if (!user || !user.password || user.status !== "approved") return null;

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) return null;

    return {
      id: user.id,
      name: user.full_name,
      email: user.email,
      image: user.avatar_url,
      role: user.role,
      status: user.status,
      is_admin: user.is_admin,
    };
  } catch (err) {
    console.error("Authorize error:", err);
    return null;
  }
}
,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = user.role || "user"
        token.status = user.status || "pending"
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
      if (account?.provider === "google") {
        const dbUser = await prisma.profile.findUnique({
          where: { email: user.email! },
        })
        if (!dbUser) return false
        if (dbUser.status !== "approved") return false
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

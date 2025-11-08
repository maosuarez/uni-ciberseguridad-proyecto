// src/lib/auth-utils.ts
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"
import { redirect } from "next/navigation"

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.status !== "approved") {
    redirect("/auth/login") // Next.js App Router redirect
  }

  // Retornamos solo user, ya tipado según next-auth.d.ts
  return session.user
}

// Devuelve la sesión actual (para mostrar info del usuario)
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user ?? null
}

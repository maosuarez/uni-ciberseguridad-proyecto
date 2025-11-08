// src/app/auth/signup/page.tsx
import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import SignUpForm from "./SignUpForm"

export default async function SignUpPage() {
  const user = await getCurrentUser()

  if (user?.status === "approved") {
    redirect("/") // Redirige a Home si ya está logueado
  }

  return <SignUpForm />
}

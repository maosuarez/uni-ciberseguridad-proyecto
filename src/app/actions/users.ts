"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function approveUser(userId: string) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    throw new Error("No autorizado")
  }

  try {
    await prisma.profile.update({
      where: { id: userId },
      data: { status: "approved" },
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error al aprobar usuario:", error)
    throw new Error("Error al aprobar usuario")
  }
}

export async function rejectUser(userId: string) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    throw new Error("No autorizado")
  }

  try {
    await prisma.profile.update({
      where: { id: userId },
      data: { status: "rejected" },
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error al rechazar usuario:", error)
    throw new Error("Error al rechazar usuario")
  }
}

export async function changeUserRole(userId: string, newRole: string) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    throw new Error("No autorizado")
  }

  if (newRole !== "user" && newRole !== "admin") {
    throw new Error("Rol inválido")
  }

  try {
    await prisma.profile.update({
      where: { id: userId },
      data: { role: newRole },
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error al cambiar rol:", error)
    throw new Error("Error al cambiar rol")
  }
}

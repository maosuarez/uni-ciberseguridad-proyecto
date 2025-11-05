"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

export async function createCoupon(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    return { error: "No autorizado" }
  }

  let code = formData.get("code") as string
  const discount = Number.parseFloat(formData.get("discount") as string)
  const description = formData.get("description") as string
  const expiresAt = formData.get("expiresAt") as string
  const maxUses = formData.get("maxUses") as string

  // Validaciones
  if (discount < 1 || discount > 100) {
    return { error: "El descuento debe estar entre 1 y 100" }
  }

  // Generar código si no se proporciona
  if (!code || code.trim() === "") {
    code = `COUPON-${crypto.randomBytes(4).toString("hex").toUpperCase()}`
  }

  // Validar que el código no exista
  const existingCoupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  })

  if (existingCoupon) {
    return { error: "El código de cupón ya existe" }
  }

  try {
    // Generar hash del código para validación segura
    const hash = crypto.createHash("sha256").update(code.toUpperCase()).digest("hex")

    await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        hash,
        discount,
        description: description || null,
        expires_at: expiresAt ? new Date(expiresAt) : null,
        maxUses: maxUses ? Number.parseInt(maxUses) : null,
      },
    })

    revalidatePath("/admin/coupons")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error al crear cupón:", error)
    return { error: "Error al crear cupón" }
  }
}

export async function deleteCoupon(couponId: string) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    throw new Error("No autorizado")
  }

  try {
    await prisma.coupon.delete({
      where: { id: couponId },
    })

    revalidatePath("/admin/coupons")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error al eliminar cupón:", error)
    throw new Error("Error al eliminar cupón")
  }
}

export async function toggleCouponStatus(couponId: string) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    throw new Error("No autorizado")
  }

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    })

    if (!coupon) {
      throw new Error("Cupón no encontrado")
    }

    await prisma.coupon.update({
      where: { id: couponId },
      data: { active: !coupon.active },
    })

    revalidatePath("/admin/coupons")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error al cambiar estado del cupón:", error)
    throw new Error("Error al cambiar estado del cupón")
  }
}

export async function validateCoupon(code: string, user_id: string) {
  try {
    // Generar hash del código ingresado
    const inputHash = crypto.createHash("sha256").update(code.toUpperCase()).digest("hex")

    // Buscar cupón por hash para validación segura
    const coupon = await prisma.coupon.findUnique({
      where: { hash: inputHash },
      include: {
        used_by: {
          where: { user_id },
        },
      },
    })

    if (!coupon) {
      return { error: "Cupón inválido" }
    }

    if (!coupon.active) {
      return { error: "Cupón inactivo" }
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return { error: "Cupón expirado" }
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { error: "Cupón agotado" }
    }

    // Verificar si el usuario tiene este cupón asignado
    const userCoupon = coupon.used_by[0]
    if (userCoupon && userCoupon.used) {
      return { error: "Ya has usado este cupón" }
    }

    return {
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount: coupon.discount,
      },
    }
  } catch (error) {
    console.error("[v0] Error al validar cupón:", error)
    return { error: "Error al validar cupón" }
  }
}

export async function getCouponByUser() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return { error: 'No autorizado' }
    }

    const coupons = await prisma.coupon.findMany({
      where: {
        used_by: {
          some: {
            user_id: session.user.id,
          },
        },
        active: true
      },
      include: {
        used_by: {
          where: { user_id: session.user.id },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });


    const codes = coupons? coupons.map(c => c.code) : []

    return {success:true, couponsCodes:codes};
  } catch (error) {
    console.error('Error al obtener cupones:', error);
    return{ error: 'Error al obtener los cupones' }
  }
}

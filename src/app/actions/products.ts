"use server"

import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"
import { revalidatePath } from "next/cache"
import { handleSubmitImage } from "@/lib/image"

interface ProductData {
  name: string
  description: string
  price: number
  image: File | null
  category: string | null
  available: boolean
}

export async function createProduct(productData: ProductData) {
  await requireAuth()

  // Validación de entrada para prevenir inyecciones
  if (!productData.name || typeof productData.name !== "string") {
    throw new Error("Nombre inválido")
  }

  if (!productData.description || typeof productData.description !== "string") {
    throw new Error("Descripción inválida")
  }

  if (!productData.price || productData.price <= 0) {
    throw new Error("Precio inválido")
  }

  const image_url = productData.image ? await handleSubmitImage(productData.image) : ''

  try {
    await prisma.product.create({
      data: {
        name: productData.name,
        description: productData.description,
        price_in_cents: productData.price / 100,
        image_url: image_url,
        category: productData.category,
        available: productData.available,
      },
    })

    revalidatePath("/")
    revalidatePath("/admin")
  } catch (error) {
    console.error("[v0] Error al crear producto:", error)
    throw error
  }
}

export async function updateProduct(productId: string, productData: ProductData) {
  await requireAuth()

  // Validación de entrada
  if (!productId || typeof productId !== "string") {
    throw new Error("ID de producto inválido")
  }

  if (!productData.name || typeof productData.name !== "string") {
    throw new Error("Nombre inválido")
  }

  if (!productData.description || typeof productData.description !== "string") {
    throw new Error("Descripción inválida")
  }

  if (!productData.price || productData.price <= 0) {
    throw new Error("Precio inválido")
  }

  const image_url = !productData.image ? await handleSubmitImage(productData.image) : ''

  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: productData.name,
        description: productData.description,
        price_in_cents: productData.price / 100,
        image_url: image_url,
        category: productData.category,
        available: productData.available,
      },
    })

    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath(`/products/${productId}`)
  } catch (error) {
    console.error("[v0] Error al actualizar producto:", error)
    throw error
  }
}

export async function deleteProduct(productId: string) {
  await requireAuth()

  // Validación de entrada
  if (!productId || typeof productId !== "string") {
    throw new Error("ID de producto inválido")
  }

  try {
    await prisma.product.delete({
      where: { id: productId },
    })

    revalidatePath("/")
    revalidatePath("/admin")
  } catch (error) {
    console.error("[v0] Error al eliminar producto:", error)
    throw error
  }
}

export async function toggleProductAvailability(productId: string, available: boolean) {
  await requireAuth()

  // Validación de entrada
  if (!productId || typeof productId !== "string") {
    throw new Error("ID de producto inválido")
  }

  if (typeof available !== "boolean") {
    throw new Error("Estado de disponibilidad inválido")
  }

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { available },
    })

    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath(`/products/${productId}`)
  } catch (error) {
    console.error("[v0] Error al cambiar disponibilidad:", error)
    throw error
  }
}

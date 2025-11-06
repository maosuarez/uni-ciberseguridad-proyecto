"use server"

import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import path from "path"
import fs from "fs/promises"

interface ProductData {
  name: string
  description: string
  price: number
  image: File | null
  category: string | null
  available: boolean
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function handleSubmitImage(file: File | null) {
  if (!file) {
    throw new Error("No se seleccionó ningún archivo.")
  }

  // Validar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Tipo de archivo no permitido.")
  }

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("El archivo excede el tamaño máximo permitido (5MB).")
  }

  // Sanitizar nombre
  const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const ext = path.extname(originalName).toLowerCase()

  // Validar extensión
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error("Extensión de archivo no permitida.")
  }

  // Generar nombre único y ruta segura
  const safeName = `${Date.now()}-${randomUUID()}${ext}`
  const uploadDir = path.join(process.cwd(), "public", "uploads")
  const filePath = path.join(uploadDir, safeName)

  // Evitar traversal
  if (!filePath.startsWith(uploadDir)) {
    throw new Error("Ruta de archivo inválida.")
  }

  await fs.mkdir(uploadDir, { recursive: true })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  await fs.writeFile(filePath, buffer, { flag: "wx" }) // evita sobrescritura

  // Generar ruta pública
  const publicPath = `/uploads/${safeName}`

  // Registrar en BD
  const imageRecord = await prisma.image.create({
    data: {
      name: originalName,
      path: publicPath,
    },
  })

  return imageRecord.path
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

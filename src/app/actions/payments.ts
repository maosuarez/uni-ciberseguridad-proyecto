"use server"

import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"
import crypto from "crypto"
import { redirect } from "next/navigation"
import type { Cart } from "@/lib/types"

interface CardData {
  cardHolder: string
  cardNumber: string
  expiration: string
  cvv: string
}

// Validar número de tarjeta usando algoritmo de Luhn
function validateCardNumber(cardNumber: string): boolean {
  const numbers = cardNumber.replace(/\D/g, "")
  if (numbers.length < 13 || numbers.length > 19) return false

  let sum = 0
  let isEven = false
  for (let i = numbers.length - 1; i >= 0; i--) {
    let digit = parseInt(numbers[i])
    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    isEven = !isEven
  }
  return sum % 10 === 0
}

// Validar fecha de expiración
function validateExpiration(expiration: string): boolean {
  const parts = expiration.split("/")
  if (parts.length !== 2) return false
  const month = parseInt(parts[0])
  const year = parseInt(parts[1])
  if (month < 1 || month > 12) return false
  const currentYear = new Date().getFullYear() % 100
  const currentMonth = new Date().getMonth() + 1
  if (year < currentYear || (year === currentYear && month < currentMonth)) return false
  return true
}

// Validar CVV
function validateCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv)
}

// Enmascarar número de tarjeta (mostrar solo últimos 4 dígitos)
function maskCardNumber(cardNumber: string): string {
  const numbers = cardNumber.replace(/\D/g, "")
  if (numbers.length < 4) return "****"
  return `****${numbers.slice(-4)}`
}

// 🔒 Simulador seguro de pasarela de pago local
async function simulatePayment(totalAmount: number, metadata: Record<string, any>, cardData: CardData) {
  if (totalAmount <= 0 || !Number.isFinite(totalAmount)) {
    throw new Error("Monto inválido")
  }

  // Validar datos de tarjeta antes de procesar
  if (!validateCardNumber(cardData.cardNumber)) {
    throw new Error("Número de tarjeta inválido")
  }

  if (!validateExpiration(cardData.expiration)) {
    throw new Error("Fecha de expiración inválida o vencida")
  }

  if (!validateCVV(cardData.cvv)) {
    throw new Error("CVV inválido")
  }

  // Simular rechazo de tarjetas que terminan en 0000 (para pruebas)
  if (cardData.cardNumber.endsWith("0000")) {
    return {
      id: crypto.randomUUID(),
      client_secret: crypto.randomBytes(16).toString("hex"),
      amount: totalAmount,
      status: "failed",
      metadata,
    }
  }

  // Tiempo simulado de procesamiento
  await new Promise((r) => setTimeout(r, 1500))

  return {
    id: crypto.randomUUID(),
    client_secret: crypto.randomBytes(16).toString("hex"),
    amount: totalAmount,
    status: "succeeded",
    metadata,
  }
}

export async function createCheckoutSession(
  totalAmount: number,
  cartId: string,
  cardData?: CardData
) {
  const user = await requireAuth()

  if (!cartId || typeof cartId !== "string") throw new Error("ID de carrito inválido")
  if (!totalAmount || totalAmount <= 0) throw new Error("Monto inválido")

  // Validar datos de tarjeta si se proporcionan
  if (cardData) {
    if (!cardData.cardHolder?.trim()) {
      throw new Error("El nombre del titular es requerido")
    }
    if (!cardData.cardNumber?.trim()) {
      throw new Error("El número de tarjeta es requerido")
    }
    if (!cardData.expiration?.trim()) {
      throw new Error("La fecha de expiración es requerida")
    }
    if (!cardData.cvv?.trim()) {
      throw new Error("El CVV es requerido")
    }
  } else {
    throw new Error("Los datos de la tarjeta son requeridos")
  }

  try {
    const cart: Cart | null = await prisma.cart.findUnique({
      where: { id: cartId, user_id: user.id },
      include: { cart_items: { include: { product: true } } },
    })

    if (!cart || !cart.cart_items?.length) throw new Error("Carrito vacío")

    const unavailableItems = cart.cart_items.filter((item) => !item.product?.available)
    if (unavailableItems.length > 0) throw new Error("Algunos productos ya no están disponibles")

    // 🧾 Crear orden y sus ítems
    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newOrder = await tx.order.create({
        data: {
          user_id: user.id,
          total_amount_in_cents: Math.round(totalAmount), // totalAmount ya está en centavos
          status: "pending",
        },
      })

      await tx.orderItem.createMany({
        data:
          cart.cart_items?.map((item) => ({
            product_name: item.product?.name || "Indefinido",
            order_id: newOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            product_price_in_cents: item.product?.price_in_cents ?? 0,
          })) ?? [],
      })

      return newOrder
    })

    // 💳 Simular pago con validación de tarjeta
    const session = await simulatePayment(
      totalAmount,
      {
        order_id: order.id,
        user_id: user.id,
      },
      cardData
    )

    // Guardar información de pago en la base de datos
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Actualizar orden con estado y payment intent id
      await tx.order.update({
        where: { id: order.id },
        data: {
          stripe_payment_intent_id: session.id,
          status: session.status === "succeeded" ? "completed" : "failed",
        },
      })

      // Guardar registro de pago (con número de tarjeta enmascarado)
      await tx.payment.create({
        data: {
          order_id: order.id,
          card_holder: cardData.cardHolder,
          card_number: maskCardNumber(cardData.cardNumber), // Guardar solo últimos 4 dígitos
          expiration: cardData.expiration,
          cvv: "***", // No guardar CVV por seguridad
          status: session.status === "succeeded" ? "succeeded" : "failed",
        },
      })
    })

    // ✅ Devolver info al cliente
    return {
      client_secret: session.client_secret,
      order_id: order.id,
      status: session.status,
    }
  } catch (error) {
    console.error("[mock-payments] Error al crear sesión de pago:", error)
    throw error
  }
}

export async function completeOrder(orderId: string) {
  const user = await requireAuth()
  if (!orderId || typeof orderId !== "string") throw new Error("ID de orden inválido")

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const order = await tx.order.findUnique({
        where: { id: orderId, user_id: user.id },
      })
      if (!order) throw new Error("Orden no encontrada")

      await tx.order.update({
        where: { id: orderId },
        data: { status: "completed" },
      })

      const cart = await tx.cart.findUnique({ where: { user_id: user.id } })
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cart_id: cart.id } })
      }
    })

    redirect("/orders")
  } catch (error) {
    console.error("[mock-payments] Error al completar orden:", error)
    throw error
  }
}

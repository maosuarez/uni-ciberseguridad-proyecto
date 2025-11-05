"use server"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"
import { revalidatePath } from "next/cache"
import { Cart } from "@/lib/types"

/*
  Funciones para la actualizacion y ajuste de los items en el carrito.

  - addToCart: Recibe el id del producto y la cantidad.
              Actualiza el valor de la cantidad del producto 
              o crea uno nuevo en el carro asociado al usuario.

  - updateCartItemQuantity: Actualiza la cantidad de un item en caso
                            de que ya este agregado al carrito

  - removeCartItem: Elimina un item en especifico, para sacarlo del carro
                    por completo
  
  - clearCart: Borra todo lo que haya en el carro, deja el carro vacio

  - applyCouponToCart: Aplicar los descuentos del cupon a un carrito
*/

export async function addToCart(productId: string, quantity: number) {
  const user = await requireAuth()

  // Validación de entrada para prevenir inyecciones
  if (!productId || typeof productId !== "string") {
    throw new Error("ID de producto inválido")
  }
  // Validacion en la cantidad del producto
  if (!quantity || quantity < 1 || !Number.isInteger(quantity)) {
    throw new Error("Cantidad inválida")
  }
  // Transaccion para la base de datos
  try {
    await prisma.$transaction(async (tx:Prisma.TransactionClient) => {
      // Verificar que el producto existe y está disponible
      const product = await tx.product.findUnique({
        where: { id: productId },
      })

      if (!product || !product.available) {
        throw new Error("Producto no disponible")
      }

      // Obtener o crear carrito asociado al usuario
      let cart: Cart | null = await tx.cart.findUnique({
        where: { user_id: user.id },
      })
 
      if (!cart) {
        cart = await tx.cart.create({
          data: { user_id: user.id },
        })
      }

      // Verificar si el item ya existe en el carrito
      const existingItem = await tx.cartItem.findUnique({
        where: {
          cart_id_product_id: {
            cart_id: cart.id,
            product_id: productId,
          },
        },
      })

      if (existingItem) {
        // Actualizar cantidad
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        })
      } else {
        // Crear nuevo item
        await tx.cartItem.create({
          data: {
            cart_id: cart.id,
            product_id: productId,
            quantity,
          },
        })
      }
    })

    revalidatePath("/")
    revalidatePath("/cart")
  } catch (error) {
    console.error("[v0] Error al agregar al carrito:", error)
    throw error
  }
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  const user = await requireAuth()

  // Validación de entrada
  if (!cartItemId || typeof cartItemId !== "string") {
    throw new Error("ID de item inválido")
  }

  if (quantity < 1 || !Number.isInteger(quantity)) {
    throw new Error("La cantidad debe ser al menos 1")
  }
  // Transaccion para actualizar la base de datos
  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    })

    if (!cartItem || cartItem.cart.user_id !== user.id) {
      throw new Error("Item no encontrado o no autorizado")
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    })

    revalidatePath("/cart")
  } catch (error) {
    console.error("[v0] Error al actualizar cantidad:", error)
    throw error
  }
}

export async function removeCartItem(cartItemId: string) {
  const user = await requireAuth()

  // Validación de entrada
  if (!cartItemId || typeof cartItemId !== "string") {
    throw new Error("ID de item inválido")
  }

  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    })

    if (!cartItem || cartItem.cart.user_id !== user.id) {
      throw new Error("Item no encontrado o no autorizado")
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    })

    revalidatePath("/cart")
  } catch (error) {
    console.error("[v0] Error al eliminar item:", error)
    throw error
  }
}

export async function clearCart() {
  const user = await requireAuth()

  try {
    const cart = await prisma.cart.findUnique({
      where: { user_id: user.id },
    })

    if (!cart) return

    await prisma.cartItem.deleteMany({
      where: { cart_id: cart.id },
    })

    revalidatePath("/cart")
  } catch (error) {
    console.error("[v0] Error al limpiar carrito:", error)
    throw error
  }
}

export async function applyCouponToCart(couponCode: string) {
  const user = await requireAuth()

  if (!couponCode || typeof couponCode !== "string") {
    throw new Error("Código de cupón inválido")
  }

  try {
    const { validateCoupon } = await import("./coupons")
    const validation = await validateCoupon(couponCode, user.id)

    if (validation.error) {
      return { error: validation.error }
    }

    // Guardar el cupón aplicado en la sesión o base de datos
    // Por ahora lo retornamos para usarlo en el frontend
    return {
      success: true,
      coupon: validation.coupon,
    }
  } catch (error) {
    console.error("[v0] Error al aplicar cupón:", error)
    return { error: "Error al aplicar cupón" }
  }
}

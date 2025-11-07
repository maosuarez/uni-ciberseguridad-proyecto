"use client"

import { useState } from "react"
import { redirect, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createCheckoutSession } from "@/app/actions/payments"

interface CheckoutButtonProps {
  totalAmount: number
  cartId: string
}

export function CheckoutButton({ totalAmount, cartId }: CheckoutButtonProps) {
  const router = useRouter()
  const [press, setPress] = useState(false)

  async function handleConfirm() {
    setPress(true)
    try {
      const result = await createCheckoutSession(totalAmount, cartId)

      if (!result) throw new Error("Error al crear la sesión de pago")

      // Simulación de carga de pago
      await new Promise((res) => setTimeout(res, 3000))
 
      if (result.status === "succeeded") {
        redirect(`/checkout/success?orderId=${encodeURIComponent(result.order_id)}`)
      } else {
        redirect("/checkout/cancel")
      }
    } catch (error) {
      console.error("Error al confirmar pago:", error)
      redirect("/checkout/cancel")
    } finally {
      setPress(false)
    }
  }

  return (
    <Button
      onClick={handleConfirm}
      className="w-full bg-amber-600 hover:bg-amber-700 text-lg py-6"
      disabled={press}
    >
      {press ? "Confirmando..." : "Confirmar pago"}
    </Button>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createCheckoutSession } from "@/app/actions/payments"

interface CardData {
  cardHolder: string
  cardNumber: string
  expiration: string
  cvv: string
}

interface CheckoutButtonProps {
  totalAmount: number
  cartId: string
  cardData: CardData
  onValidate: () => boolean
}

export function CheckoutButton({ totalAmount, cartId, cardData, onValidate }: CheckoutButtonProps) {
  const router = useRouter()
  const [press, setPress] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    // Validar formulario antes de procesar
    if (!onValidate()) {
      setError("Por favor, completa todos los campos correctamente")
      return
    }

    setPress(true)
    setError(null)

    try {
      const result = await createCheckoutSession(totalAmount, cartId, {
        cardHolder: cardData.cardHolder,
        cardNumber: cardData.cardNumber.replace(/\s/g, ""), // Remover espacios
        expiration: cardData.expiration,
        cvv: cardData.cvv,
      })

      if (!result) throw new Error("Error al crear la sesión de pago")

      // Simulación de carga de pago
      await new Promise((res) => setTimeout(res, 2000))

      if (result.status === "succeeded") {
        router.push(`/checkout/success?order_id=${encodeURIComponent(result.order_id)}`)
      } else {
        router.push("/checkout/cancel")
      }
    } catch (error) {
      console.error("Error al confirmar pago:", error)
      setError(error instanceof Error ? error.message : "Error al procesar el pago")
      setPress(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      <Button
        onClick={handleConfirm}
        className="w-full bg-amber-600 hover:bg-amber-700 text-lg py-6"
        disabled={press}
      >
        {press ? "Confirmando..." : "Confirmar pago"}
      </Button>
    </div>
  )
}

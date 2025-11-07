"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatPrice } from "@/lib/utils/format"
import { CheckoutButton } from "./checkout-button"

interface CheckoutFormProps {
  totalAmount: number
  cartId: string
}

interface CardData {
  cardHolder: string
  cardNumber: string
  expiration: string
  cvv: string
}

export function CheckoutForm({ totalAmount, cartId }: CheckoutFormProps) {
  const [cardData, setCardData] = useState<CardData>({
    cardHolder: "",
    cardNumber: "",
    expiration: "",
    cvv: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CardData, string>>>({})

  const formatCardNumber = (value: string) => {
    // Remover todos los espacios y caracteres no numéricos
    const numbers = value.replace(/\D/g, "")
    // Agregar espacios cada 4 dígitos
    return numbers.match(/.{1,4}/g)?.join(" ") || numbers
  }

  const formatExpiration = (value: string) => {
    // Remover todo excepto números
    const numbers = value.replace(/\D/g, "")
    // Agregar / después de 2 dígitos
    if (numbers.length >= 2) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`
    }
    return numbers
  }

  const validateCardNumber = (cardNumber: string): boolean => {
    // Remover espacios
    const numbers = cardNumber.replace(/\s/g, "")
    // Validar que tenga entre 13 y 19 dígitos (tarjetas estándar)
    if (numbers.length < 13 || numbers.length > 19) return false
    // Algoritmo de Luhn
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

  const validateExpiration = (expiration: string): boolean => {
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

  const validateCVV = (cvv: string): boolean => {
    return /^\d{3,4}$/.test(cvv)
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    if (formatted.replace(/\s/g, "").length <= 19) {
      setCardData({ ...cardData, cardNumber: formatted })
      if (errors.cardNumber) {
        setErrors({ ...errors, cardNumber: undefined })
      }
    }
  }

  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiration(e.target.value)
    if (formatted.length <= 5) {
      setCardData({ ...cardData, expiration: formatted })
      if (errors.expiration) {
        setErrors({ ...errors, expiration: undefined })
      }
    }
  }

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    if (value.length <= 4) {
      setCardData({ ...cardData, cvv: value })
      if (errors.cvv) {
        setErrors({ ...errors, cvv: undefined })
      }
    }
  }

  const handleCardHolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardData({ ...cardData, cardHolder: e.target.value })
    if (errors.cardHolder) {
      setErrors({ ...errors, cardHolder: undefined })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CardData, string>> = {}

    if (!cardData.cardHolder.trim()) {
      newErrors.cardHolder = "El nombre es requerido"
    }

    if (!cardData.cardNumber.trim()) {
      newErrors.cardNumber = "El número de tarjeta es requerido"
    } else if (!validateCardNumber(cardData.cardNumber)) {
      newErrors.cardNumber = "Número de tarjeta inválido"
    }

    if (!cardData.expiration.trim()) {
      newErrors.expiration = "La fecha de expiración es requerida"
    } else if (!validateExpiration(cardData.expiration)) {
      newErrors.expiration = "Fecha de expiración inválida o vencida"
    }

    if (!cardData.cvv.trim()) {
      newErrors.cvv = "El CVV es requerido"
    } else if (!validateCVV(cardData.cvv)) {
      newErrors.cvv = "CVV inválido (3 o 4 dígitos)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return (
    <div id="checkout" className="flex justify-center items-center">
      <div className="space-y-4 w-full">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre en la tarjeta</Label>
          <Input
            id="name"
            placeholder="Juan Perez"
            value={cardData.cardHolder}
            onChange={handleCardHolderChange}
            className={errors.cardHolder ? "border-red-500" : ""}
          />
          {errors.cardHolder && (
            <p className="text-sm text-red-500">{errors.cardHolder}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="card">Número de tarjeta</Label>
          <Input
            id="card"
            placeholder="4242 4242 4242 4242"
            maxLength={19}
            value={cardData.cardNumber}
            onChange={handleCardNumberChange}
            className={errors.cardNumber ? "border-red-500" : ""}
          />
          {errors.cardNumber && (
            <p className="text-sm text-red-500">{errors.cardNumber}</p>
          )}
        </div>

        <div className="flex space-x-2">
          <div className="flex-1 space-y-2">
            <Label htmlFor="exp">Expira</Label>
            <Input
              id="exp"
              placeholder="12/28"
              maxLength={5}
              value={cardData.expiration}
              onChange={handleExpirationChange}
              className={errors.expiration ? "border-red-500" : ""}
            />
            {errors.expiration && (
              <p className="text-sm text-red-500">{errors.expiration}</p>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              placeholder="123"
              maxLength={4}
              type="password"
              value={cardData.cvv}
              onChange={handleCVVChange}
              className={errors.cvv ? "border-red-500" : ""}
            />
            {errors.cvv && (
              <p className="text-sm text-red-500">{errors.cvv}</p>
            )}
          </div>
        </div>

        <div className="my-4 h-px bg-gray-200" />

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Total:</p>
          <p className="text-lg font-semibold">{formatPrice(totalAmount)}</p>
        </div>

        <CheckoutButton
          totalAmount={totalAmount}
          cartId={cartId}
          cardData={cardData}
          onValidate={validateForm}
        />
      </div>
    </div>
  )
}
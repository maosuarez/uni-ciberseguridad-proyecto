'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CouponSection } from "@/components/coupon-section"
import { formatPrice } from "@/lib/utils/format"
import Link from "next/link"

interface CartItem {
  id: string
  quantity: number
  product: {
    price_in_cents: number
  }
}

interface CartSummaryProps {
  cartItems: CartItem[]
}

export function CartSummary({ cartItems }: CartSummaryProps) {
  const [appliedCoupon, setAppliedCoupon] = useState<{ 
    code: string
    discount: number 
  } | null>(null)

  // Calcular subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + Number(item.product?.price_in_cents) * item.quantity
  }, 0)

  // Calcular descuento del cupón
  const discountAmount = appliedCoupon 
    ? Math.round(subtotal * (appliedCoupon.discount / 100))
    : 0

  // Subtotal después del descuento
  const subtotalAfterDiscount = subtotal - discountAmount

  // Calcular IVA sobre el subtotal con descuento
  const tax = Math.round(subtotalAfterDiscount * 0.19) // 19% IVA

  // Total final
  const total = subtotalAfterDiscount + tax

  const handleCouponApplied = (coupon: { code: string; discount: number }) => {
    setAppliedCoupon(coupon)
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
  }

  return (
    <div className="space-y-4 sticky top-20">
      <CouponSection 
        onCouponApplied={handleCouponApplied}
        appliedCoupon={appliedCoupon}
        onRemoveCoupon={handleRemoveCoupon}
      />
      
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="text-2xl text-amber-900">Resumen del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>

            {appliedCoupon && (
              <>
                <div className="flex justify-between text-sm text-green-600">
                  <span className="font-medium">
                    Descuento ({appliedCoupon.discount}%)
                  </span>
                  <span className="font-medium">
                    -{formatPrice(discountAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-amber-100 pt-2">
                  <span className="text-muted-foreground">Subtotal con descuento</span>
                  <span className="font-medium">{formatPrice(subtotalAfterDiscount)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IVA (19%)</span>
              <span className="font-medium">{formatPrice(tax)}</span>
            </div>

            <div className="border-t border-amber-200 pt-2">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-amber-900">Total</span>
                <span className="text-2xl font-bold text-amber-900">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {appliedCoupon && (
              <div className="text-xs text-green-600 text-center">
                ¡Ahorraste {formatPrice(discountAmount)}!
              </div>
            )}
          </div>

          <Button asChild className="w-full bg-amber-600 hover:bg-amber-700 text-lg py-6">
            <Link href="/checkout">Proceder al Pago</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full border-amber-200 hover:bg-amber-50 bg-transparent"
          >
            <Link href="/">Continuar Comprando</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
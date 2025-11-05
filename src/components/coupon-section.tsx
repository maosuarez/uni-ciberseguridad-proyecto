"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Check, Tag, X } from "lucide-react"
import { applyCouponToCart } from "@/app/actions/cart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge'
import { getCouponByUser } from "@/app/actions/coupons"

interface CouponSectionProps {
  onCouponApplied: (coupon: { code: string; discount: number}) => void
  appliedCoupon: { code: string; discount: number } | null
  onRemoveCoupon?: () => void
}


export function CouponSection({ 
  onCouponApplied, 
  appliedCoupon,
  onRemoveCoupon 
}: CouponSectionProps) {
  const [couponCode, setCouponCode] = useState("")
  const [coupons, setCoupons] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setMessage({ type: "error", text: "Ingresa un código de cupón" })
      return
    }

    setLoading(true)
    try {
      const result = await applyCouponToCart(couponCode)

      if (result.error || !result.coupon) {
        setMessage({ type: "error", text: result.error || 'Error'})
      } else {
        setMessage({
          type: "success",
          text: `Cupón aplicado: ${result.coupon?.discount}% de descuento`,
        })
        setCouponCode("")
        onCouponApplied({
          code: result.coupon?.code,
          discount: result.coupon?.discount,
        })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al aplicar el cupón" })
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    if (onRemoveCoupon) {
      onRemoveCoupon()
      setMessage({
        type: 'success',
        text: "Cupón removido"
      })
    }
  }

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const response = await getCouponByUser();

        if(response.error || response.couponsCodes == undefined){
          setCoupons([])
          return
        }
        setCoupons(response.couponsCodes);
      } catch (err) {
        console.error('Error:', err);
        setCoupons([])
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  if (appliedCoupon) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Tag className="h-5 w-5" />
            Cupón Aplicado
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {appliedCoupon.code}
              </Badge>
              <span className="text-sm text-green-700 font-medium">
                {appliedCoupon.discount}% descuento
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-8 w-8 p-0 hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Tag className="h-5 w-5" />
          Aplicar Cupón
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Select value={couponCode} onValueChange={setCouponCode}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un framework" />
              </SelectTrigger>
              <SelectContent>
                {coupons.map( c => {
                  return <SelectItem key={c} value={c}>{c}</SelectItem>
                })}
              </SelectContent>
            </Select>
          <Button
            onClick={handleApplyCoupon}
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            {loading ? "Validando..." : "Aplicar Cupón"}
          </Button>
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-md ${
              message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{message.text}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

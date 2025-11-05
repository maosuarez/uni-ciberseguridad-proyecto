"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createCoupon } from "@/app/actions/coupons"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export function CouponForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const result = await createCoupon(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push("/admin/coupons")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Cupón</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="code">Código del Cupón</Label>
            <Input id="code" name="code" placeholder="VERANO2024" required className="font-mono" />
            <p className="text-xs text-muted-foreground">Deja vacío para generar automáticamente</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">Descuento (%)</Label>
            <Input
              id="discount"
              name="discount"
              type="number"
              min="1"
              max="100"
              step="0.01"
              placeholder="15"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" placeholder="Cupón de descuento para..." rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Fecha de Expiración (Opcional)</Label>
            <Input id="expiresAt" name="expiresAt" type="date" min={new Date().toISOString().split("T")[0]} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxUses">Máximo de Usos (Opcional)</Label>
            <Input id="maxUses" name="maxUses" type="number" min="1" placeholder="Ilimitado" />
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">{error}</div>}

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Crear Cupón
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { deleteCoupon, toggleCouponStatus } from "@/app/actions/coupons"
import { useRouter } from "next/navigation"
import { Coupon } from "@/lib/types"

/*
interface Coupon {
  id: string
  code: string
  discount: number
  description: string | null
  expiresAt: Date | null
  maxUses: number | null
  usedCount: number
  active: boolean
  createdAt: Date
  _count: {
    userCoupons: number
  }
}
*/

export function CouponManagementTable({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleDelete = async (couponId: string) => {
    if (!confirm("¿Estás seguro de eliminar este cupón?")) return

    setLoading(couponId)
    await deleteCoupon(couponId)
    router.refresh()
    setLoading(null)
  }

  const handleToggleStatus = async (couponId: string) => {
    setLoading(couponId)
    await toggleCouponStatus(couponId)
    router.refresh()
    setLoading(null)
  }

  const isExpired = (expiresAt: Date | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Descuento</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Usos</TableHead>
            <TableHead>Expira</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
              <TableCell>{coupon.discount}%</TableCell>
              <TableCell>{coupon.description || "-"}</TableCell>
              <TableCell>
                {coupon.usedCount} / {coupon.maxUses || "∞"}
                <span className="text-xs text-muted-foreground ml-2">({coupon._count?.used_by} asignados)</span>
              </TableCell>
              <TableCell>
                {coupon.expires_at ? (
                  <span className={isExpired(coupon.expires_at) ? "text-red-500" : ""}>
                    {new Date(coupon.expires_at).toLocaleDateString("es-ES")}
                  </span>
                ) : (
                  "Sin expiración"
                )}
              </TableCell>
              <TableCell>
                {coupon.active && !isExpired(coupon.expires_at==undefined? null:coupon.expires_at) ? (
                  <Badge className="bg-green-500">Activo</Badge>
                ) : (
                  <Badge variant="secondary">Inactivo</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(coupon.id)}
                    disabled={loading === coupon.id}
                  >
                    {coupon.active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(coupon.id)}
                    disabled={loading === coupon.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { CouponManagementTable } from "@/components/coupon-management-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Navbar } from "@/components/navbar"

export default async function CouponsManagementPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    redirect("/")
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { created_at: "desc" },
    include: {
      _count: {
        select: { used_by: true },
      },
    },
  })

  return (

    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-balance">Gestión de Cupones</h1>
            <p className="text-muted-foreground mt-2">Crear y gestionar cupones de descuento</p>
          </div>
          <Button asChild>
            <Link href="/admin/coupons/new">
              <Plus className="w-4 h-4 mr-2" />
              Crear Cupón
            </Link>
          </Button>
        </div>

        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-900">Cupones</CardTitle>
          </CardHeader>
          <CardContent>
            <CouponManagementTable coupons={coupons} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

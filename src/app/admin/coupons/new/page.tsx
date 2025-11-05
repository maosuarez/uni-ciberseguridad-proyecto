import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CouponForm } from "@/components/coupon-form"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewCouponPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="text-2xl text-amber-900">Crear Nuevo Cupon</CardTitle>
              <p className="text-muted-foreground mt-2">Genera un cupón de descuento para tus clientes</p>
            </CardHeader>
            <CardContent>
              <CouponForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

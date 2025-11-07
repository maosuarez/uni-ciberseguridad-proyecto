import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils/format"
import { Package, Calendar, CreditCard } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function OrdersPage() {
  const user = await requireAuth()

  const orders = await prisma.order.findMany({
    where: { user_id: user.id },
    include: {
      order_items: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { created_at: "desc" },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado"
      case "processing":
        return "Procesando"
      case "pending":
        return "Pendiente"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-amber-900">Mis Pedidos</h1>
          <Button asChild variant="outline" className="border-amber-200 hover:bg-amber-50 bg-transparent">
            <Link href="/">Continuar Comprando</Link>
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card className="border-amber-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="h-16 w-16 text-amber-300 mb-4" />
              <h2 className="text-2xl font-semibold text-amber-900 mb-2">No tienes pedidos aún</h2>
              <p className="text-muted-foreground mb-6">Realiza tu primera orden de nuestras deliciosas arepas</p>
              <Button asChild className="bg-amber-600 hover:bg-amber-700">
                <Link href="/">Ver Productos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            
            {orders.map((order: any) => (

              <Card key={order.id} className="border-amber-200">
                <CardHeader className="bg-amber-50/50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-xl text-amber-900">Pedido #{order.id.slice(0, 8)}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(order.created_at).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold text-amber-900">{formatPrice(Number(order.total_amount_in_cents) * 100)}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {order.order_items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center pb-3 border-b border-amber-100 last:border-0"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-amber-900">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-amber-900">
                            {formatPrice(Number(item.product_price_in_cents) * 100 * item.quantity)}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatPrice(Number(item.product_price_in_cents) * 100)} c/u</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.stripe_payment_intent_id && (
                    <div className="mt-4 pt-4 border-t border-amber-200">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        <span>ID de pago: {order.stripe_payment_intent_id.slice(0, 20)}...</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

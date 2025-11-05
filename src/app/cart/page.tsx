import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"
import { Navbar } from "@/components/navbar"
import { CartItemCard } from "@/components/cart-item-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent} from "@/components/ui/card"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Cart } from "@/lib/types"
import { ClearCartButton } from "@/components/clear-cart-button"
import { CartSummary } from "@/components/cart-summary"

export default async function CartPage() {
  const user = await requireAuth()

  const cart: Cart | null = await prisma.cart.findUnique({
    where: { user_id: user.id },
    include: {
      cart_items: {
        include: {
          product: true,
        },
      },
    },
  })

  const cartItems = cart?.cart_items || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-bold text-amber-900">Mi Carrito</h1>
          
          {cartItems.length > 0 && (
            <ClearCartButton/>
          )}
        </div>

        {cartItems.length === 0 ? (
          <Card className="border-amber-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingBag className="h-16 w-16 text-amber-300 mb-4" />
              <h2 className="text-2xl font-semibold text-amber-900 mb-2">Tu carrito está vacío</h2>
              <p className="text-muted-foreground mb-6">Agrega algunas deliciosas arepas para comenzar</p>
              <Button asChild className="bg-amber-600 hover:bg-amber-700">
                <Link href="/">Ver Productos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <CartItemCard key={item.id} item={item as any} />
              ))}
            </div>

            <div className="lg:col-span-1">
              <CartSummary cartItems={cartItems.map(i => {
                return {
                  id: i.id,
                  quantity: i.quantity,
                  product: {
                    price_in_cents: i.product?.price_in_cents || 0
                  }
                }})} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

import Link from "next/link"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ShoppingCart, User, LogOut, Shield, Package } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export async function Navbar() {
  const user = await getCurrentUser()

  let cartItemCount = 0
  if (user) {
    const cart = await prisma.cart.findUnique({
      where: { user_id: user.id },
      include: {
        cart_items: {
          select: {
            quantity: true,
          },
        },
      },
    })

    if (cart?.cart_items) {
      cartItemCount = cart.cart_items.reduce((sum, item) => sum + item.quantity, 0)
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-amber-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-amber-900">Arepabuelas</span>
            <span className="text-xs text-amber-700 -mt-1">de la esquina</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative hover:bg-amber-50">
                  <ShoppingCart className="h-5 w-5 text-amber-900" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-600 text-xs text-white flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-amber-50 relative">
                    <User className="h-5 w-5 text-amber-900" />
                    {user.role === "admin" && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-amber-600">
                        <Shield className="h-2.5 w-2.5" />
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      {user.role === "admin" && (
                        <Badge variant="secondary" className="w-fit mt-1">
                          <Shield className="w-3 h-3 mr-1" />
                          Administrador
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer">
                      <Package className="h-4 w-4 mr-2" />
                      Mis Pedidos
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-muted-foreground">Administración</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Package className="h-4 w-4 mr-2" />
                          Productos
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/users" className="cursor-pointer">
                          <User className="h-4 w-4 mr-2" />
                          Usuarios
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/coupons" className="cursor-pointer">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Cupones
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/api/auth/signout" className="flex w-full items-center gap-2 cursor-pointer">
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesión
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild className="bg-amber-600 hover:bg-amber-700">
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}

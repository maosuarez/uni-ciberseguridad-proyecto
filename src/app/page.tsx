import { prisma } from "@/lib/db"
import { Navbar } from "@/components/navbar"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/types"
import { calculateAverageRating } from "@/lib/utils/format"
// import { useState } from "react"

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { available: true },
    orderBy: { created_at: "desc" },
    include: {
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  })

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)))

  //const [shownProducts, setShownProducts] = useState<Array<Product>>()

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">Bienvenido a Arepabuelas</h1>
          <p className="text-lg text-amber-800 max-w-2xl mx-auto">
            Descubre nuestras deliciosas arepas artesanales hechas con amor y los mejores ingredientes. Tradición y
            sabor en cada bocado.
          </p>
        </div>

        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <span
                  key={category}
                  className="px-4 py-2 rounded-full bg-white border border-amber-200 text-amber-900 text-sm font-medium cursor-pointer"
                >
                  {category}
                </span> 
                )
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const averageRating = calculateAverageRating(product.reviews || [])

            return (
              <ProductCard
                key={product.id}
                product={product as unknown as Product}
                averageRating={averageRating}
                reviewCount={product.reviews?.length || 0}
              />
            )
          })}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No hay productos disponibles en este momento.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-amber-200 bg-white mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Arepabuelas de la Esquina. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

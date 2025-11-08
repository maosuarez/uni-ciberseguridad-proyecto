import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ProductManagementTable } from "@/components/product-management-table";
import type { Product } from "@/lib/types";

export default async function AdminPage() {
  await requireAuth(); // <-- protege la página

  const products = await prisma.product.findMany({
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">Administrar Productos</h1>
            <p className="text-muted-foreground mt-1">Gestiona el catálogo de arepas</p>
          </div>
          <Button asChild className="bg-amber-600 hover:bg-amber-700">
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
            </Link>
          </Button>
        </div>

        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-900">Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductManagementTable products={products as Product[]} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

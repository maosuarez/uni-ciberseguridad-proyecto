"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createProduct, updateProduct } from "@/app/actions/products"
import type { Product } from "@/lib/types"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ProductFormProps {
  product?: Product
}

export function ProductForm({ product }: ProductFormProps) {
  const [name, setName] = useState(product?.name || "")
  const [description, setDescription] = useState(product?.description || "")
  const [priceInCents, setPriceInCents] = useState(product ? product.price_in_cents / 100 : 0)
  const [image, setImage] = useState<File | null>(null)
  const [category, setCategory] = useState(product?.category || "")
  const [available, setAvailable] = useState(product?.available ?? true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (!name || !description || priceInCents <= 0) {
        throw new Error("Por favor completa todos los campos requeridos")
      }

      const productData = {
        name,
        description,
        price: Math.round(priceInCents * 100),
        image: image || null,
        category: category || null,
        available,
      }

      if (product) {
        await updateProduct(product.id, productData)
      } else {
        await createProduct(productData)
      }

      router.push("/admin")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el producto")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">
          Nombre del Producto <span className="text-red-600">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Ej: Arepa Reina Pepiada"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border-amber-200 focus:border-amber-400"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Descripción <span className="text-red-600">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe el producto..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className="border-amber-200 focus:border-amber-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">
            Precio (COP) <span className="text-red-600">*</span>
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={priceInCents || ""}
            onChange={(e) => setPriceInCents(Number.parseFloat(e.target.value) || 0)}
            required
            className="border-amber-200 focus:border-amber-400"
          />
          <p className="text-xs text-muted-foreground">Ingresa el precio en pesos colombianos</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="border-amber-200 focus:border-amber-400">
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Clásicas">Clásicas</SelectItem>
              <SelectItem value="Especiales">Especiales</SelectItem>
              <SelectItem value="Gourmet">Gourmet</SelectItem>
              <SelectItem value="Vegetarianas">Vegetarianas</SelectItem>
              <SelectItem value="Desayuno">Desayuno</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageFile">Imagen</Label>
        <Input
          id="imageFile"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="border-amber-200 focus:border-amber-400"
        />
        <p className="text-xs text-muted-foreground">
          Sube una imagen desde tu dispositivo o déjalo vacío para usar una imagen por defecto
        </p>
      </div>


      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="available"
          checked={available}
          onChange={(e) => setAvailable(e.target.checked)}
          className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
        />
        <Label htmlFor="available" className="cursor-pointer">
          Producto disponible para la venta
        </Label>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button asChild variant="outline" className="flex-1 border-amber-200 hover:bg-amber-50 bg-transparent">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Link>
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1 bg-amber-600 hover:bg-amber-700">
          {isSubmitting ? "Guardando..." : product ? "Actualizar Producto" : "Crear Producto"}
        </Button>
      </div>
    </form>
  )
}

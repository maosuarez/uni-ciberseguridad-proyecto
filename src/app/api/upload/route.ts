import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import { prisma } from "@/lib/db"
import { randomUUID } from "crypto"

// Configuración de seguridad
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("image") as File | null

    if (!file) {
      return NextResponse.json({ error: "No se recibió ninguna imagen." }, { status: 400 })
    }

    // Validar tipo MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de archivo no permitido." }, { status: 400 })
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "El archivo excede el tamaño máximo permitido (5MB)." }, { status: 400 })
    }

    // Sanitizar nombre
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const ext = path.extname(originalName).toLowerCase()

    // Validar extensión
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: "Extensión de archivo no permitida." }, { status: 400 })
    }

    // Generar nombre único y ruta segura
    const safeName = `${Date.now()}-${randomUUID()}${ext}`
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    const filePath = path.join(uploadDir, safeName)

    // Evitar traversal (asegurarse que el path esté dentro de uploads)
    if (!filePath.startsWith(uploadDir)) {
      return NextResponse.json({ error: "Ruta de archivo inválida." }, { status: 400 })
    }

    await fs.mkdir(uploadDir, { recursive: true })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await fs.writeFile(filePath, buffer, { flag: "wx" }) // "wx" evita sobrescritura

    // Generar URL accesible
    const publicPath = `/uploads/${safeName}`

    // Guardar en DB (solo el path)
    const imageRecord = await prisma.image.create({
      data: {
        name: originalName,
        path: publicPath,
      },
    })

    return NextResponse.json({
      success: true,
      image: imageRecord,
    })
  } catch (err: any) {
    console.error("Error subiendo archivo:", err)
    return NextResponse.json(
      { error: "Error interno al procesar la imagen." },
      { status: 500 },
    )
  }
}

